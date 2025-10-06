// 1. REQUERIR LAS LIBRERÍAS (Nuestras "herramientas")
console.log('🚀 Iniciando Sistema Memorial...');
console.log('📊 Variables de entorno:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO'
});
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const fs = require('fs');
console.log('📦 Librerías cargadas correctamente');

// 2. INICIALIZACIÓN
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PUERTO = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.PORT ? '0.0.0.0' : 'localhost';
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiala_en_produccion_' + Math.random().toString(36).substring(2, 15);

// Logging de configuración inicial
console.log('🔧 Configuración del servidor:');
console.log(`   - Puerto: ${PUERTO}`);
console.log(`   - Host: ${HOST}`);
console.log(`   - Entorno: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - JWT_SECRET configurado: ${process.env.JWT_SECRET ? '✅ Sí' : '❌ No (usando temporal)'}`);

// Advertencia si se está usando JWT_SECRET por defecto en producción
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  ADVERTENCIA: JWT_SECRET no está configurado en producción. Se generó una clave temporal.');
  console.warn('⚠️  Configura JWT_SECRET como variable de entorno para mayor seguridad.');
}

// Middleware para parsear JSON con límite aumentado para fotos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Configuración de multer para subida de fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'public', 'uploads');
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'foto-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: function (req, file, cb) {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// --- NUEVO: Estructura para manejar múltiples funerarias y eventos ---
// En una aplicación real, esto estaría en una base de datos.
const funerariasData = {
  'funeraria-demo': {
    id: 'funeraria-demo',
    nombre: 'Funeraria Demo',
    email: 'admin@demo.com',
    password: '$2b$10$VBXGstSqor4o2V6HNG4pruhIDDRou99nl4AzFsjfH5d2Rc6sE7Jra', // Contraseña: demo123
    eventos: {
      'evento-1': {
        id: 'evento-1',
        nombre: 'Memorial Juan Pérez',
        accessCode: '1234',
        displayPhrase: "Con amor, te recordaremos siempre.",
        youtubeVideoId: 'dQw4w9WgXcQ', // Video de prueba que sabemos que funciona
        fechaCreacion: new Date(),
        activo: true,
        fotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      'evento-2': {
        id: 'evento-2',
        nombre: 'Memorial María García',
        accessCode: '5678',
        displayPhrase: "Tu luz brillará eternamente en nuestros corazones.",
        youtubeVideoId: 'yXl2i_6a-m0',
        fechaCreacion: new Date(),
        activo: true,
        fotoUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      'evento-17': {
        id: 'evento-17',
        nombre: 'Memorial de Prueba',
        accessCode: '1234',
        displayPhrase: "Un mensaje de amor eterno.",
        youtubeVideoId: 'LXb3EKWsInQ',
        fechaCreacion: new Date(),
        activo: true,
        fotoUrl: 'https://randomuser.me/api/portraits/men/75.jpg'
      }
    }
  }
};

// Función auxiliar para encontrar un evento por ID y funeraria
function findEvento(eventoId) {
  console.log(`🔍 Buscando evento: ${eventoId}`);
  
  for (const funerariaId in funerariasData) {
    const funeraria = funerariasData[funerariaId];
    console.log(`📂 Revisando funeraria: ${funerariaId}`);
    
    if (funeraria.eventos && funeraria.eventos[eventoId]) {
      console.log(`✅ Evento encontrado en funeraria: ${funerariaId}`);
      console.log(`📋 Detalles del evento:`, {
        id: funeraria.eventos[eventoId].id,
        nombre: funeraria.eventos[eventoId].nombre,
        accessCode: funeraria.eventos[eventoId].accessCode,
        activo: funeraria.eventos[eventoId].activo
      });
      return {
        evento: funeraria.eventos[eventoId],
        funerariaId: funerariaId
      };
    }
  }
  
  console.log(`❌ Evento no encontrado: ${eventoId}`);
  console.log(`📊 Eventos disponibles:`, Object.keys(funerariasData).map(fId => ({
    funerariaId: fId,
    eventos: Object.keys(funerariasData[fId].eventos || {}).map(eId => ({
      id: eId,
      nombre: funerariasData[fId].eventos[eId].nombre,
      codigo: funerariasData[fId].eventos[eId].accessCode,
      activo: funerariasData[fId].eventos[eId].activo
    }))
  })));
  
  return null;
}

// Función auxiliar para encontrar un evento por código de acceso
function findEventoByCode(accessCode) {
  console.log(`🔑 Buscando evento por código: ${accessCode}`);
  
  for (const funerariaId in funerariasData) {
    const funeraria = funerariasData[funerariaId];
    
    if (funeraria.eventos) {
      for (const eventoId in funeraria.eventos) {
        const evento = funeraria.eventos[eventoId];
        console.log(`🔍 Comparando código "${accessCode}" con evento "${eventoId}" (código: "${evento.accessCode}")`);
        
        if (evento.accessCode === accessCode && evento.activo) {
          console.log(`✅ Evento encontrado por código: ${eventoId}`);
          return {
            evento: evento,
            funerariaId: funerariaId
          };
        }
      }
    }
  }
  
  console.log(`❌ No se encontró evento activo con código: ${accessCode}`);
  return null;
}

// Middleware de autenticación
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('❌ Token no proporcionado');
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('❌ Error al verificar el token:', err.message);
            return res.status(403).json({ error: 'Token inválido' });
        }
        console.log('✅ Token verificado correctamente para el usuario:', user);
        req.user = user;
        next();
    });
}

