# 🎤 Guía: Dictar Gastos por Voz

## ¿Cómo funciona?

La app tiene un **reconocimiento de voz integrado** que te permite dictar gastos en lugar de escribirlos manualmente.

## ✅ Cómo Usar

### 1. Haz clic en el botón "🎤 Dictar Gastos"
- Aparecerá un panel donde puedes grabar tu voz
- El navegador te pedirá permiso para acceder al micrófono
- Haz clic en "Permitir"

### 2. Di tus gastos
Puedes decir gastos de varias formas:

**Formato recomendado (lo que tú pagaste):**
```
cine $20000, gaseosa $3000
pizza $15000, taxi $5000
```

**Si tu esposo pagó (agrega al inicio):**
```
esposo cine $20000, gaseosa $3000
pareja pizza $15000, café $2500
él uber $8500
marido farmacia $12000
```

**También funciona con:**
```
cine 20000
gaseosa $3.000
"yo pagué cine $20000"
"yo pago gaseosa $3000"
```

**El sistema detecta automáticamente:**
- Concepto/descripción (lo que compraste)
- Monto (la cantidad)
- **Quién pagó** (tú o tu esposo)
- Símbolo $ es opcional

### 3. Confirma los gastos
- La app mostrará un modal con los gastos detectados
- Verifica que estén correctos
- Haz clic en "✅ Confirmar" para agregar todos de una vez

## 🎯 Ejemplos

### ✅ Funciona bien:
```
"cine $20000"
"gaseosa $3000, café $2500"
"pizza $15000, refrescos $4000"
"uber $8500"
"farmacia $12000"
"ropa $50000, zapatos $80000"

# Con esposo/pareja:
"esposo cine $20000"
"pareja gaseosa $3000, café $2500"
"él pizza $15000"
"marido uber $8500"

# Combinado (algunos tú, algunos él):
"cine $20000, esposo pizza $15000"
"yo pago gaseosa $3000, pareja uber $8500"
```

### ⚠️ Puede no entender:
```
"gaste 20 mil en cine"
"debo agregar un gasto de cine"
"cuánto cuesta"
"el esposo compró comida"
```

**Consejo:** Sé directo. Di el nombre del gasto y el precio. La app es mejor si eres conciso.

## 🔄 Categorización Automática

La app **adivina automáticamente** la categoría según lo que digas:

| Lo que dices | Categoría |
|---|---|
| cine, película | Entretenimiento |
| gaseosa, café, burger, pizza | Comida |
| taxi, uber, bus, transporte | Transporte |
| ropa, zapatos, compras | Compras |
| doctor, medicina, farmacia | Salud |
| luz, agua, internet, teléfono | Servicios |
| Cualquier otra cosa | Otro |

## ⚙️ Configuración del Idioma

Por defecto está en **Español de Colombia (es-CO)**

Si quieres cambiar el idioma, abre `app.js` y busca:
```javascript
recognition.lang = 'es-CO';
```

Cámbialo a:
```javascript
recognition.lang = 'es-MX';  // Español de México
recognition.lang = 'es-ES';  // Español de España
recognition.lang = 'en-US';  // Inglés
```

## 🐛 Solución de Problemas

### "El micrófono no funciona"
1. Verifica que hayas dado permiso al navegador
2. Asegúrate de que otro programa no esté usando el micrófono
3. Intenta con otro navegador (Chrome funciona mejor)

### "Dice que no detectó voz"
1. Habla más fuerte y claro
2. Reduce el ruido de fondo
3. Espera a que la app termine de escuchar

### "Los montos están mal"
1. Di el número completo: "20000" no "20 mil"
2. Puedes usar punto o coma: "$20.000" o "$20,000"

### "No detectó gastos"
- La app busca el patrón: `concepto` + `$número`
- Ejemplo: "cine $20000" ✅
- No entiende: "gaste 20000 en cine" ❌

## 💡 Tips

✅ **Rápido:** "cine $20000, gaseosa $3000"  
✅ **Preciso:** Usa números, no palabras ("20000" no "veinte mil")  
✅ **Eficiente:** Puedes agregar múltiples gastos de una vez  
✅ **Flexible:** La fecha es hoy (se puede cambiar después)  

## 🌐 Compatibilidad

La función de voz funciona en:
- ✅ Chrome/Edge (mejor soporte)
- ✅ Firefox
- ✅ Safari (en iPhone/iPad)
- ❌ Internet Explorer (no soportado)

## 🔄 Detección de Quién Pagó

La app puede detectar automáticamente si **tú pagaste** o **tu esposo pagó**.

### Palabras clave para tu esposo:
- `esposo`
- `pareja`
- `él`
- `novio`
- `marido`

### Palabras clave para ti:
- `yo`
- `yo pago`
- `yo gasto`
- `pagué`
- `gasté`

### Ejemplo de uso:

**Opción 1: Todo lo pagó tu esposo**
```
"esposo cine $20000, pizza $15000, café $3000"
```
Resultado: Los 3 gastos aparecen como "Mi pareja"

**Opción 2: Tu esposo pagó un gasto, tú el otro**
```
"cine $20000, esposo pizza $15000"
```
Resultado: Cine aparece como "Yo", Pizza como "Mi pareja"

**Opción 3: Mezcla completa**
```
"yo café $2500, esposo pizza $15000, yo cine $20000"
```
Resultado: Café y Cine como "Yo", Pizza como "Mi pareja"

### Modal de Confirmación

Cuando confirmas, el modal mostrará:
- ✅ Quién pagó cada gasto (con badge color)
- ✅ Total de lo que pagaste tú
- ✅ Total de lo que pagó tu esposo
- ✅ Total general

---

- La grabación se procesa **localmente en tu navegador**
- No se guarda la grabación en servidores
- Solo se envía el texto reconocido a la app
- Los datos finales se guardan en tu Google Sheet

## Próximas Mejoras

Futuras versiones podrían incluir:
- 🔄 Editar gastos después de dictar
- 📊 Resumen de voz ("¿cuánto gasté hoy?")
- 🌍 Más idiomas
- 🎯 Mejor detección de montos con palabras
