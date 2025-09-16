// Archivo principal de la aplicación
console.log('Iniciando Sistema Memorial...');

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema Memorial cargado correctamente');
    
    // Verificar que todos los módulos estén disponibles
    if (typeof Router === 'undefined') {
        console.error('Router no está disponible');
        return;
    }
    
    if (typeof window.Auth === 'undefined') {
        console.error('Auth no está disponible');
        return;
    }
    
    console.log('Todos los módulos cargados correctamente');
    
    // Manejar enlaces de navegación
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.href) {
            const url = new URL(e.target.href);
            
            // Solo manejar enlaces internos
            if (url.hostname === window.location.hostname) {
                e.preventDefault();
                if (window.router) {
                    window.router.navigate(url.pathname);
                } else {
                    window.location.href = url.pathname;
                }
            }
        }
    });
    
    // Verificar autenticación en páginas de admin
    function checkAuth() {
        const path = window.location.pathname;
        if (path.startsWith('/admin/') && window.Auth && !window.Auth.isAuthenticated()) {
            if (window.router) {
                window.router.navigate('/admin');
            } else {
                window.location.href = '/admin';
            }
        }
    }
    
    // Verificar autenticación periódicamente
    setInterval(checkAuth, 60000); // Cada minuto
    
    // Manejar el botón de retroceso del navegador
    window.addEventListener('popstate', function() {
        if (window.router) {
            window.router.handleRoute();
        }
    });
});

// Funciones globales útiles
window.utils = {
    // Formatear fecha
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            box-shadow: var(--shadow-lg);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    },
    
    // Confirmar acción
    confirm(message) {
        return window.confirm(message);
    },
    
    // Generar código aleatorio
    generateCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
};