# Sistema de Memorial Multi-Funeraria

## 🏛️ Descripción

Sistema web para transmisiones en vivo de funerales que permite a múltiples casas funerarias gestionar sus propios eventos de manera independiente.

## ✨ Características Principales

### Para Funerarias:
- **Registro independiente**: Cada funeraria puede registrarse por separado
- **Autenticación segura**: Sistema de login con JWT y contraseñas encriptadas
- **Gestión de eventos**: Crear, editar y administrar múltiples velatorios
- **Códigos de acceso únicos**: Cada evento tiene su propio código de 4 dígitos
- **Panel de administración**: Interfaz para gestionar todos sus eventos

### Para Familiares y Asistentes:
- **Acceso por código**: Ingreso seguro a cada velatorio específico
- **Chat en tiempo real**: Mensajes de condolencias y apoyo
- **Video integrado**: Transmisión desde YouTube
- **Frases personalizables**: Mensajes especiales para cada difunto

## 🚀 Instalación y Configuración

1. **Instalar dependencias**:
```bash
npm install
```

2. **Iniciar el servidor**:
```bash
node server.js
```

3. **Acceder al sistema**:
- Servidor: http://localhost:3000
- Admin demo: http://localhost:3000/admin
- Registro: http://localhost:3000/registro
- Evento demo: http://localhost:3000/evento/evento-1

## 🔐 Credenciales de Demostración

**Funeraria Demo:**
- Email: `admin@demo.com`
- Contraseña: `demo123`

**Eventos de Prueba:**
- Evento 1: Código `1234`
- Evento 2: Código `5678`

## 📋 API Endpoints

### Autenticación y Registro
- `POST /api/funerarias/registro` - Registrar nueva funeraria
- `POST /api/funerarias/login` - Login de funeraria

### Gestión de Eventos
- `GET /api/funerarias/:funerariaId/eventos` - Listar eventos
- `POST /api/funerarias/:funerariaId/eventos` - Crear evento
- `PUT /api/funerarias/:funerariaId/eventos/:eventoId` - Actualizar evento

## 🏗️ Arquitectura del Sistema

### Estructura de Datos
```javascript
funerariasData = {
  'funeraria-id': {
    id: 'unique-id',
    nombre: 'Nombre de la Funeraria',
    email: 'admin@funeraria.com',
    password: 'hashed-password',
    eventos: {
      'evento-id': {
        id: 'evento-id',
        nombre: 'Memorial Juan Pérez',
        accessCode: '1234',
        displayPhrase: 'Frase conmemorativa',
        youtubeVideoId: 'video-id',
        fechaCreacion: Date,
        activo: true
      }
    }
  }
}
```

### Seguridad
- **Contraseñas encriptadas** con bcrypt
- **Tokens JWT** para autenticación de sesiones
- **Autorización** por funeraria (cada una solo ve sus eventos)
- **Códigos de acceso** únicos para cada evento

### Comunicación en Tiempo Real
- **Socket.IO** para chat y actualizaciones en vivo
- **Salas separadas** por evento
- **Autenticación** de administradores para cambios

## 🔧 Personalización

### Agregar Nueva Funeraria
1. Use el endpoint `/api/funerarias/registro`
2. O agregue manualmente a `funerariasData` en el servidor

### Configurar Nuevo Evento
1. Login como administrador de funeraria
2. Use `/api/funerarias/:id/eventos` para crear
3. Se generará automáticamente un código de acceso

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Tiempo Real**: Socket.IO
- **Autenticación**: JWT, bcrypt
- **Frontend**: HTML, CSS, JavaScript vanilla
- **Video**: YouTube embedded player

## 📱 Uso del Sistema

### Para Administradores de Funeraria:
1. Registrarse en `/registro`
2. Hacer login en `/admin`
3. Crear y gestionar eventos
4. Compartir códigos de acceso con familias

### Para Familiares:
1. Acceder a `/evento/:eventoId`
2. Ingresar código de acceso
3. Participar en chat y ver transmisión

## 🚀 Deploy a Producción

### **Railway (Recomendado)**
1. Crear repositorio en GitHub
2. Conectar con Railway.app
3. Configurar variables de entorno:
   ```bash
   NODE_ENV=production
   JWT_SECRET=clave_segura_64_caracteres
   ```
4. Deploy automático en 2-3 minutos

**📖 Ver guía completa**: [PRODUCTION-DEPLOY.md](./PRODUCTION-DEPLOY.md)

### **Variables de Entorno Requeridas**
```bash
NODE_ENV=production
JWT_SECRET=tu_clave_jwt_super_secreta_de_64_caracteres_minimo
```

**🔐 Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔮 Próximas Mejoras

- [ ] Base de datos persistente (PostgreSQL)
- [ ] Sistema de backup automático
- [ ] Notificaciones por email
- [ ] Grabación de transmisiones
- [ ] Galería de fotos
- [ ] Libro de condolencias digital
- [ ] Integración con redes sociales
- [ ] App móvil
- [ ] Monitoreo con Sentry
- [ ] CDN para archivos estáticos

## 📞 Soporte

Para soporte técnico o consultas, contacte al desarrollador del sistema.

## 🎯 Estado del Proyecto

✅ **LISTO PARA PRODUCCIÓN**
- Sistema completamente funcional
- Configuración de deploy preparada
- Variables de entorno configuradas
- Documentación completa
- Guías de deploy incluidas
