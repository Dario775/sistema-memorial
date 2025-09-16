// Dashboard de administración para funerarias
window.AdminDashboard = {
    currentFunerariaId: null,
    eventos: [],

    init(funerariaId) {
        this.currentFunerariaId = funerariaId;
        this.render();
        this.loadEventos();
    },

    render() {
        const funeraria = Auth.getFuneraria();
        const container = document.getElementById('admin-dashboard');
        
        container.innerHTML = `
            <div class="header">
                <div class="container">
                    <div class="header-content">
                        <div class="logo">🕯️ ${funeraria ? funeraria.nombre : 'Dashboard'}</div>
                        <nav>
                            <ul class="nav-links">
                                <li><a href="/">Inicio</a></li>
                                <li><a href="#" onclick="Auth.logout()">Cerrar Sesión</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            
            <div class="container" style="margin-top: 40px;">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2>Mis Eventos</h2>
                        <button onclick="AdminDashboard.showCreateEventModal()" class="btn btn-primary">
                            + Crear Evento
                        </button>
                    </div>
                    
                    <div id="eventos-alerts"></div>
                    <div id="eventos-loading" class="loading" style="display: none; margin: 20px auto;"></div>
                    <div id="eventos-list">
                        <!-- Los eventos se cargarán aquí -->
                    </div>
                </div>
            </div>
            
            <!-- Modal para crear/editar evento -->
            <div id="event-modal" class="modal">
                <div class="modal-content">
                    <span class="modal-close" onclick="AdminDashboard.hideEventModal()">&times;</span>
                    <h3 id="modal-title">Crear Evento</h3>
                    
                    <div id="modal-alerts"></div>
                    
                    <form id="event-form">
                        <input type="hidden" id="event-id">
                        
                        <div class="form-group">
                            <label class="form-label">Nombre del Evento:</label>
                            <input type="text" id="event-nombre" class="form-control" required placeholder="Memorial Juan Pérez">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Frase Conmemorativa:</label>
                            <textarea id="event-frase" class="form-control" rows="3" placeholder="Con amor, te recordaremos siempre..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">ID del Video de YouTube:</label>
                            <input type="text" id="event-video" class="form-control" placeholder="dQw4w9WgXcQ">
                            <small style="color: var(--text-secondary);">Solo el ID del video, no la URL completa</small>
                        </div>
                        
                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="event-activo" checked>
                                <span>Evento activo</span>
                            </label>
                        </div>
                        
                        <div style="display: flex; gap: 10px; justify-content: flex-end;">
                            <button type="button" onclick="AdminDashboard.hideEventModal()" class="btn btn-secondary">Cancelar</button>
                            <button type="submit" class="btn btn-primary">
                                <span id="event-form-loading" class="loading" style="display: none;"></span>
                                <span id="event-form-text">Guardar</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.initEventForm();
    },

    async loadEventos() {
        const loading = document.getElementById('eventos-loading');
        const alerts = document.getElementById('eventos-alerts');
        const list = document.getElementById('eventos-list');
        
        loading.style.display = 'block';
        alerts.innerHTML = '';
        
        try {
            const response = await Auth.authenticatedFetch(`/api/funerarias/${this.currentFunerariaId}/eventos`);
            const eventos = await response.json();
            
            this.eventos = eventos;
            this.renderEventos();
        } catch (error) {
            alerts.innerHTML = `<div class="alert alert-error">Error al cargar eventos: ${error.message}</div>`;
        } finally {
            loading.style.display = 'none';
        }
    },

    renderEventos() {
        const list = document.getElementById('eventos-list');
        
        if (this.eventos.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <h3>No tienes eventos creados</h3>
                    <p>Crea tu primer evento memorial para comenzar</p>
                </div>
            `;
            return;
        }

        const eventosHtml = this.eventos.map(evento => `
            <div class="card" style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: between; align-items: flex-start; gap: 20px;">
                    <div style="flex: 1;">
                        <h4>${evento.nombre}</h4>
                        <p style="color: var(--text-secondary); margin: 5px 0;">${evento.displayPhrase}</p>
                        <div style="margin: 10px 0;">
                            <span class="badge ${evento.activo ? 'badge-success' : 'badge-secondary'}">
                                ${evento.activo ? 'Activo' : 'Inactivo'}
                            </span>
                            <span style="margin-left: 10px; font-family: monospace; background: var(--background-light); padding: 4px 8px; border-radius: 4px;">
                                Código: ${evento.accessCode}
                            </span>
                        </div>
                        <div style="margin: 10px 0; font-size: 14px; color: var(--text-secondary);">
                            Creado: ${new Date(evento.fechaCreacion).toLocaleDateString()}
                        </div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <a href="/evento/${evento.id}" target="_blank" class="btn btn-secondary" style="font-size: 12px;">
                            Ver Evento
                        </a>
                        <button onclick="AdminDashboard.editEvento('${evento.id}')" class="btn btn-primary" style="font-size: 12px;">
                            Editar
                        </button>
                        <button onclick="AdminDashboard.toggleEvento('${evento.id}', ${!evento.activo})" 
                                class="btn ${evento.activo ? 'btn-warning' : 'btn-success'}" style="font-size: 12px;">
                            ${evento.activo ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        list.innerHTML = eventosHtml;
    },

    showCreateEventModal() {
        document.getElementById('modal-title').textContent = 'Crear Evento';
        document.getElementById('event-form').reset();
        document.getElementById('event-id').value = '';
        document.getElementById('event-activo').checked = true;
        document.getElementById('event-form-text').textContent = 'Crear';
        document.getElementById('event-modal').style.display = 'block';
    },

    editEvento(eventoId) {
        const evento = this.eventos.find(e => e.id === eventoId);
        if (!evento) return;

        document.getElementById('modal-title').textContent = 'Editar Evento';
        document.getElementById('event-id').value = evento.id;
        document.getElementById('event-nombre').value = evento.nombre;
        document.getElementById('event-frase').value = evento.displayPhrase;
        document.getElementById('event-video').value = evento.youtubeVideoId;
        document.getElementById('event-activo').checked = evento.activo;
        document.getElementById('event-form-text').textContent = 'Actualizar';
        document.getElementById('event-modal').style.display = 'block';
    },

    hideEventModal() {
        document.getElementById('event-modal').style.display = 'none';
        document.getElementById('modal-alerts').innerHTML = '';
    },

    async toggleEvento(eventoId, newStatus) {
        try {
            const response = await Auth.authenticatedFetch(
                `/api/funerarias/${this.currentFunerariaId}/eventos/${eventoId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ activo: newStatus })
                }
            );

            if (response.ok) {
                await this.loadEventos();
                document.getElementById('eventos-alerts').innerHTML = 
                    `<div class="alert alert-success">Evento ${newStatus ? 'activado' : 'desactivado'} correctamente</div>`;
            }
        } catch (error) {
            document.getElementById('eventos-alerts').innerHTML = 
                `<div class="alert alert-error">Error al actualizar evento</div>`;
        }
    },

    initEventForm() {
        const form = document.getElementById('event-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const eventId = document.getElementById('event-id').value;
            const nombre = document.getElementById('event-nombre').value;
            const displayPhrase = document.getElementById('event-frase').value;
            const youtubeVideoId = document.getElementById('event-video').value;
            const activo = document.getElementById('event-activo').checked;
            
            const loading = document.getElementById('event-form-loading');
            const alerts = document.getElementById('modal-alerts');
            
            loading.style.display = 'inline-block';
            alerts.innerHTML = '';
            
            try {
                const url = eventId 
                    ? `/api/funerarias/${this.currentFunerariaId}/eventos/${eventId}`
                    : `/api/funerarias/${this.currentFunerariaId}/eventos`;
                
                const method = eventId ? 'PUT' : 'POST';
                
                const response = await Auth.authenticatedFetch(url, {
                    method,
                    body: JSON.stringify({
                        nombre,
                        displayPhrase,
                        youtubeVideoId,
                        activo
                    })
                });
                
                if (response.ok) {
                    this.hideEventModal();
                    await this.loadEventos();
                    document.getElementById('eventos-alerts').innerHTML = 
                        `<div class="alert alert-success">Evento ${eventId ? 'actualizado' : 'creado'} correctamente</div>`;
                } else {
                    const data = await response.json();
                    alerts.innerHTML = `<div class="alert alert-error">${data.error}</div>`;
                }
            } catch (error) {
                alerts.innerHTML = `<div class="alert alert-error">Error de conexión</div>`;
            } finally {
                loading.style.display = 'none';
            }
        });
    }
};

// Agregar estilos para badges
if (!document.getElementById('badge-styles')) {
    const style = document.createElement('style');
    style.id = 'badge-styles';
    style.textContent = `
        .badge {
            display: inline-block;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            border-radius: 4px;
        }
        .badge-success {
            background-color: var(--success-color);
            color: white;
        }
        .badge-secondary {
            background-color: var(--text-secondary);
            color: white;
        }
        .btn-warning {
            background-color: var(--warning-color);
            color: white;
        }
        .btn-warning:hover {
            background-color: #e67e22;
        }
    `;
    document.head.appendChild(style);
}