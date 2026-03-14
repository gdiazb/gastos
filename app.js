// Estado global
let expenses = [];
let currentUser = null;
let gapi = window.gapi;

// Speech Recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

// Inicialización del reconocimiento de voz
function initializeSpeechRecognition() {
    if (!SpeechRecognition) {
        console.warn('Speech Recognition no soportado en este navegador');
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.style.display = 'none';
        }document.getElementById('voiceBtn')?.style.display = 'none';
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-CO'; // Español de Colombia

    recognition.onstart = () => {
        isListening = true;
        updateVoiceButtonState();
    };

    recognition.onresult = (event) => {
        let transcript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const isFinal = event.results[i].isFinal;
            transcript += event.results[i][0].transcript;
        }

        // Mostrar transcripción en tiempo real
        document.getElementById('voiceTranscript').textContent = transcript || 'Escuchando...';
        
        if (event.results[event.results.length - 1].isFinal) {
            processVoiceInput(transcript);
        }
    };

    recognition.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error);
        let errorMsg = 'Error: ';
        
        switch(event.error) {
            case 'no-speech':
                errorMsg += 'No se detectó voz. Intenta de nuevo.';
                break;
            case 'network':
                errorMsg += 'Error de red. Verifica tu conexión.';
                break;
            case 'not-allowed':
                errorMsg += 'Permiso denegado. Revisa los permisos de micrófono.';
                break;
            default:
                errorMsg += event.error;
        }
        
        document.getElementById('voiceTranscript').textContent = errorMsg;
    };

    recognition.onend = () => {
        isListening = false;
        updateVoiceButtonState();
    };
}

function toggleVoiceRecording() {
    if (!recognition) {
        showAlert('Speech Recognition no disponible', 'error');
        return;
    }

    if (isListening) {
        recognition.stop();
    } else {
        document.getElementById('voiceTranscript').textContent = 'Escuchando...';
        recognition.start();
    }
}

function updateVoiceButtonState() {
    const btn = document.getElementById('voiceBtn');
    if (isListening) {
        btn.classList.add('recording');
        btn.innerHTML = '🛑 Deteniendo...';
    } else {
        btn.classList.remove('recording');
        btn.innerHTML = '🎤 Dictar Gastos';
    }
}

function processVoiceInput(transcript) {
    // Limpiar el transcript
    const text = transcript.toLowerCase().trim();
    
    // Detectar quién pagó al inicio
    let paidBy = 'Yo'; // por defecto
    
    // Patrones para detectar quién pagó
    const esposoPatterns = [
        /^(mi\s+)?esposo/,
        /^(mi\s+)?pareja/,
        /^él/,
        /^mi\s+novio/,
        /^mi\s+marido/
    ];
    
    const yoPatterns = [
        /^yo\s+pago/,
        /^yo\s+gasto/,
        /^yo/,
        /^pagué/,
        /^gasté/
    ];
    
    // Detectar patrón de esposo
    if (esposoPatterns.some(p => p.test(text))) {
        paidBy = 'Mi pareja';
    } 
    // Detectar patrón de yo
    else if (yoPatterns.some(p => p.test(text))) {
        paidBy = 'Yo';
    }
    
    // Remover el prefijo de quién pagó para procesar los gastos
    let cleanText = text;
    cleanText = cleanText.replace(/^(mi\s+)?esposo\s+/, '');
    cleanText = cleanText.replace(/^(mi\s+)?pareja\s+/, '');
    cleanText = cleanText.replace(/^él\s+/, '');
    cleanText = cleanText.replace(/^(mi\s+)?novio\s+/, '');
    cleanText = cleanText.replace(/^(mi\s+)?marido\s+/, '');
    cleanText = cleanText.replace(/^yo\s+(pago|gasto)\s+/, '');
    cleanText = cleanText.replace(/^yo\s+/, '');
    cleanText = cleanText.replace(/^(pagué|gasté)\s+/, '');
    
    // Patrón: "concepto $cantidad"
    // Ejemplos: "cine $20000", "cinerol $20.000", "gaseosa $3000"
    const pattern = /([a-záéíóúñ\s]+?)\s*\$?\s*([\d.,]+)/gi;
    const matches = [];
    let match;

    while ((match = pattern.exec(cleanText)) !== null) {
        const concept = match[1].trim();
        const amount = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
        
        if (concept && amount > 0) {
            matches.push({ concept, amount, paidBy });
        }
    }

    if (matches.length === 0) {
        showAlert('No detecté gastos en tu grabación. Intenta: "cine $20000, gaseosa $3000"', 'warning');
        return;
    }

    // Crear modal de confirmación
    showVoiceConfirmation(matches);
}

