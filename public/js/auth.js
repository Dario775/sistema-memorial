// Módulo de autenticación
window.Auth = {
    // Verificar si el usuario está autenticado
    isAuthenticated() {
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        try {
            // Verificar si el token no ha expirado
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp > now;
        } catch (error) {
            return false;
        }
    },

    // Obtener datos de la funeraria autenticada
    getFuneraria() {
        const funerariaData = localStorage.getItem('funeraria');
        return funerariaData ? JSON.parse(funerariaData) : null;
    },

    // Obtener el token de autenticación
    getToken() {
        return localStorage.getItem('token');
    },

    // Cerrar sesión
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('funeraria');
        window.router.navigate('/admin');
    },

    // Realizar petición autenticada
    async authenticatedFetch(url, options = {}) {
        const token = this.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401 || response.status === 403) {
            this.logout();
            throw new Error('Sesión expirada');
        }

        return response;
    }
};