# 🚀 Guía de Deploy a Producción - Sistema Memorial

## 📋 Pre-requisitos

✅ **Sistema completamente funcional y validado**
✅ **Variables de entorno configuradas**
✅ **Archivos de configuración creados**

---

## 🌐 Deploy en Railway (RECOMENDADO)

### **Paso 1: Preparar el Repositorio**

1. **Crear repositorio en GitHub** (si no existe):
```bash
git init
git add .
git commit -m "Sistema Memorial listo para producción"
git branch -M main
git remote add origin https://github.com/tu-usuario/sistema-memorial.git
git push -u origin main
```

### **Paso 2: Deploy en Railway**

1. **Ir a Railway.app** → https://railway.app
2. **Crear cuenta** o hacer login
3. **New Project** → **Deploy from GitHub repo**
4. **Seleccionar tu repositorio** `sistema-memorial`
5. **Railway detectará automáticamente** que es un proyecto Node.js

### **Paso 3: Configurar Variables de Entorno**

En el dashboard de Railway, ir a **Variables**:

```bash
NODE_ENV=production
JWT_SECRET=tu_clave_jwt_super_secreta_de_64_caracteres_minimo
```

**🔐 Para generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Paso 4: Deploy Automático**

- Railway hará deploy automáticamente
- El proceso toma 2-3 minutos
- Recibirás una URL como: `https://tu-app.railway.app`

---

## 🔧 Configuración Post-Deploy

### **Verificar Funcionamiento**

1. **Página de Admin**: `https://tu-app.railway.app/admin`
2. **Registro**: `https://tu-app.railway.app/registro`
3. **Evento Demo**: `https://tu-app.railway.app/evento/evento-1`

### **Credenciales de Prueba**

- **Email**: `admin@demo.com`
- **Password**: `demo123`
- **Código Evento**: `1234`

---

## 🛠️ Alternativas de Hosting

### **Render.com**
```bash
# Configuración similar a Railway
# Variables de entorno en dashboard
NODE_ENV=production
JWT_SECRET=tu_clave_secreta
```

### **Heroku**
```bash
# Instalar Heroku CLI
heroku create tu-app-memorial
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_clave_secreta
git push heroku main
```

### **DigitalOcean App Platform**
```bash
# Usar archivo de configuración .do/app.yaml
# Variables de entorno en dashboard
```

---

## 📊 Monitoreo y Mantenimiento

### **Logs en Railway**
- Dashboard → **Deployments** → **View Logs**
- Monitorear errores y performance

### **Métricas Importantes**
- ✅ Tiempo de respuesta < 2s
- ✅ Uptime > 99%
- ✅ Memoria < 512MB
- ✅ WebSockets funcionando

### **Backup de Datos**
```javascript
// Los datos están en memoria (funerariasData)
// Para producción real, migrar a base de datos
```

---

## 🔒 Seguridad en Producción

### **Variables de Entorno Obligatorias**
```bash
NODE_ENV=production          # Modo producción
JWT_SECRET=clave_64_chars    # Clave JWT segura
```

### **Headers de Seguridad** (Futuro)
```javascript
// Agregar helmet.js para headers de seguridad
app.use(helmet());
```

### **Rate Limiting** (Futuro)
```javascript
// Limitar requests por IP
const rateLimit = require('express-rate-limit');
```

---

## 🚨 Troubleshooting

### **Error: JWT_SECRET no configurado**
```bash
# Solución: Configurar variable de entorno
JWT_SECRET=tu_clave_secreta_aqui
```

### **Error: Puerto no disponible**
```bash
# Railway asigna PORT automáticamente
# No configurar PORT manualmente
```

### **WebSockets no funcionan**
```bash
# Verificar que el hosting soporte WebSockets
# Railway, Render, Heroku: ✅ Soportan
# Netlify, Vercel: ❌ No soportan WebSockets persistentes
```

### **Video de YouTube no carga**
```bash
# Verificar que el videoId sea válido
# Ejemplo: dQw4w9WgXcQ (Rick Roll)
```

---

## 📈 Próximos Pasos

### **Fase 1: MVP Funcionando** ✅
- [x] Deploy en Railway
- [x] Variables de entorno configuradas
- [x] Sistema funcionando en producción

### **Fase 2: Mejoras de Producción**
- [ ] Base de datos PostgreSQL
- [ ] Sistema de backup
- [ ] Monitoreo con Sentry
- [ ] CDN para archivos estáticos

### **Fase 3: Escalabilidad**
- [ ] Load balancer
- [ ] Múltiples instancias
- [ ] Cache con Redis
- [ ] Optimización de performance

---

## 🎯 URLs Finales

Una vez deployado, tendrás:

- **🏠 Home/Admin**: `https://tu-app.railway.app/`
- **👤 Login**: `https://tu-app.railway.app/admin`
- **📝 Registro**: `https://tu-app.railway.app/registro`
- **📊 Dashboard**: `https://tu-app.railway.app/dashboard`
- **🕯️ Eventos**: `https://tu-app.railway.app/evento/[id]`

---

## ✅ Checklist Final

- [ ] Repositorio en GitHub actualizado
- [ ] Deploy en Railway completado
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET seguro generado
- [ ] URLs funcionando correctamente
- [ ] Chat en tiempo real operativo
- [ ] Videos de YouTube cargando
- [ ] Autenticación funcionando
- [ ] Registro de funerarias operativo

**🎉 ¡Sistema Memorial listo para producción!**