function showVoiceConfirmation(items) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    // Modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--surface);
        border-radius: 16px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: var(--shadow-lg);
        animation: slideUp 0.3s ease;
    `;

    let content = `
        <h2 style="margin: 0 0 16px; color: var(--text-primary); font-size: 20px;">
            🎤 Gastos Detectados
        </h2>
        <p style="color: var(--text-secondary); margin: 0 0 16px; font-size: 14px;">
            Confirmamos estos gastos. ¿Son correctos?
        </p>
        <div style="background: var(--background); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
    `;

    let total = 0;
    let totalYo = 0;
    let totalPareja = 0;
    
    items.forEach((item, index) => {
        total += item.amount;
        if (item.paidBy === 'Yo') {
            totalYo += item.amount;
        } else {
            totalPareja += item.amount;
        }
        
        const badgeColor = item.paidBy === 'Yo' ? '#dbeafe' : '#fed7aa';
        const badgeTextColor = item.paidBy === 'Yo' ? '#1e40af' : '#92400e';
        
        content += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                <div style="flex: 1;">
                    <div style="color: var(--text-primary); font-weight: 500; text-transform: capitalize; margin-bottom: 4px;">
                        ${item.concept}
                    </div>
                    <div style="
                        display: inline-block;
                        padding: 4px 8px;
                        background: ${badgeColor};
                        color: ${badgeTextColor};
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                    ">
                        ${item.paidBy === 'Yo' ? '👤 Yo' : '👥 Mi pareja'}
                    </div>
                </div>
                <span style="color: var(--primary-color); font-weight: 600; margin-left: 12px;">
                    ${formatCurrency(item.amount)}
                </span>
            </div>
        `;
    });

    content += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px 0; margin-top: 8px; border-top: 2px solid var(--primary-color);">
                <div>
                    <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">👤 Tu total</div>
                    <div style="color: #1e40af; font-weight: 700; font-size: 16px;">
                        ${formatCurrency(totalYo)}
                    </div>
                </div>
                <div>
                    <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">👥 Su total</div>
                    <div style="color: #92400e; font-weight: 700; font-size: 16px;">
                        ${formatCurrency(totalPareja)}
                    </div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; margin-top: 4px; font-size: 14px;">
                <span style="color: var(--text-primary); font-weight: 700;">Total General</span>
                <span style="color: var(--primary-color); font-weight: 700; font-size: 16px;">
                    ${formatCurrency(total)}
                </span>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <button onclick="cancelVoiceConfirmation()" style="
                padding: 12px;
                background: var(--border-color);
                color: var(--text-primary);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.3s;
            " onmouseover="this.style.background='#cbd5e1'" onmouseout="this.style.background='var(--border-color)'">
                Cancelar
            </button>
            <button onclick="addVoiceExpenses(${JSON.stringify(items).replace(/"/g, '&quot;')})" style="
                padding: 12px;
                background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.3s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                ✅ Confirmar
            </button>
        </div>
    `;

    modal.innerHTML = content;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

function cancelVoiceConfirmation() {
    document.body.querySelector('[style*="fadeIn"]')?.remove();
}

function addVoiceExpenses(items) {
    const today = new Date().toISOString().split('T')[0];
    
    items.forEach(item => {
        const expense = {
            date: today,
            category: guessCategory(item.concept),
            description: item.concept,
            amount: item.amount,
            paidBy: 'Yo',
            id: Date.now().toString() + Math.random()
        };
        
        expenses.unshift(expense);
    });

    saveDataToLocalStorage();
    refreshUI();
    cancelVoiceConfirmation();
    showAlert(`✅ Agregados ${items.length} gasto${items.length > 1 ? 's' : ''} correctamente`, 'success');
    
    // Scroll a la tabla
    document.querySelector('.table-section')?.scrollIntoView({ behavior: 'smooth' });
}

function guessCategory(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('cine') || desc.includes('película') || desc.includes('cinema')) return 'Entretenimiento';
    if (desc.includes('gaseosa') || desc.includes('café') || desc.includes('comida') || desc.includes('burger') || desc.includes('pizza')) return 'Comida';
    if (desc.includes('taxi') || desc.includes('uber') || desc.includes('transporte') || desc.includes('gasolina') || desc.includes('bus')) return 'Transporte';
    if (desc.includes('ropa') || desc.includes('zapatos') || desc.includes('compra')) return 'Compras';
    if (desc.includes('doctor') || desc.includes('medicina') || desc.includes('farmacia') || desc.includes('salud')) return 'Salud';
    if (desc.includes('luz') || desc.includes('agua') || desc.includes('internet') || desc.includes('teléfono')) return 'Servicios';
    
    return 'Otro';
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setTodayDate();
    initializeGoogleSignIn();
    initializeSpeechRecognition();
});

// ==================== GOOGLE SIGN IN ====================

function initializeGoogleSignIn() {
    // Información de configuración de cliente
    const clientId = CONFIG.GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === "TU_CLIENT_ID.apps.googleusercontent.com") {
        console.warn("⚠️ CONFIGURACIÓN: Falta configurar GOOGLE_CLIENT_ID en config.js");
        showAlert("Debes configurar tu Google Client ID en config.js", "error");
        return;
    }

    window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        scope: SCOPES.join(' ')
    });

    window.google.accounts.id.renderButton(
        document.getElementById('buttonDiv'),
        {
            theme: 'outline',
            size: 'large',
            text: 'signin_with'
        }
    );

    // Cargar Google API
    gapi.load('client', initializeGoogleAPI);
}

function handleCredentialResponse(response) {
    // Decodificar JWT token
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    
    const user = JSON.parse(jsonPayload);
    currentUser = user.email;
    
    document.getElementById('userEmail').textContent = currentUser;
    document.getElementById('signoutBtn').style.display = 'inline-block';
    document.getElementById('buttonDiv').style.display = 'none';

    // Inicializar API después de autenticarse
    initializeGoogleAPI(response.credential);
}

function initializeGoogleAPI(token) {
    // Aquí se inicializaría la API de Google Sheets
    // Para esta versión, usaremos una alternativa sin backend
    
    // Intenta cargar datos si es posible
    if (typeof gapi !== 'undefined' && gapi.client) {
        loadDataFromSheets(token);
    } else {
        // Fallback: usar localStorage como demostración
        loadDataFromLocalStorage();
    }
}

function signOut() {
    google.accounts.id.disableAutoSelect();
    currentUser = null;
    document.getElementById('userEmail').textContent = '';
    document.getElementById('signoutBtn').style.display = 'none';
    document.getElementById('buttonDiv').style.display = 'block';
    expenses = [];
    refreshUI();
    showAlert('Sesión cerrada', 'success');
}

document.getElementById('signoutBtn')?.addEventListener('click', signOut);

// ==================== GOOGLE SHEETS API ====================

async function loadDataFromSheets(token) {
    try {
        showLoading(true);
        
        // Verificar que la configuración esté completa
        if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID === "TU_ID_AQUI") {
            throw new Error("SPREADSHEET_ID no configurado");
        }

        // Fetch desde Google Sheets API
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAME}!${CONFIG.RANGE}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            // Si falla, usar localStorage como fallback
            console.warn("Error cargando desde Sheets, usando localStorage");
            loadDataFromLocalStorage();
            return;
        }

        const data = await response.json();
        
        // Procesar datos del Sheet (omitir encabezados)
        if (data.values && data.values.length > 1) {
            expenses = data.values.slice(1).map((row, index) => ({
                date: row[0] || '',
                category: row[1] || '',
                description: row[2] || '',
                amount: parseFloat(row[3]) || 0,
                paidBy: row[4] || '',
                id: row[5] || index
            }));
        }

        refreshUI();
        showLoading(false);
        showAlert('Datos cargados correctamente', 'success');

    } catch (error) {
        console.error('Error cargando datos:', error);
        // Fallback a localStorage
        loadDataFromLocalStorage();
        showLoading(false);
    }
}

async function saveDataToSheets(expense) {
    try {
        showLoading(true);

        // Para una implementación completa, necesitarías un backend
        // Por ahora, guardamos localmente y luego sincronizamos
        saveDataToLocalStorage();
        showLoading(false);
        showAlert('Gasto guardado correctamente', 'success');

    } catch (error) {
        console.error('Error guardando datos:', error);
        showLoading(false);
        showAlert('Error al guardar', 'error');
    }
}

// ==================== LOCAL STORAGE (FALLBACK) ====================

function loadDataFromLocalStorage() {
    const saved = localStorage.getItem('expenses');
    if (saved) {
        expenses = JSON.parse(saved);
    }
    refreshUI();
}

function saveDataToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// ==================== FORM HANDLING ====================

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const expense = {
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        paidBy: document.getElementById('paidBy').value,
        id: Date.now().toString()
    };

    expenses.unshift(expense); // Agregar al inicio
    saveDataToLocalStorage();
    refreshUI();
    document.getElementById('expenseForm').reset();
    setTodayDate();
    showAlert('Gasto agregado exitosamente ✓', 'success');
});

// ==================== DELETE EXPENSE ====================

function deleteExpense(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
        expenses = expenses.filter(e => e.id !== id);
        saveDataToLocalStorage();
        refreshUI();
        showAlert('Gasto eliminado', 'success');
    }
}

// ==================== FILTERING ====================

document.getElementById('monthFilter').addEventListener('change', refreshUI);
document.getElementById('categoryFilter').addEventListener('change', refreshUI);
document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('monthFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    refreshUI();
});

function getFilteredExpenses() {
    let filtered = [...expenses];

    // Filtro por mes
    const monthFilter = document.getElementById('monthFilter').value;
    if (monthFilter) {
        filtered = filtered.filter(e => e.date.startsWith(monthFilter));
    }

    // Filtro por categoría
    const categoryFilter = document.getElementById('categoryFilter').value;
    if (categoryFilter) {
        filtered = filtered.filter(e => e.category === categoryFilter);
    }

    return filtered;
}

// ==================== CALCULATIONS ====================

function calculateStats() {
    const filtered = getFilteredExpenses();
    
    let totalSpent = 0;
    let mySpent = 0;
    let partnerSpent = 0;

    filtered.forEach(exp => {
        totalSpent += exp.amount;

        if (exp.paidBy === 'Yo') {
            mySpent += exp.amount;
        } else if (exp.paidBy === 'Mi pareja') {
            partnerSpent += exp.amount;
        } else if (exp.paidBy === 'Ambos') {
            mySpent += exp.amount / 2;
            partnerSpent += exp.amount / 2;
        }
    });

    const balance = mySpent - partnerSpent;

    return { totalSpent, mySpent, partnerSpent, balance };
}

function getCategorySummary() {
    const filtered = getFilteredExpenses();
    const summary = {};

    filtered.forEach(exp => {
        if (!summary[exp.category]) {
            summary[exp.category] = 0;
        }
        summary[exp.category] += exp.amount;
    });

    return summary;
}

// ==================== UI UPDATES ====================

function refreshUI() {
    updateStats();
    renderExpensesTable();
    renderCategorySummary();
}

function updateStats() {
    const stats = calculateStats();

    document.getElementById('totalSpent').textContent = formatCurrency(stats.totalSpent);
    document.getElementById('mySpent').textContent = formatCurrency(stats.mySpent);
    document.getElementById('partnerSpent').textContent = formatCurrency(stats.partnerSpent);
    
    const balanceEl = document.getElementById('balance');
    balanceEl.textContent = formatCurrency(Math.abs(stats.balance));
    
    // Cambiar color según balance
    if (stats.balance > 0) {
        balanceEl.style.color = 'var(--danger-color)';
    } else if (stats.balance < 0) {
        balanceEl.style.color = 'var(--success-color)';
    } else {
        balanceEl.style.color = 'var(--text-primary)';
    }
}

function renderExpensesTable() {
    const tbody = document.getElementById('expensesTableBody');
    const filtered = getFilteredExpenses();

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No hay gastos registrados</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(exp => `
        <tr class="table-row-new">
            <td>${formatDate(exp.date)}</td>
            <td>${exp.category}</td>
            <td>${exp.description}</td>
            <td><strong>${formatCurrency(exp.amount)}</strong></td>
            <td>
                <span class="badge badge-${exp.paidBy.toLowerCase()}">
                    ${exp.paidBy}
                </span>
            </td>
            <td>
                <button class="btn-danger" onclick="deleteExpense('${exp.id}')">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');

    // Agregar estilos para badges
    if (!document.getElementById('badge-styles')) {
        const style = document.createElement('style');
        style.id = 'badge-styles';
        style.innerHTML = `
            .badge {
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
            }
            .badge-yo {
                background: #dbeafe;
                color: #1e40af;
            }
            .badge-mi {
                background: #fed7aa;
                color: #92400e;
            }
            .badge-ambos {
                background: #dcfce7;
                color: #166534;
            }
        `;
        document.head.appendChild(style);
    }
}

