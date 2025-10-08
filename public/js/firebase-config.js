// Configuración de Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    connectAuthEmulator
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    updateDoc,
    deleteDoc,
    connectFirestoreEmulator
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDDSrpqYvrg7SH72vuBMtm5B5Je06S-sp0",
  authDomain: "memorial-10fcc.firebaseapp.com",
  projectId: "memorial-10fcc",
  storageBucket: "memorial-10fcc.firebasestorage.app",
  messagingSenderId: "146305941295",
  appId: "1:146305941295:web:d5cb632431e317dddd6bda"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Conectar a los emuladores en desarrollo
if (window.location.hostname === 'localhost') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8081);
}

// Clase para manejar la autenticación con Firebase
class FirebaseAuth {
    constructor() {
        this.currentUser = null;
        this.initAuthStateListener();
    }

    // Escuchar cambios en el estado de autenticación
    initAuthStateListener() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            if (user) {
                console.log('Usuario autenticado:', user.email);
                // Guardar datos del usuario en localStorage para compatibilidad
                localStorage.setItem('funeraria', JSON.stringify({
                    id: user.uid,
                    email: user.email,
                    nombre: user.displayName || 'Funeraria',
                    token: user.accessToken
                }));
            } else {
                console.log('Usuario no autenticado');
                localStorage.removeItem('funeraria');
            }
        });
    }

    // Registrar nuevo usuario
    async register(email, password, funerariaData) {
        try {
            console.log('🔐 Iniciando registro con Firebase...');
            
            // Crear usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            console.log('✅ Usuario creado en Firebase Auth:', user.uid);

            // Actualizar perfil del usuario
            await updateProfile(user, {
                displayName: funerariaData.nombre
            });

            // Guardar datos adicionales en Firestore
            await setDoc(doc(db, 'funerarias', user.uid), {
                nombre: funerariaData.nombre,
                email: email,
                telefono: funerariaData.telefono || '',
                direccion: funerariaData.direccion || '',
                fechaCreacion: new Date().toISOString(),
                activo: true
            });

            console.log('✅ Datos de funeraria guardados en Firestore');

            return {
                success: true,
                user: user,
                message: 'Registro exitoso'
            };
        } catch (error) {
            console.error('❌ Error en registro:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code),
                code: error.code
            };
        }
    }

    // Iniciar sesión
    async login(email, password) {
        try {
            console.log('🔐 Iniciando sesión con Firebase...');
            console.log('Email usado:', email);
            console.log('Contraseña longitud:', password.length);
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            console.log('✅ Sesión iniciada:', user.email);
            console.log('Email verificado:', user.emailVerified);
            console.log('UID:', user.uid);

            // Verificar si el email está verificado
            if (!user.emailVerified) {
                console.warn('⚠️ Email no verificado');
                // No fallar el login, pero mostrar advertencia
            }

            // Obtener datos adicionales de Firestore (con manejo de errores)
            let funerariaData = {};
            try {
                const funerariaDoc = await getDoc(doc(db, 'funerarias', user.uid));
                
                if (funerariaDoc.exists()) {
                    funerariaData = funerariaDoc.data();
                    console.log('✅ Datos de funeraria encontrados en Firestore');
                } else {
                    console.warn('⚠️ No se encontraron datos de funeraria en Firestore');
                }
            } catch (firestoreError) {
                console.warn('⚠️ Error al obtener datos de Firestore:', firestoreError.message);
                console.log('📝 Continuando con login exitoso sin datos de Firestore');
                // No fallar el login por error de Firestore
            }

            return {
                success: true,
                user: user,
                emailVerified: user.emailVerified,
                funerariaData: funerariaData,
                message: 'Inicio de sesión exitoso'
            };
        } catch (error) {
            console.error('❌ Error en login - Código:', error.code);
            console.error('❌ Error en login - Mensaje completo:', error.message);
            console.error('❌ Error en login - Email usado:', email);
            return {
                success: false,
                error: this.getErrorMessage(error.code),
                code: error.code,
                fullError: error.message
            };
        }
    }

    // Cerrar sesión
    async logout() {
        try {
            await signOut(auth);
            localStorage.removeItem('funeraria');
            console.log('✅ Sesión cerrada');
            return { success: true };
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
            return { success: false, error: error.message };
        }
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Obtener datos de la funeraria desde localStorage (compatibilidad)
    getFuneraria() {
        const funerariaData = localStorage.getItem('funeraria');
        return funerariaData ? JSON.parse(funerariaData) : null;
    }

    // Iniciar sesión con Google
    async loginWithGoogle() {
        try {
            console.log('🔐 Iniciando sesión con Google...');
            
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            console.log('✅ Sesión iniciada con Google:', user.email);

            // Verificar si es la primera vez que se registra
            const funerariaDoc = await getDoc(doc(db, 'funerarias', user.uid));
            
            if (!funerariaDoc.exists()) {
                // Primera vez, crear perfil en Firestore
                await setDoc(doc(db, 'funerarias', user.uid), {
                    nombre: user.displayName || 'Funeraria',
                    email: user.email,
                    telefono: '',
                    direccion: '',
                    fechaCreacion: new Date().toISOString(),
                    activo: true,
                    provider: 'google'
                });
                console.log('✅ Perfil de Google creado en Firestore');
            }

            return {
                success: true,
                user: user,
                message: 'Inicio de sesión con Google exitoso'
            };
        } catch (error) {
            console.error('❌ Error en login con Google:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code),
                code: error.code
            };
        }
    }

    // Recuperar contraseña
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: 'Se ha enviado un correo para restablecer tu contraseña'
            };
        } catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    // Realizar peticiones autenticadas (compatibilidad con el sistema actual)
    async authenticatedFetch(url, options = {}) {
        if (!this.currentUser) {
            throw new Error('Usuario no autenticado');
        }

        // Obtener token de Firebase
        const token = await this.currentUser.getIdToken();
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        // Si el body es FormData, el navegador debe establecer el Content-Type
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        return fetch(url, {
            ...options,
            headers
        });
    }

    // Traducir códigos de error de Firebase a mensajes amigables
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'Este correo electrónico ya está registrado',
            'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
            'auth/invalid-email': 'El correo electrónico no es válido',
            'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
            'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
            'auth/invalid-credential': 'Credenciales inválidas. Verifica tu email y contraseña',
            'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
            'auth/operation-not-allowed': 'Operación no permitida',
            'auth/requires-recent-login': 'Por seguridad, inicia sesión nuevamente',
            'auth/invalid-verification-code': 'Código de verificación inválido'
        };

        const message = errorMessages[errorCode] || 'Correo electrónico o contraseña incorrectos. Código de error: ' + errorCode;
        console.log('📝 Mensaje de error mostrado al usuario:', message);
        return message;
    }

    // Métodos para manejar eventos (compatibilidad con sistema actual)
    async createEvento(eventoData) {
        if (!this.currentUser) {
            throw new Error('Usuario no autenticado');
        }

        try {
            const docRef = await addDoc(collection(db, 'funerarias', this.currentUser.uid, 'eventos'), {
                ...eventoData,
                fechaCreacion: new Date().toISOString(),
                activo: true,
                accessCode: this.generateAccessCode()
            });

            return {
                success: true,
                id: docRef.id,
                ...eventoData
            };
        } catch (error) {
            console.error('Error creando evento:', error);
            throw error;
        }
    }

    async getEventos() {
        if (!this.currentUser) {
            throw new Error('Usuario no autenticado');
        }

        try {
            const q = query(
                collection(db, 'funerarias', this.currentUser.uid, 'eventos')
            );
            const querySnapshot = await getDocs(q);

            const eventos = [];
            querySnapshot.forEach((doc) => {
                eventos.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return eventos;
        } catch (error) {
            console.error('Error obteniendo eventos:', error);
            throw error;
        }
    }

    // Generar código de acceso para eventos
    generateAccessCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
}

// Crear instancia global
window.FirebaseAuth = new FirebaseAuth();

// Exportar para compatibilidad
window.Auth = window.FirebaseAuth;

console.log('🔥 Firebase Authentication configurado correctamente');
