// Router del lado cliente para el sistema Memorial
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        
        // Escuchar cambios de URL
        window.addEventListener('popstate', () => this.handleRoute());
        window.addEventListener('DOMContentLoaded', () => this.handleRoute());
    }

    // Registrar una ruta
    register(path, handler) {
        this.routes[path] = handler;
    }

    // Navegar a una ruta
    navigate(path) {
        window.history.pushState({}, '', path);
        this.handleRoute();
    }

    // Manejar la ruta actual
    handleRoute() {
        const path = window.location.pathname;
        const app = document.getElementById('app');
        
        // Detectar tipo de ruta
        if (path === '/' || path === '/inicio') {
            this.renderHome();
        } else if (path === '/admin') {
            this.renderAdmin();
        } else if (path === '/registro') {
            this.renderRegistro();
        } else if (path.startsWith('/evento/')) {
            const eventoId = path.split('/')[2];
            this.renderEvento(eventoId);
        } else if (path.startsWith('/admin/')) {
            const funerariaId = path.split('/')[2];
            this.renderAdminDashboard(funerariaId);
        } else {
            this.render404();
        }
    }

    // Página de inicio
    renderHome() {
        document.getElementById('page-title').textContent = 'Sistema Memorial';
        document.getElementById('app').innerHTML = `
            <div class="header">
                <div class="container">
                    <div class="header-content">
                        <div class="logo">🕯️ Sistema Memorial</div>
                        <nav>
                            <ul class="nav-links">
                                <li><a href="/admin">Administradores</a></li>
                                <li><a href="/registro">Registrar Funeraria</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            
            <div class="container" style="margin-top: 40px;">
                <div class="card" style="text-align: center; max-width: 600px; margin: 0 auto;">
                    <h1>Bienvenido al Sistema Memorial</h1>
                    <p style="font-size: 18px; margin: 20px 0;">
                        Plataforma para transmisiones en vivo de servicios funerarios
                    </p>
                    
                    <div style="margin: 40px 0;">
                        <h3>¿Tienes un código de acceso?</h3>
                        <div class="form-group">
                            <input type="text" id="access-code" class="form-control" placeholder="Ingresa el código del evento" style="max-width: 300px; margin: 0 auto;">
                        </div>
                        <button onclick="joinEventByCode()" class="btn btn-primary">Acceder al Evento</button>
                    </div>
                    
                    <div style="margin-top: 40px; padding-top: 40px; border-top: 1px solid var(--border-color);">
                        <h3>Para Funerarias</h3>
                        <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                            <a href="/admin" class="btn btn-secondary">Panel de Administración</a>
                            <a href="/registro" class="btn btn-success">Registrar Funeraria</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Panel de administración (login)
    renderAdmin() {
        document.getElementById('page-title').textContent = 'Administración - Sistema Memorial';
        document.getElementById('app').innerHTML = `
            <div class="header">
                <div class="container">
                    <div class="header-content">
                        <div class="logo">🕯️ Sistema Memorial - Admin</div>
                        <nav>
                            <ul class="nav-links">
                                <li><a href="/">Inicio</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            
            <div class="container" style="margin-top: 40px;">
                <div class="card" style="max-width: 400px; margin: 0 auto;">
                    <h2 style="text-align: center; margin-bottom: 30px;">Iniciar Sesión</h2>
                    
                    <div id="login-alerts"></div>
                    
                    <form id="login-form">
                        <div class="form-group">
                            <label class="form-label">Email:</label>
                            <input type="email" id="login-email" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Contraseña:</label>
                            <input type="password" id="login-password" class="form-control" required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%;">
                            <span id="login-loading" class="loading" style="display: none;"></span>
                            Iniciar Sesión
                        </button>
                    </form>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <p>¿No tienes cuenta? <a href="/registro">Registra tu funeraria</a></p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 15px; background-color: var(--background-light); border-radius: 6px;">
                        <strong>Demostración:</strong><br>
                        Email: admin@demo.com<br>
                        Contraseña: demo123
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar formulario de login
        this.initLoginForm();
    }

    // Página de registro
    renderRegistro() {
        document.getElementById('page-title').textContent = 'Registro - Sistema Memorial';
        document.getElementById('app').innerHTML = `
            <div class="header">
                <div class="container">
                    <div class="header-content">
                        <div class="logo">🕯️ Sistema Memorial - Registro</div>
                        <nav>
                            <ul class="nav-links">
                                <li><a href="/">Inicio</a></li>
                                <li><a href="/admin">Iniciar Sesión</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            
            <div class="container" style="margin-top: 40px;">
                <div class="card" style="max-width: 500px; margin: 0 auto;">
                    <h2 style="text-align: center; margin-bottom: 30px;">Registrar Funeraria</h2>
                    
                    <div id="register-alerts"></div>
                    
                    <form id="register-form">
                        <div class="form-group">
                            <label class="form-label">Nombre de la Funeraria:</label>
                            <input type="text" id="register-nombre" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Email:</label>
                            <input type="email" id="register-email" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Contraseña:</label>
                            <input type="password" id="register-password" class="form-control" required minlength="6">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Confirmar Contraseña:</label>
                            <input type="password" id="register-confirm-password" class="form-control" required>
                        </div>
                        
                        <button type="submit" class="btn btn-success" style="width: 100%;">
                            <span id="register-loading" class="loading" style="display: none;"></span>
                            Registrar Funeraria
                        </button>
                    </form>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <p>¿Ya tienes cuenta? <a href="/admin">Iniciar sesión</a></p>
                    </div>
                </div>
            </div>
        `;
        
        // Inicializar formulario de registro
        this.initRegisterForm();
    }

    // Página de evento
    renderEvento(eventoId) {
        document.getElementById('page-title').textContent = 'Evento Memorial';
        document.getElementById('app').innerHTML = `
            <div id="evento-content">
                <!-- El contenido se cargará desde evento.js -->
            </div>
        `;
        
        // Inicializar la página del evento
        if (window.EventoPage) {
            window.EventoPage.init(eventoId);
        }
    }

    // Dashboard de administración
    renderAdminDashboard(funerariaId) {
        // Verificar autenticación
        const token = localStorage.getItem('token');
        if (!token) {
            this.navigate('/admin');
            return;
        }
        
        document.getElementById('page-title').textContent = 'Dashboard - Sistema Memorial';
        document.getElementById('app').innerHTML = `
            <div id="admin-dashboard">
                <!-- El contenido se cargará desde admin.js -->
            </div>
        `;
        
        // Inicializar dashboard
        if (window.AdminDashboard) {
            window.AdminDashboard.init(funerariaId);
        }
    }

    // Página 404
    render404() {
        document.getElementById('page-title').textContent = 'Página no encontrada';
        document.getElementById('app').innerHTML = `
            <div class="container" style="margin-top: 100px; text-align: center;">
                <div class="card" style="max-width: 500px; margin: 0 auto;">
                    <h1>404</h1>
                    <h2>Página no encontrada</h2>
                    <p>La página que buscas no existe.</p>
                    <a href="/" class="btn btn-primary">Volver al Inicio</a>
                </div>
            </div>
        `;
    }

    // Inicializar formulario de login
    initLoginForm() {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const loading = document.getElementById('login-loading');
            const alerts = document.getElementById('login-alerts');
            
            loading.style.display = 'inline-block';
            alerts.innerHTML = '';
            
            try {
                const response = await fetch('/api/funerarias/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('funeraria', JSON.stringify(data.funeraria));
                    this.navigate(`/admin/${data.funeraria.id}`);
                } else {
                    alerts.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
                }
            } catch (error) {
                alerts.innerHTML = `<div class="alert alert-error">Error de conexión</div>`;
            } finally {
                loading.style.display = 'none';
            }
        });
    }

    // Inicializar formulario de registro
    initRegisterForm() {
        const form = document.getElementById('register-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('register-nombre').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const loading = document.getElementById('register-loading');
            const alerts = document.getElementById('register-alerts');
            
            alerts.innerHTML = '';
            
            if (password !== confirmPassword) {
                alerts.innerHTML = `<div class="alert alert-error">Las contraseñas no coinciden</div>`;
                return;
            }
            
            loading.style.display = 'inline-block';
            
            try {
                const response = await fetch('/api/funerarias/registro', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombre, email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alerts.innerHTML = `<div class="alert alert-success">Funeraria registrada exitosamente. Puedes iniciar sesión.</div>`;
                    form.reset();
                    setTimeout(() => {
                        this.navigate('/admin');
                    }, 2000);
                } else {
                    alerts.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
                }
            } catch (error) {
                alerts.innerHTML = `<div class="alert alert-error">Error de conexión</div>`;
            } finally {
                loading.style.display = 'none';
            }
        });
    }
}

// Crear instancia global del router
window.router = new Router();

// Función global para acceder a evento por código
window.joinEventByCode = function() {
    const codeInput = document.getElementById('access-code');
    if (!codeInput) {
        alert('Error: Campo de código no encontrado');
        return;
    }
    
    const code = codeInput.value.trim();
    if (!code) {
        alert('Por favor ingresa un código de acceso');
        return;
    }
    
    // Buscar evento por código
    // Por ahora redirigimos a los eventos demo
    if (code === '1234') {
        if (window.router) {
            window.router.navigate('/evento/evento-1');
        } else {
            window.location.href = '/evento/evento-1';
        }
    } else if (code === '5678') {
        if (window.router) {
            window.router.navigate('/evento/evento-2');
        } else {
            window.location.href = '/evento/evento-2';
        }
    } else {
        alert('Código de acceso inválido');
    }
};