function renderCategorySummary() {
    const summary = getCategorySummary();
    const container = document.getElementById('categorySummary');

    if (Object.keys(summary).length === 0) {
        container.innerHTML = '<div class="empty-state">No hay datos para mostrar</div>';
        return;
    }

    container.innerHTML = Object.entries(summary)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => `
            <div class="category-item">
                <div class="category-name">${category}</div>
                <div class="category-amount">${formatCurrency(amount)}</div>
            </div>
        `).join('');
}

// ==================== UTILITY FUNCTIONS ====================

function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-CO', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showAlert(message, type = 'info') {
    // Crear elemento de alerta
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;

    if (type === 'success') {
        alert.style.background = 'var(--success-color)';
    } else if (type === 'error') {
        alert.style.background = 'var(--danger-color)';
    } else {
        alert.style.background = 'var(--primary-color)';
    }

    alert.style.color = 'white';
    alert.textContent = message;

    document.body.appendChild(alert);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function showLoading(show) {
    const indicator = document.getElementById('loadingIndicator');
    if (show) {
        indicator.style.display = 'flex';
    } else {
        indicator.style.display = 'none';
    }
}

// Agregar animaciones de alerta
if (!document.getElementById('alert-animations')) {
    const style = document.createElement('style');
    style.id = 'alert-animations';
    style.innerHTML = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Cargar datos al iniciar
window.addEventListener('load', () => {
    loadDataFromLocalStorage();
});
