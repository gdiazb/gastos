// ==================== ESTADO GLOBAL ====================

let expenses = [];
let APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxmkR7Lo0aju0rCyFgGtV-VAjGCev6CezET1TbNn9edENfCp3_-cqfghx63F3mcP8K/exec'; // Se configurará después del deployment

// Speech Recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

// ==================== GOOGLE APPS SCRIPT API ====================

async function loadDataFromGoogleSheets() {
    if (!APPS_SCRIPT_URL) {
        console.log('⚠️ Apps Script URL no configurada, usando solo localStorage');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${APPS_SCRIPT_URL}?action=getAll`);
        const result = await response.json();
        
        if (result.success) {
            expenses = result.data || [];
            saveDataToLocalStorage();
            refreshUI();
            showAlert(`${expenses.length} gastos cargados desde Google Sheets`, 'success');
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        showAlert('Error al cargar datos de Google Sheets. Usando datos locales.', 'warning');
        loadDataFromLocalStorage();
    } finally {
        showLoading(false);
    }
}

async function saveExpenseToGoogleSheets(expense) {
    if (!APPS_SCRIPT_URL) {
        console.log('⚠️ Apps Script URL no configurada');
        return;
    }
    
    try {
        showLoading(true);
        
        const url = `${APPS_SCRIPT_URL}?action=add&expense=${encodeURIComponent(JSON.stringify(expense))}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            showAlert('Gasto guardado exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error guardando gasto:', error);
        showAlert('Error al guardar en Google Sheets. Guardado solo localmente.', 'warning');
    } finally {
        showLoading(false);
    }
}

async function deleteExpenseFromGoogleSheets(expenseId) {
    if (!APPS_SCRIPT_URL) {
        console.log('⚠️ Apps Script URL no configurada');
        return;
    }
    
    try {
        showLoading(true);
        
        const url = `${APPS_SCRIPT_URL}?action=delete&id=${encodeURIComponent(expenseId)}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            showAlert('Gasto eliminado exitosamente', 'success');
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error eliminando gasto:', error);
        showAlert('Error al eliminar de Google Sheets', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== LOCAL STORAGE (BACKUP) ====================

function saveDataToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function loadDataFromLocalStorage() {
    const stored = localStorage.getItem('expenses');
    if (stored) {
        expenses = JSON.parse(stored);
        refreshUI();
    }
}

// ==================== EXPENSE MANAGEMENT ====================

async function addExpense(expenseData) {
    const expense = {
        id: generateId(),
        ...expenseData,
        amount: parseFloat(expenseData.amount)
    };

    expenses.unshift(expense);
    saveDataToLocalStorage();
    
    // Guardar en Google Sheets
    await saveExpenseToGoogleSheets(expense);
    
    refreshUI();
}

async function deleteExpense(expenseId) {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) {
        return;
    }

    expenses = expenses.filter(e => e.id !== expenseId);
    saveDataToLocalStorage();
    
    // Eliminar de Google Sheets
    await deleteExpenseFromGoogleSheets(expenseId);
    
    refreshUI();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== SPEECH RECOGNITION ====================

function initializeSpeechRecognition() {
    if (!SpeechRecognition) {
        console.warn('Speech Recognition no soportado en este navegador');
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            voiceBtn.style.display = 'none';
        }
        return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-CO';

    recognition.onstart = () => {
        isListening = true;
        updateVoiceButtonState();
    };

    recognition.onresult = (event) => {
        let transcript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }

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
        document.getElementById('voiceTranscript').style.display = 'block';
        document.getElementById('voiceTranscript').textContent = 'Escuchando...';
        recognition.start();
    }
}

function updateVoiceButtonState() {
    const btn = document.getElementById('voiceBtn');
    const transcript = document.getElementById('voiceTranscript');
    
    if (!btn) return;
    
    if (isListening) {
        btn.classList.add('recording');
        btn.innerHTML = '🛑 Detener';
        transcript.style.display = 'block';
    } else {
        btn.classList.remove('recording');
        btn.innerHTML = '🎤 Dictar Gastos';
        setTimeout(() => {
            transcript.style.display = 'none';
        }, 2000);
    }
}

function processVoiceInput(transcript) {
    const text = transcript.toLowerCase().trim();
    
    let paidBy = 'Yo';
    
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
    
    if (esposoPatterns.some(p => p.test(text))) {
        paidBy = 'Mi pareja';
    } else if (yoPatterns.some(p => p.test(text))) {
        paidBy = 'Yo';
    }
    
    let cleanText = text;
    cleanText = cleanText.replace(/^(mi\s+)?esposo\s+/, '');
    cleanText = cleanText.replace(/^(mi\s+)?pareja\s+/, '');
    cleanText = cleanText.replace(/^él\s+/, '');
    cleanText = cleanText.replace(/^(mi\s+)?novio\s+/, '');
    cleanText = cleanText.replace(/^(mi\s+)?marido\s+/, '');
    cleanText = cleanText.replace(/^yo\s+(pago|gasto)\s+/, '');
    cleanText = cleanText.replace(/^yo\s+/, '');
    cleanText = cleanText.replace(/^(pagué|gasté)\s+/, '');
    
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
        showAlert('No detecté gastos. Intenta: "cine $20000, gaseosa $3000"', 'warning');
        return;
    }

    showVoiceConfirmation(matches);
}

function showVoiceConfirmation(items) {
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
    
    items.forEach((item) => {
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
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="cancelVoiceBtn" style="
                padding: 12px 24px;
                background: var(--border-color);
                color: var(--text-primary);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
            ">
                Cancelar
            </button>
            <button id="confirmVoiceBtn" style="
                padding: 12px 24px;
                background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                font-size: 14px;
            ">
                Confirmar Todos
            </button>
        </div>
    `;

    modal.innerHTML = content;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('cancelVoiceBtn').onclick = () => {
        overlay.remove();
    };

    document.getElementById('confirmVoiceBtn').onclick = async () => {
        overlay.remove();
        
        const today = new Date().toISOString().split('T')[0];
        
        for (const item of items) {
            await addExpense({
                date: today,
                category: 'Otro',
                description: item.concept,
                amount: item.amount,
                paidBy: item.paidBy
            });
        }
        
        showAlert(`${items.length} gastos agregados exitosamente`, 'success');
    };
}

// ==================== FORM HANDLING ====================

function setupFormHandler() {
    const form = document.getElementById('expenseForm');
    if (!form) {
        console.error('Form no encontrado');
        return;
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            date: document.getElementById('date').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            amount: document.getElementById('amount').value,
            paidBy: document.getElementById('paidBy').value
        };

        await addExpense(formData);
        e.target.reset();
        
        // Resetear fecha a hoy
        document.getElementById('date').valueAsDate = new Date();
    });
}