// 3. ARCHIVOS ESTÁTICOS
app.use(express.static(path.join(__dirname, 'public')));

// 4. RUTAS DE API PARA FUNERARIAS

// Registro de nueva funeraria
app.post('/api/funerarias/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    
    // Verificar si ya existe una funeraria con ese email
    const existeFuneraria = Object.values(funerariasData).find(f => f.email === email);
    if (existeFuneraria) {
      return res.status(400).json({ error: 'Ya existe una funeraria con ese email' });
    }
    
    // Crear nueva funeraria
    const funerariaId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    funerariasData[funerariaId] = {
      id: funerariaId,
      nombre,
      email,
      password: hashedPassword,
      eventos: {},
      fechaRegistro: new Date()
    };
    
    res.status(201).json({
      id: funerariaId,
      nombre,
      email,
      mensaje: 'Funeraria registrada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de funeraria
app.post('/api/funerarias/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar funeraria por email
    const funeraria = Object.values(funerariasData).find(f => f.email === email);
    if (!funeraria) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, funeraria.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { funerariaId: funeraria.id, email: funeraria.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      funeraria: {
        id: funeraria.id,
        nombre: funeraria.nombre,
        email: funeraria.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener eventos de una funeraria
app.get('/api/funerarias/:funerariaId/eventos', authenticateToken, (req, res) => {
  const { funerariaId } = req.params;
  
  // Verificar que la funeraria solo pueda acceder a sus propios eventos
  if (req.user.funerariaId !== funerariaId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  const funeraria = funerariasData[funerariaId];
  if (!funeraria) {
    return res.status(404).json({ error: 'Funeraria no encontrada' });
  }
  
  res.json(Object.values(funeraria.eventos || {}));
});

// Crear nuevo evento
app.post('/api/funerarias/:funerariaId/eventos', authenticateToken, (req, res) => {
  const { funerariaId } = req.params;
  const { nombre, displayPhrase, youtubeVideoId } = req.body;
  
  // Verificar permisos
  if (req.user.funerariaId !== funerariaId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  const funeraria = funerariasData[funerariaId];
  if (!funeraria) {
    return res.status(404).json({ error: 'Funeraria no encontrada' });
  }
  
  // Crear nuevo evento
  const eventoId = uuidv4();
  const accessCode = Math.floor(1000 + Math.random() * 9000).toString(); // Código de 4 dígitos
  
  funeraria.eventos[eventoId] = {
    id: eventoId,
    nombre,
    accessCode,
    displayPhrase,
    youtubeVideoId,
    fechaCreacion: new Date(),
    activo: true,
    fotoUrl: 'https://randomuser.me/api/portraits/' + (Math.random() > 0.5 ? 'men/' : 'women/') + Math.floor(Math.random() * 99) + '.jpg'
  };
  
  res.status(201).json(funeraria.eventos[eventoId]);
});

// Actualizar evento
app.put('/api/funerarias/:funerariaId/eventos/:eventoId', authenticateToken, (req, res) => {
  const { funerariaId, eventoId } = req.params;
  const { nombre, displayPhrase, youtubeVideoId, activo } = req.body;
  
  // Verificar permisos
  if (req.user.funerariaId !== funerariaId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  const funeraria = funerariasData[funerariaId];
  if (!funeraria || !funeraria.eventos[eventoId]) {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }
  
  // Actualizar evento
  const evento = funeraria.eventos[eventoId];
  if (nombre !== undefined) evento.nombre = nombre;
  if (displayPhrase !== undefined) evento.displayPhrase = displayPhrase;
  if (youtubeVideoId !== undefined) evento.youtubeVideoId = youtubeVideoId;
  if (activo !== undefined) evento.activo = activo;
  
  // Notificar cambios a clientes conectados
  io.to(eventoId).emit('event details', {
    phrase: evento.displayPhrase,
    videoId: evento.youtubeVideoId
  });
  
  res.json(evento);
});

// Eliminar evento
app.delete('/api/funerarias/:funerariaId/eventos/:eventoId', authenticateToken, (req, res) => {
  const { funerariaId, eventoId } = req.params;
  
  // Verificar permisos
  if (req.user.funerariaId !== funerariaId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  const funeraria = funerariasData[funerariaId];
  if (!funeraria || !funeraria.eventos[eventoId]) {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }
  
  // Eliminar foto si existe
  const evento = funeraria.eventos[eventoId];
  if (evento.fotoUrl) {
    const fotoPath = path.join(__dirname, 'public', evento.fotoUrl);
    if (fs.existsSync(fotoPath)) {
      fs.unlinkSync(fotoPath);
      console.log(`📸 Foto eliminada: ${fotoPath}`);
    }
  }
  
  // Eliminar evento
  delete funeraria.eventos[eventoId];
  
  // Notificar a clientes conectados que el evento fue eliminado
  io.to(eventoId).emit('event deleted', { message: 'Este evento ha sido eliminado por el administrador' });
  
  res.json({ message: 'Evento eliminado exitosamente' });
});

// Validar código de acceso para un evento
app.post('/api/eventos/:eventoId/validate-access', (req, res) => {
  const { eventoId } = req.params;
  const { code, fullName } = req.body;

  console.log(`🔐 Validando acceso para evento: ${eventoId} con código: ${code}`);

  const eventoInfo = findEvento(eventoId);

  if (eventoInfo && eventoInfo.evento.accessCode === code && eventoInfo.evento.activo) {
    console.log(`✅ Acceso concedido para: ${fullName}`);
    res.json({
      status: 'ok',
      eventId: eventoInfo.evento.id,
      eventName: eventoInfo.evento.nombre
    });
  } else {
    console.log(`❌ Acceso denegado. Código incorrecto o evento inactivo.`);
    res.status(403).json({ error: 'Código de acceso incorrecto o el evento no está activo' });
  }
});

// Endpoint para subir foto de evento
app.post('/api/funerarias/:funerariaId/eventos/:eventoId/foto', authenticateToken, upload.single('foto'), (req, res) => {
  const { funerariaId, eventoId } = req.params;
  
  // Verificar permisos
  if (req.user.funerariaId !== funerariaId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  
  const funeraria = funerariasData[funerariaId];
  if (!funeraria || !funeraria.eventos[eventoId]) {
    return res.status(404).json({ error: 'Evento no encontrado' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  
  // Eliminar foto anterior si existe
  const evento = funeraria.eventos[eventoId];
  if (evento.fotoUrl) {
    const fotoAnteriorPath = path.join(__dirname, 'public', evento.fotoUrl);
    if (fs.existsSync(fotoAnteriorPath)) {
      fs.unlinkSync(fotoAnteriorPath);
      console.log(`📸 Foto anterior eliminada: ${fotoAnteriorPath}`);
    }
  }
  
  // Actualizar evento con nueva foto
  const fotoUrl = `/uploads/${req.file.filename}`;
  evento.fotoUrl = fotoUrl;
  
  console.log(`📸 Nueva foto subida para evento ${eventoId}: ${fotoUrl}`);
  
  res.json({
    message: 'Foto subida exitosamente',
    fotoUrl: fotoUrl
  });
});

// 5. LÓGICA DE SOCKET.IO (La magia del chat en tiempo real)
io.on('connection', (socket) => {
  console.log('✅ Un usuario se ha conectado');
  io.emit('user count', io.engine.clientsCount);
  
  // El cliente se une a una sala específica para su evento
  socket.on('join room', (eventId) => {
    const eventoInfo = findEvento(eventId);
    if (eventoInfo && eventoInfo.evento.activo) {
      socket.join(eventId);
      socket.eventId = eventId;
      socket.funerariaId = eventoInfo.funerariaId;
      console.log(`Un usuario se unió a la sala: ${eventId}`);
      
      // Enviamos la información del evento con logs detallados
      const eventDetails = { 
        phrase: eventoInfo.evento.displayPhrase,
        videoId: eventoInfo.evento.youtubeVideoId,
        nombre: eventoInfo.evento.nombre
      };
      
      console.log(`📺 Enviando detalles del evento ${eventId}:`, eventDetails);
      socket.emit('event details', eventDetails);
    } else {
      console.log(`❌ Error: Evento ${eventId} no encontrado o inactivo`);
      socket.emit('error', { message: 'Evento no encontrado o inactivo' });
    }
  });

  // Validar código de acceso
  socket.on('validate code', ({ code, eventId }, callback) => {
    console.log(`🔐 Validando código: "${code}" para evento: "${eventId}"`);
    
    // Primero intentar encontrar el evento por ID
    let eventoInfo = findEvento(eventId);
    
    // Si no se encuentra por ID, intentar buscar por código
    if (!eventoInfo) {
      console.log(`🔍 Evento no encontrado por ID, buscando por código...`);
      eventoInfo = findEventoByCode(code);
      
      if (eventoInfo) {
        console.log(`✅ Evento encontrado por código: ${eventoInfo.evento.id}`);
        // Actualizar el eventId del socket para futuras operaciones
        socket.eventId = eventoInfo.evento.id;
      }
    }
    
    if (eventoInfo) {
      console.log(`📋 Evento encontrado: ${eventoInfo.evento.nombre}`);
      console.log(`🔑 Código esperado: "${eventoInfo.evento.accessCode}"`);
      console.log(`🔑 Código recibido: "${code}"`);
      console.log(`✅ Activo: ${eventoInfo.evento.activo}`);
      console.log(`🔍 Comparación: ${code} === ${eventoInfo.evento.accessCode} = ${code === eventoInfo.evento.accessCode}`);
      
      // Verificar que el código coincida y el evento esté activo
      if (eventoInfo.evento.activo && code === eventoInfo.evento.accessCode) {
        console.log('✅ Código de acceso correcto.');
        callback({ 
          status: 'ok',
          eventId: eventoInfo.evento.id,
          eventName: eventoInfo.evento.nombre
        });
        return;
      }
    } else {
      console.log(`❌ Evento no encontrado: ${eventId}`);
    }
    
    console.log(`❌ Intento de conexión con código incorrecto: ${code}`);
    callback({ status: 'invalid' });
  });

  // Cuando un usuario se une, lo notificamos a los demás
  socket.on('user joined', (username) => {
    socket.username = username;
    console.log(`👤 ${username} se unió al evento: ${socket.eventId}`);
    
    if (socket.eventId) {
      socket.to(socket.eventId).emit('user connected', { 
        username: username, 
        timestamp: new Date() 
      });
    }
  });

  // Cuando un admin cambia la frase (solo admins autenticados)
  socket.on('admin set phrase', ({ newPhrase, token }) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (socket.eventId && socket.funerariaId === decoded.funerariaId) {
        const funeraria = funerariasData[decoded.funerariaId];
        if (funeraria && funeraria.eventos[socket.eventId]) {
          funeraria.eventos[socket.eventId].displayPhrase = newPhrase;
          io.to(socket.eventId).emit('update phrase', newPhrase);
          console.log(`Nueva frase establecida: "${newPhrase}"`);
        }
      }
    } catch (error) {
      socket.emit('error', { message: 'Token de admin inválido' });
    }
  });

  // Chat de mensajes
  socket.on('chat message', (msg) => {
    if (socket.eventId && socket.username) {
      const message = {
        user: msg.user || socket.username,
        text: msg.text,
        timestamp: new Date()
      };
      
      console.log(`💬 Mensaje en ${socket.eventId}: ${message.user}: ${message.text}`);
      io.to(socket.eventId).emit('chat message', message);
    } else {
      console.log('❌ Mensaje rechazado: usuario no autenticado');
      socket.emit('error', { message: 'Debes unirte al chat primero' });
    }
  });

  // Cuando un usuario se desconecte
  socket.on('disconnect', () => {
    console.log('❌ Un usuario se ha desconectado');
    if (socket.username) {
      io.to(socket.eventId).emit('user disconnected', { 
        username: socket.username, 
        timestamp: new Date() 
      });
    }
    io.emit('user count', io.engine.clientsCount);
  });
});

// 6. RUTAS DE PÁGINAS

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  console.log('🏥 Health check solicitado');
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Sistema Memorial',
    environment: process.env.NODE_ENV || 'development',
    port: PUERTO,
    host: HOST
  });
});

// Para cualquier otra ruta que no sea un archivo estático, enviamos index.html.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Manejamos rutas de eventos específicos
app.get('/evento/:eventId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'evento.html'));
});

// Manejamos rutas de admin para funerarias
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Ruta para registrar nueva funeraria
app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

// 7. INICIAR EL SERVIDOR
server.listen(PUERTO, HOST, () => {
  console.log(`🚀 Servidor iniciado exitosamente!`);
  console.log(`   - Escuchando en: http://${HOST}:${PUERTO}`);
  console.log(`   - Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   - Health check: http://${HOST}:${PUERTO}/health`);
  console.log(`📋 URLs disponibles:`);
  console.log(`   - Admin: http://${HOST}:${PUERTO}/admin`);
  console.log(`   - Registro: http://${HOST}:${PUERTO}/registro`);
  console.log(`   - Evento demo: http://${HOST}:${PUERTO}/evento/evento-1`);
  console.log(`✅ Sistema Memorial listo para recibir conexiones`);

  // Para Railway: asegurar que el servidor esté completamente listo
  if (process.env.NODE_ENV === 'production') {
    console.log('🏥 Verificando health check endpoint...');
    // Pequeño delay para asegurar que todo esté inicializado
    setTimeout(() => {
      console.log('✅ Servidor completamente listo para Railway');
    }, 1000);
  }
}).on('error', (err) => {
  console.error('❌ Error al iniciar el servidor:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`   Puerto ${PUERTO} ya está en uso`);
  } else if (err.code === 'EACCES') {
    console.error(`   Sin permisos para usar el puerto ${PUERTO}`);
  }
  process.exit(1);
});

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('🔄 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});