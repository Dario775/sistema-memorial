// Script de prueba para debuggear el sistema
console.log('=== INICIANDO PRUEBAS DEL SISTEMA ===');

// Función para probar el acceso por código
function testAccessCode() {
    console.log('Probando acceso por código...');
    
    // Simular entrada de código
    const input = document.getElementById('access-code');
    if (input) {
        input.value = '1234';
        console.log('Código ingresado:', input.value);
        
        // Probar la función
        if (typeof window.joinEventByCode === 'function') {
            console.log('Función joinEventByCode disponible');
            try {
                window.joinEventByCode();
                console.log('Función ejecutada exitosamente');
            } catch (error) {
                console.error('Error al ejecutar joinEventByCode:', error);
            }
        } else {
            console.error('Función joinEventByCode no disponible');
        }
    } else {
        console.error('Campo access-code no encontrado');
    }
}

// Función para probar la navegación
function testNavigation() {
    console.log('Probando navegación...');
    
    if (window.router) {
        console.log('Router disponible');
        try {
            window.router.navigate('/admin');
            console.log('Navegación a /admin exitosa');
        } catch (error) {
            console.error('Error en navegación:', error);
        }
    } else {
        console.error('Router no disponible');
    }
}

// Función para probar la autenticación
function testAuth() {
    console.log('Probando autenticación...');
    
    if (window.Auth) {
        console.log('Módulo Auth disponible');
        console.log('Está autenticado:', window.Auth.isAuthenticated());
    } else {
        console.error('Módulo Auth no disponible');
    }
}

// Ejecutar pruebas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('=== EJECUTANDO PRUEBAS ===');
        testAuth();
        testNavigation();
        
        // Solo probar acceso por código si estamos en la página principal
        if (window.location.pathname === '/') {
            testAccessCode();
        }
        
        console.log('=== PRUEBAS COMPLETADAS ===');
    }, 1000);
});

// Agregar al objeto global para acceso manual
window.testFunctions = {
    testAccessCode,
    testNavigation,
    testAuth
};