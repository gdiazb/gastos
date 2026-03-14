# 🎤 Guía Rápida de Comandos de Voz

## Resumen Rápido

**Tú pagaste:**
```
cine $20000, pizza $15000
```

**Tu esposo pagó:**
```
esposo cine $20000, pizza $15000
pareja pizza $15000, café $3000
él uber $8500
marido farmacia $12000
```

**Mezcla:**
```
cine $20000, esposo pizza $15000
yo café $2500, pareja uber $8500
```

---

## Palabras Clave

### Para tu esposo:
- `esposo`
- `pareja`
- `él`
- `marido`
- `novio`

### Para ti:
- `yo` (al inicio)
- `yo pago`
- `yo gasto`
- `pagué`
- `gasté`

---

## Ejemplos Reales

### Caso 1: Fuera de compras juntos
```
"cine $20000, pizza $15000, gaseosa $5000"
```
→ Todo aparece bajo "Yo"

### Caso 2: Él pagó todo
```
"esposo comida $45000, transporte $8000"
```
→ Todo aparece bajo "Mi pareja"

### Caso 3: Cada quien pagó lo suyo
```
"cine $20000, esposo uber $10000"
```
→ Cine bajo "Yo" | Uber bajo "Mi pareja"

### Caso 4: Múltiples gastos de cada uno
```
"cine $20000, café $3000, esposo pizza $25000, esposo gaseosa $2000"
```
→ Tus gastos: Cine + Café
→ Sus gastos: Pizza + Gaseosa

---

## Lo que Pasa Automáticamente

✅ **Fecha**: Se agrega la fecha de hoy automáticamente  
✅ **Categoría**: Se detecta según lo que digas (cine → Entretenimiento)  
✅ **Descripción**: Lo que dijiste se usa como descripción  
✅ **Monto**: Se extrae el número automáticamente  
✅ **Pagado por**: Detecta si dijiste "esposo" o si es de ti  

---

## Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "No detectó voz" | Habla más fuerte, menos ruido |
| "Monto incorrecto" | Di números claros: "20000" no "20 mil" |
| "Quién pagó mal" | Asegúrate de decir "esposo/pareja" claro |
| "Categoría equivocada" | Edítala después en la tabla |
| "Micrófono no funciona" | Revisa permisos del navegador |

---

## Consejos Pro

💡 **Rápido:** Di múltiples gastos en una grabación  
💡 **Claro:** Pronuncia bien los montos y conceptos  
💡 **Completo:** Puedes mezclar quién pagó en la misma grabación  
💡 **Flexible:** Si algo está mal, siempre puedes editar después  
💡 **Privado:** Todo se procesa en tu navegador, no en servidores  

---

## Datos Que Faltan

Aunque no los digas, se agregan automáticamente:

- 📅 **Fecha**: Hoy (puedes cambiarla después)
- 🏷️ **Categoría**: Se detecta automáticamente
- 👤 **Quién pagó**: Tú o tu esposo (basado en lo que dijiste)

---

Más detalles en: [VOICE_GUIDE.md](VOICE_GUIDE.md)