// ==================== FILTERS ====================

function setupFilters() {
    const monthFilter = document.getElementById('monthFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const clearFilters = document.getElementById('clearFilters');
    
    if (monthFilter) monthFilter.addEventListener('change', refreshUI);
    if (categoryFilter) categoryFilter.addEventListener('change', refreshUI);
    
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            document.getElementById('monthFilter').value = '';
            document.getElementById('categoryFilter').value = '';
            refreshUI();
        });
    }
}

function getFilteredExpenses() {
    let filtered = [...expenses];

    const monthFilter = document.getElementById('monthFilter').value;
    if (monthFilter) {
        filtered = filtered.filter(e => e.date.startsWith(monthFilter));
    }

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
                <span class="badge badge-${exp.paidBy.toLowerCase().replace(' ', '-')}">
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
            .badge-mi-pareja {
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
        max-width: 400px;
    `;

    if (type === 'success') {
        alert.style.background = 'var(--success-color)';
    } else if (type === 'error') {
        alert.style.background = 'var(--danger-color)';
    } else if (type === 'warning') {
        alert.style.background = 'var(--warning-color)';
    } else {
        alert.style.background = 'var(--primary-color)';
    }

    alert.style.color = 'white';
    alert.textContent = message;

    document.body.appendChild(alert);

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

// ==================== INITIALIZATION ====================

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

// Inicializar cuando carga la página
window.addEventListener('load', () => {
    console.log('🚀 Iniciando Finan-Zas (Apps Script version)...');
    
    // Cargar datos locales primero
    loadDataFromLocalStorage();
    
    // Intentar cargar desde Google Sheets
    if (APPS_SCRIPT_URL) {
        loadDataFromGoogleSheets();
    } else {
        showAlert('⚠️ Configura APPS_SCRIPT_URL para sincronizar con Google Sheets', 'warning');
    }
    
    // Inicializar fecha de hoy
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    // Configurar event listeners
    setupFormHandler();
    setupFilters();
    
    // Inicializar reconocimiento de voz
    initializeSpeechRecognition();
    
    console.log('✅ Finan-Zas inicializado');
});
