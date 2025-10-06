// Página del evento memorial
window.EventoPage = {
    socket: null,
    eventoId: null,
    isAuthenticated: false,
    username: null,
    roomJoined: false,

    init(eventoId) {
        this.eventoId = eventoId;
        this.render();
        this.initSocket();
    },

    render() {
        const container = document.getElementById('evento-content');
        container.innerHTML = `
            <style>
                /* Evitar scroll en toda la página: pensado para TV/TV Box */
                html, body { height: 100%; overflow: hidden; }

                /* Capa de fondo difuminada (solo el contenido del evento) */
                .background-blur {
                    filter: blur(8px);
                    transition: filter 0.5s ease;
                }
                .background-blur.authenticated {
                    filter: none;
                }

                /* Overlay del acceso (no difuminado) */
                .access-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .access-modal {
                    background: rgba(255,255,255,0.98);
                    border-radius: 20px;
                    padding: 36px;
                    max-width: 460px;
                    width: 92%;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.25);
                    border: 1px solid rgba(0,0,0,0.06);
                    text-align: center;
                    animation: modalSlideIn 0.45s ease-out;
                }

                @keyframes modalSlideIn {
                    from { opacity: 0; transform: translateY(-18px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .access-modal h2 { color: var(--primary-color); margin-bottom: 8px; font-size: 26px; font-weight: 800; }
                .access-modal .subtitle { color: var(--text-secondary); margin-bottom: 22px; }

                .glass-input { width: 100%; padding: 14px 16px; border: 1px solid var(--border-color); border-radius: 12px; background: #fff; font-size: 16px; outline: none; transition: box-shadow .2s, border-color .2s; }
                .glass-input:focus { border-color: var(--secondary-color); box-shadow: 0 0 0 4px rgba(52,152,219,.12); }

                .access-btn { width: 100%; padding: 14px 18px; background: linear-gradient(135deg, var(--secondary-color), var(--primary-color)); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: transform .15s ease, box-shadow .2s ease; }
                .access-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(52,152,219,.35); }

                .memorial-icon { font-size: 44px; margin-bottom: 14px; }

                /* Estilos del layout del evento (sin scroll, siempre a pantalla completa) */
                .evento-layout { display: flex; height: 100vh; background-color: var(--background-light); }
                .video-section { flex: 1 1 auto; min-width: 0; background: #000; display: flex; flex-direction: column; position: relative; }
                .video-header { flex: 0 0 64px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; padding: 0 20px; text-align: center; box-shadow: none; }
                .video-header h2 { margin: 0; letter-spacing: 0.3px; font-weight: 800; font-size: 20px; }
                .video-container { position: relative; flex: 1 1 auto; min-height: 0; display: flex; justify-content: center; align-items: center; padding: 0; overflow: hidden; background: #000; }
                /* El iframe ocupa todo el alto disponible y mantiene el contenido con letterboxing dentro del propio reproductor */
                .video-container iframe { width: 100%; height: 100%; max-width: none; border: none; border-radius: 0; pointer-events: none; box-shadow: none; background: #000; display: block; backface-visibility: hidden; transform: translateZ(0); }
                /* Máscara superior para ocultar overlays/controles de YouTube */
                /* Desactivado para evitar líneas o bandas en TV */
                .video-overlay-top { display: none; }
                .memorial-phrase { flex: 0 0 72px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); color: #fff; padding: 0 22px; text-align: center; font-size: 16px; font-style: italic; overflow: hidden; }
                .memorial-phrase p { margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .chat-section { width: 336px; height: 100vh; background: var(--container-bg); display: flex; flex-direction: column; border-left: 1px solid var(--border-color); box-shadow: inset 8px 0 16px rgba(0,0,0,0.02); }
                .chat-header { flex: 0 0 60px; display: flex; align-items: center; justify-content: center; background: var(--primary-color); color: #fff; padding: 0 20px; text-align: center; font-weight: 700; letter-spacing: .2px; }
                .chat-messages { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 16px; }
                .chat-input-area { flex: 0 0 auto; padding: 14px; border-top: 1px solid var(--border-color); background: var(--background-light); }
                /* Estilo novedoso de burbujas */
                .message { margin-bottom: 12px; padding: 10px 12px; border-radius: 14px; background: #fff; border: 1px solid var(--border-color); box-shadow: var(--shadow); max-width: 80%; width: fit-content; animation: fadeInUp .18s ease; }
                .message.other { background: #fff; }
                .message.mine { background: linear-gradient(135deg, var(--secondary-color), var(--primary-color)); color: #fff; border: none; margin-left: 0; box-shadow: 0 8px 18px rgba(52,152,219,.35); }
                .message.mine .message-user, .message.mine .message-time { color: rgba(255,255,255,0.9); }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
                .message.system { background: var(--secondary-color); border-color: var(--secondary-color); color: white; text-align: center; font-style: italic; font-size: 14px; box-shadow: none; }
                .message-user { font-weight: 700; color: var(--primary-color); }
                .message-time { font-size: 11px; color: var(--text-secondary); margin-left: 10px; }
                .message-text { margin-top: 5px; }
                /* Asegurar tamaño/alineación correcto para emojis renderizados como imágenes en mensajes */
                .message-text img.emoji { width: 1.2em; height: 1.2em; vertical-align: -0.2em; }
                /* Se eliminó el indicador de conectados */

                /* Barra de emojis de condolencias */
                .emoji-bar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
                .emoji-btn { border: 1px solid var(--border-color); background: #fff; padding: 6px 8px; border-radius: 8px; cursor: pointer; font-size: 18px; line-height: 1; transition: transform .1s ease, box-shadow .2s ease; }
                .emoji-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
                /* Asegurar tamaño correcto cuando Twemoji reemplace por <img class="emoji"> */
                .emoji-btn img.emoji { width: 20px; height: 20px; display: block; }

                @media (max-width: 768px) {
                    .evento-layout { flex-direction: column; }
                    .chat-section { width: 100%; height: 340px; }
                    .video-section { height: calc(100vh - 340px); }
                    .video-overlay-top { top: 10px; left: 10px; right: 10px; height: 48px; }
                }
            </style>

            <!-- Contenido del evento: difuminado de inicio -->
            <div id="background-content" class="background-blur">
                <div class="evento-layout">
                    <div class="video-section">
                        <div class="video-header">
                            <h2 id="event-name">Evento Memorial</h2>
                        </div>
                        <div class="video-container">
                            <div class="video-overlay-top" aria-hidden="true"></div>
                            <iframe id="youtube-player" src="" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
                        </div>
                        <div class="memorial-phrase"><p id="memorial-text">Cargando...</p></div>
                    </div>
                    <div class="chat-section">
                        <div class="chat-header"><h3>💭 Mensajes de Condolencias</h3></div>
                        <div id="chat-messages" class="chat-messages"></div>
                        <div class="chat-input-area">
                            <div id="username-form" style="display: block;">
                                <div class="form-group"><input type="text" id="username-input" class="form-control" placeholder="Tu nombre" required></div>
                                <button onclick="EventoPage.setUsername()" class="btn btn-primary" style="width: 100%;">Unirse al Memorial</button>
                            </div>
                            <div id="chat-form" style="display: none;">
                                <div id="emoji-bar" class="emoji-bar" aria-label="Emoticonos de condolencias">
                                    <button type="button" class="emoji-btn" data-emoji="🕊️" title="Paloma">🕊️</button>
                                    <button type="button" class="emoji-btn" data-emoji="🕯️" title="Vela">🕯️</button>
                                    <button type="button" class="emoji-btn" data-emoji="🌹" title="Rosa">🌹</button>
                                    <button type="button" class="emoji-btn" data-emoji="💐" title="Flores">💐</button>
                                    <button type="button" class="emoji-btn" data-emoji="🤍" title="Corazón blanco">🤍</button>
                                    <button type="button" class="emoji-btn" data-emoji="🖤" title="Corazón negro">🖤</button>
                                    <button type="button" class="emoji-btn" data-emoji="🙏" title="Oración">🙏</button>
                                    <button type="button" class="emoji-btn" data-emoji="✝️" title="Cruz">✝️</button>
                                    <button type="button" class="emoji-btn" data-emoji="🪽" title="Alas">🪽</button>
                                    <button type="button" class="emoji-btn" data-emoji="🌟" title="Estrella">🌟</button>
                                    <button type="button" class="emoji-btn" data-emoji="🌼" title="Margarita">🌼</button>
                                    <button type="button" class="emoji-btn" data-emoji="🪦" title="Recuerdo">🪦</button>
                                    <button type="button" class="emoji-btn" data-emoji="🤲" title="Manos">🤲</button>
                                    <button type="button" class="emoji-btn" data-emoji="🫶" title="Corazón con manos">🫶</button>
                                </div>
                                <div class="form-group" style="display: flex; gap: 10px;">
                                    <input type="text" id="message-input" class="form-control" placeholder="Escribe un mensaje..." style="flex: 1;">
                                    <button onclick="EventoPage.sendMessage()" class="btn btn-primary">Enviar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de acceso: NO difuminado -->
            <div id="access-overlay" class="access-overlay">
                <div class="access-modal">
                    <div class="memorial-icon">🕊️</div>
                    <h2>Acceso al Memorial</h2>
                    <p class="subtitle">Ingresa tu nombre y el código para acceder</p>
                    <div id="access-alerts"></div>
                    <form id="access-form">
                        <div class="form-group">
                            <input type="text" id="full-name-input" class="glass-input" placeholder="Nombre y Apellido" required>
                        </div>
                        <div class="form-group">
                            <input type="text" id="access-code-input" class="glass-input" placeholder="Código de acceso (4 dígitos)" maxlength="4" required>
                        </div>
                        <button type="submit" class="access-btn">
                            <span id="access-loading" class="loading"></span>
                            <span id="btn-text">Ingresar al Memorial</span>
                        </button>
                    </form>
                </div>
            </div>
        `;

        this.initAccessForm();
        this.initEmojiBar();
        this.initTwemoji();
    },

    initSocket() {
        this.socket = io();
        
        // Unirse a la sala apenas el socket se conecta para precargar el video
        this.socket.on('connect', () => {
            if (this.eventoId && !this.roomJoined) {
                this.socket.emit('join room', this.eventoId);
                this.roomJoined = true;
            }
        });

        // Si se desconecta, permitir que al reconectar se vuelva a unir
        this.socket.on('disconnect', () => {
            this.roomJoined = false;
        });
        
        // Eliminado: contador de usuarios conectados

        this.socket.on('event details', (data) => {
            console.log('📺 Recibiendo detalles del evento:', data);
            
            document.getElementById('event-name').textContent = data.nombre || 'Evento Memorial';
            document.getElementById('memorial-text').textContent = data.phrase || 'Cargando...';
            
            if (data.videoId) {
                // Usar dominio "youtube-nocookie" y parámetros que ocultan controles y overlays
                const youtubeUrl = `https://www.youtube-nocookie.com/embed/${data.videoId}?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&cc_load_policy=0`;
                console.log('🎥 Configurando video URL:', youtubeUrl);
                document.getElementById('youtube-player').src = youtubeUrl;
            } else {
                console.log('❌ No se recibió videoId');
                document.getElementById('youtube-player').src = '';
            }
        });

        this.socket.on('chat message', (msg) => {
            this.addMessage(msg.user, msg.text, msg.timestamp);
        });

        this.socket.on('user connected', (data) => {
            this.addSystemMessage(`${data.username} se ha unido al memorial`);
        });

        this.socket.on('user disconnected', (data) => {
            this.addSystemMessage(`${data.username} se ha desconectado`);
        });

        this.socket.on('update phrase', (newPhrase) => {
            document.getElementById('memorial-text').textContent = newPhrase;
        });

        this.socket.on('error', (data) => {
            alert('Error: ' + data.message);
        });
    },

    initAccessForm() {
        const form = document.getElementById('access-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateAccess();
        });

        // Auto-enviar si hay código en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            document.getElementById('access-code-input').value = code;
            this.validateAccess();
        }
    },

    async validateAccess() {
        const fullName = document.getElementById('full-name-input').value.trim();
        const code = document.getElementById('access-code-input').value.trim();
        const loading = document.getElementById('access-loading');
        const btnText = document.getElementById('btn-text');
        const alerts = document.getElementById('access-alerts');
    
        if (!fullName) {
            alerts.innerHTML = '<div class="alert alert-error">Por favor ingresa tu nombre y apellido</div>';
            return;
        }
        if (!code) {
            alerts.innerHTML = '<div class="alert alert-error">Por favor ingresa un código de acceso</div>';
            return;
        }
        if (code.length !== 4) {
            alerts.innerHTML = '<div class="alert alert-error">El código debe tener exactamente 4 dígitos</div>';
            return;
        }
    
        loading.style.display = 'inline-block';
        btnText.textContent = 'Verificando...';
        alerts.innerHTML = '';
    
        this.fullName = fullName;
        const [firstName, ...rest] = fullName.split(' ');
        const lastName = rest.join(' ').trim();
    
        console.log(`🔐 Validando acceso para: "${this.fullName}" con código: "${code}" para evento: "${this.eventoId}"`);
    
        const timeout = setTimeout(() => {
            loading.style.display = 'none';
            btnText.textContent = 'Ingresar al Memorial';
            alerts.innerHTML = '<div class="alert alert-error">Tiempo de espera agotado. Verifica tu conexión e intenta nuevamente.</div>';
        }, 10000);
    
        const token = localStorage.getItem('authToken'); // Obtener el token almacenado
    
        try {
            const response = await fetch(`/api/eventos/${this.eventoId}/validate-access`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    firstName: firstName || fullName,
                    lastName,
                    fullName: this.fullName
                })
            });
    
            clearTimeout(timeout);
            loading.style.display = 'none';
            btnText.textContent = 'Ingresar al Memorial';
    
            if (response.ok) {
                const data = await response.json();
                this.isAuthenticated = true;
    
                if (data.eventId && data.eventId !== this.eventoId) {
                    this.eventoId = data.eventId;
                    if (window.history && window.history.replaceState) {
                        window.history.replaceState(null, null, `/evento/${data.eventId}`);
                    }
                }
    
                const overlay = document.getElementById('access-overlay');
                const bg = document.getElementById('background-content');
                overlay.style.opacity = '0';
                bg.classList.add('authenticated');
                setTimeout(() => { overlay.style.display = 'none'; }, 400);
    
                if (!this.roomJoined) {
                    this.socket.emit('join room', this.eventoId);
                    this.roomJoined = true;
                }
                this.setUsername(this.fullName);
            } else {
                const errorData = await response.json();
                alerts.innerHTML = `
                    <div class="alert alert-error">
                        <strong>${errorData.error || 'Error de autenticación'}</strong><br>
                        Verifica que el código sea correcto y que el evento esté activo.
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error al validar el acceso:', error);
            alerts.innerHTML = '<div class="alert alert-error">Error al conectar con el servidor. Intenta nuevamente.</div>';
        }
    }
    
    setUsername(name) {
        const username = (name ? name : (document.getElementById('username-input')?.value || '')).trim();
        if (!username) return;
        
        this.username = username;
        localStorage.setItem('memorial-username', username);
        
        const usernameForm = document.getElementById('username-form');
        const chatForm = document.getElementById('chat-form');
        if (usernameForm) usernameForm.style.display = 'none';
        if (chatForm) chatForm.style.display = 'block';
        
        this.socket.emit('user joined', username);
        
        const messageInput = document.getElementById('message-input');
        if (messageInput && !messageInput.dataset.enterHandlerAdded) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            messageInput.dataset.enterHandlerAdded = 'true';
        }
    },

    sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message || !this.username) return;
        
        this.socket.emit('chat message', {
            user: this.username,
            text: message
        });
        
        messageInput.value = '';
    },

    addMessage(user, text, timestamp) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        const isMine = (user === this.username);
        messageElement.className = 'message ' + (isMine ? 'mine' : 'other');
        
        const time = new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Si Twemoji no está disponible, usar un fallback de normalización para evitar cuadrados (tofu)
        const safeText = (window.twemoji && typeof window.twemoji.parse === 'function') ? text : this.normalizeEmojiFallback(text);

        messageElement.innerHTML = `
            <div>
                <span class="message-user">${user}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">${safeText}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Renderizar emojis de forma consistente si Twemoji está disponible
        if (window.twemoji) {
            try {
                const opts = this._twemojiOptions || {
                    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@15.1.0/assets/',
                    folder: 'svg',
                    ext: '.svg'
                };
                window.twemoji.parse(messageElement, opts);
            } catch (e) { /* noop */ }
        }
    },

    addSystemMessage(text) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message system';
        messageElement.textContent = text;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Renderizar emojis si Twemoji está disponible
        if (window.twemoji) {
            try {
                const opts = this._twemojiOptions || {
                    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@15.1.0/assets/',
                    folder: 'svg',
                    ext: '.svg'
                };
                window.twemoji.parse(messageElement, opts);
            } catch (e) { /* noop */ }
        }
    },

    initEmojiBar() {
        const bar = document.getElementById('emoji-bar');
        if (!bar) return;
        bar.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-emoji]');
            if (!btn) return;
            const emoji = btn.getAttribute('data-emoji') || '';
            const input = document.getElementById('message-input');
            if (!input) return;

            const start = input.selectionStart ?? input.value.length;
            const end = input.selectionEnd ?? input.value.length;
            input.value = input.value.slice(0, start) + emoji + input.value.slice(end);
            const newPos = start + emoji.length;
            input.setSelectionRange(newPos, newPos);
            input.focus();
        });
    },

    // Cargar Twemoji para asegurar compatibilidad visual de emojis (incluye 🫶, 🪽, 🪦)
    initTwemoji() {
        this._twemojiOptions = {
            base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@15.1.0/assets/',
            folder: 'svg',
            ext: '.svg'
        };

        const apply = () => {
            this.applyTwemoji();
            // Observar nuevos mensajes y parsearlos automáticamente
            try {
                const msgs = document.getElementById('chat-messages');
                if (msgs && !this._emojiObserver && window.MutationObserver) {
                    this._emojiObserver = new MutationObserver((mutations) => {
                        const opts = this._twemojiOptions;
                        mutations.forEach(m => {
                            m.addedNodes.forEach(node => {
                                if (node.nodeType === 1) {
                                    try { window.twemoji.parse(node, opts); } catch (_) {}
                                }
                            });
                        });
                    });
                    this._emojiObserver.observe(msgs, { childList: true });
                }
            } catch (_) { /* noop */ }
        };

        if (window.twemoji && typeof window.twemoji.parse === 'function') {
            apply();
            return;
        }

        // Intentar cargar Twemoji con múltiples CDNs por robustez
        const urls = [
            'https://cdn.jsdelivr.net/npm/twemoji@15.1.0/dist/twemoji.min.js',
            'https://unpkg.com/twemoji@15.1.0/dist/twemoji.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/twemoji/15.1.0/twemoji.min.js'
        ];

        const tryLoad = (i = 0) => {
            if (i >= urls.length) {
                this._twemojiFailed = true;
                // Fallback simple: reemplazos de emergencia para 3 emojis si Twemoji falla
                try {
                    const bar = document.getElementById('emoji-bar');
                    if (bar) {
                        bar.querySelectorAll('button[data-emoji]').forEach(btn => {
                            const e = btn.getAttribute('data-emoji');
                            if (e === '🫶') btn.textContent = '🤍';
                            if (e === '🪽') btn.textContent = '🕊️';
                            if (e === '🪦') btn.textContent = '🕯️';
                        });
                    }
                } catch (_) { /* noop */ }
                return;
            }
            const s = document.createElement('script');
            s.src = urls[i];
            s.async = true;
            s.crossOrigin = 'anonymous';
            s.onload = apply;
            s.onerror = () => tryLoad(i + 1);
            document.head.appendChild(s);
        };
        tryLoad(0);
    },

    applyTwemoji() {
        try {
            const opts = this._twemojiOptions;
            const bar = document.getElementById('emoji-bar');
            if (bar) window.twemoji.parse(bar, opts);
            // También aplicar a mensajes ya presentes
            const msgs = document.getElementById('chat-messages');
            if (msgs) window.twemoji.parse(msgs, opts);
            // Y a algunos textos visibles
            const title = document.getElementById('event-name');
            const phrase = document.getElementById('memorial-text');
            if (title) window.twemoji.parse(title, opts);
            if (phrase) window.twemoji.parse(phrase, opts);
        } catch (e) {
            // Silencioso: no romper la UI si falla
        }
    },

    // Reemplazos conservadores si Twemoji no está disponible en el cliente
    normalizeEmojiFallback(text) {
        if (!text) return '';
        // Sustituir algunos emojis recientes por equivalentes más compatibles
        return text
            .replaceAll('🫶', '🤍') // corazón con manos -> corazón blanco
            .replaceAll('🪽', '🕊️') // alas -> paloma
            .replaceAll('🪦', '🕯️'); // lápida -> vela
    }
};