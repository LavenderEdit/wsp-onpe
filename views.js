export function getFrontendHTML() {
    return `
<!DOCTYPE html>
<html lang="es" class="h-full bg-slate-950 text-slate-100">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- ================= SEO & META TAGS ================= -->
    <title>W Sender | Plataforma de Envío Masivo Inteligente</title>
    <meta name="description" content="W Sender es la herramienta definitiva para automatizar mensajes de WhatsApp. Gestiona contactos, envía archivos multimedia y optimiza tu comunicación en tiempo real.">
    <meta name="keywords" content="w sender, whatsapp masivo, automatización de mensajes, marketing por whatsapp, envío masivo, herramienta saas">
    <meta name="author" content="W Sender Platform">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Social Media Meta Tags -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="W Sender | Envío Masivo Inteligente">
    <meta property="og:description" content="Conecta tu dispositivo y automatiza tus campañas de mensajes en segundos.">
    <meta property="og:site_name" content="W Sender">
    
    <!-- Favicon Inline (SVG moderno) -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='22' y1='2' x2='11' y2='13'></line><polygon points='22 2 15 22 11 13 2 9 22 2'></polygon></svg>">
    <!-- =================================================== -->

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <style>
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #059669; }
        
        .spinner { border: 3px solid rgba(16, 185, 129, 0.2); border-left-color: #10b981; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .glass-panel { background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(30, 41, 59, 0.8); }
        .text-gradient { background: linear-gradient(to right, #34d399, #2dd4bf); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    </style>
</head>
<body class="h-full font-sans flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
    
    <!-- Overlay de carga global -->
    <div id="global-loader" class="hidden fixed inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center backdrop-blur-md transition-opacity">
        <div class="relative">
            <div class="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div class="spinner w-14 h-14 mb-4 border-emerald-500 relative z-10"></div>
        </div>
        <p class="text-emerald-400 font-semibold tracking-wide animate-pulse">Procesando petición...</p>
    </div>

    <!-- PANTALLA DE AUTENTICACIÓN -->
    <div id="auth-section" class="hidden flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Decoración de fondo -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div class="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative z-10">
            <div class="text-center mb-8">
                <div class="w-16 h-16 mx-auto bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4 transform -rotate-3 transition hover:rotate-0">
                    <i data-lucide="send" class="h-8 w-8 text-slate-950 translate-y-0.5 -translate-x-0.5"></i>
                </div>
                <h2 class="text-3xl font-extrabold tracking-tight">W <span class="text-gradient">Sender</span></h2>
                <p class="text-slate-400 text-sm mt-2">Plataforma Profesional de Difusión</p>
            </div>
            
            <div class="flex mb-6 border-b border-slate-800">
                <button id="tab-login" onclick="toggleAuth('login')" class="flex-1 pb-3 font-semibold border-b-2 border-emerald-500 text-emerald-400 transition-colors">Iniciar Sesión</button>
                <button id="tab-register" onclick="toggleAuth('register')" class="flex-1 pb-3 font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-300 transition-colors">Regístrate</button>
            </div>
            
            <form onsubmit="handleAuth(event)" class="space-y-5">
                <div>
                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Nombre de Usuario</label>
                    <input id="username" type="text" required class="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600" placeholder="ej: admin_wsender">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Contraseña</label>
                    <input id="password" type="password" required class="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600" placeholder="••••••••">
                </div>
                <button id="auth-btn" type="submit" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-900/40 text-white mt-4">
                    <span>Acceder al Panel</span>
                </button>
            </form>
        </div>
    </div>

    <!-- PANTALLA PRINCIPAL (DASHBOARD) -->
    <div id="dashboard" class="hidden flex-1 flex flex-col h-full overflow-hidden">
        
        <header class="glass-panel border-b border-slate-800 px-6 py-4 flex justify-between items-center z-50 shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <i data-lucide="send" class="h-5 w-5 text-slate-950"></i>
                </div>
                <div>
                    <h1 class="font-bold text-lg leading-tight">W <span class="text-gradient">Sender</span></h1>
                    <span class="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Workspace</span>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                    <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span id="user-display" class="text-slate-300 text-xs font-bold"></span>
                </div>
                <button onclick="logout()" class="p-2 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-lg text-slate-400 hover:text-rose-400 transition-colors" title="Cerrar Sesión">
                    <i data-lucide="log-out" class="w-5 h-5"></i>
                </button>
            </div>
        </header>

        <main class="flex-1 overflow-auto p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
            <!-- Fondo sutil para el dashboard -->
            <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

            <!-- Columna Izquierda: Configuración -->
            <div class="xl:col-span-4 space-y-6 flex flex-col">
                
                <!-- 1. Motor de Conexión -->
                <section class="glass-panel p-5 rounded-2xl">
                    <div class="flex justify-between items-center mb-5">
                        <h3 class="font-bold flex items-center gap-2 text-slate-200">
                            <i data-lucide="smartphone-nfc" class="text-emerald-400 h-5 w-5"></i> Motor de WhatsApp
                        </h3>
                        <span id="wa-badge" class="px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wider bg-slate-800 text-slate-400 uppercase">OFFLINE</span>
                    </div>

                    <!-- Estado: Desconectado -->
                    <div id="wa-disconnected" class="text-center py-2">
                        <p class="text-xs text-slate-400 mb-4">Inicia el motor de red para comenzar a transmitir.</p>
                        <div class="flex flex-col gap-3">
                            <button onclick="startWA()" id="btn-qr" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-bold transition-colors">Generar Código QR</button>
                            <div class="relative flex items-center">
                                <div class="flex-grow border-t border-slate-800"></div>
                                <span class="flex-shrink-0 mx-3 text-slate-600 text-xs font-medium">O vincula por número</span>
                                <div class="flex-grow border-t border-slate-800"></div>
                            </div>
                            <div class="flex gap-2">
                                <div class="relative flex-1">
                                    <i data-lucide="phone" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"></i>
                                    <input type="text" id="wa-phone" placeholder="987654321" class="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm outline-none transition-all placeholder:text-slate-600">
                                </div>
                                <button onclick="startWACode()" id="btn-code" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-900/30 whitespace-nowrap">Solicitar</button>
                            </div>
                        </div>
                    </div>

                    <!-- Estado: Cargando -->
                    <div id="wa-loading" class="hidden py-8 flex flex-col items-center justify-center text-center">
                        <div class="relative w-12 h-12 mb-3">
                            <div class="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                            <div class="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                            <i data-lucide="server" class="absolute inset-0 m-auto w-5 h-5 text-emerald-500 animate-pulse"></i>
                        </div>
                        <p class="text-sm font-semibold text-white">Inicializando Instancia</p>
                        <p class="text-xs text-slate-400 mt-1">Levantando el navegador virtual...</p>
                    </div>

                    <!-- Estado: Esperando Vinculación -->
                    <div id="wa-pairing" class="hidden flex flex-col items-center py-4">
                        <div id="qr-container" class="bg-white p-3 rounded-xl shadow-xl shadow-white/5 mb-3 hidden"></div>
                        <div id="code-container" class="hidden w-full text-center">
                            <p class="text-xs text-slate-400 mb-2">Ingresa este código en las notificaciones de tu WhatsApp móvil:</p>
                            <div id="pairing-code-text" class="text-3xl font-mono font-black tracking-[0.25em] bg-slate-900 py-4 px-2 rounded-xl border border-indigo-500/30 text-indigo-400 mb-3 shadow-inner shadow-black/50"></div>
                        </div>
                        <button onclick="stopWA()" class="text-xs font-semibold text-rose-400 hover:text-rose-300 py-1 px-3 rounded hover:bg-rose-400/10 transition-colors">Cancelar Operación</button>
                    </div>

                    <!-- Estado: Conectado -->
                    <div id="wa-connected" class="hidden text-center py-4">
                        <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i data-lucide="check" class="h-8 w-8 text-emerald-400"></i>
                        </div>
                        <h4 class="text-sm font-bold text-white mb-1">Dispositivo Vinculado</h4>
                        <p class="text-xs text-slate-400 mb-5">Listo para despachar campañas automatizadas.</p>
                        
                        <div class="flex flex-col sm:flex-row gap-3 justify-center">
                            <button onclick="triggerBroadcast()" id="btn-send" class="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 text-white transition-all">
                                <i data-lucide="zap" class="h-4 w-4 fill-white text-white"></i> Iniciar Campaña
                            </button>
                            <button onclick="stopWA()" class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 transition-colors flex items-center justify-center gap-2">
                                <i data-lucide="power" class="h-4 w-4 text-rose-400"></i> Desconectar
                            </button>
                        </div>
                    </div>
                </section>

                <!-- 2. Editor de Campaña (Texto y Media) -->
                <section class="glass-panel p-5 rounded-2xl flex-1 flex flex-col">
                    <h3 class="font-bold flex items-center gap-2 text-slate-200 mb-4">
                        <i data-lucide="message-square-dashed" class="text-amber-400 h-5 w-5"></i> Cuerpo del Mensaje
                    </h3>
                    
                    <div class="flex-1 flex flex-col">
                        <div class="relative flex-1 mb-3 group">
                            <textarea id="template" class="w-full h-full min-h-[120px] p-4 bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-sm text-slate-200 outline-none transition-all resize-none font-sans leading-relaxed" placeholder="Hola *{{nombre}}*, te escribimos de..."></textarea>
                            <div class="absolute bottom-3 right-3 flex gap-1 opacity-50 group-focus-within:opacity-100 transition-opacity">
                                <span class="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">{{nombre}}</span>
                                <span class="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">{{mesa}}</span>
                                <span class="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">{{cargo}}</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <!-- Imagen 1 -->
                            <div class="relative group h-20 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl bg-slate-900 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-colors" onclick="document.getElementById('file1').click()">
                                <img id="img1" class="hidden absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity">
                                <div class="z-10 flex flex-col items-center">
                                    <i data-lucide="image-plus" class="h-5 w-5 text-slate-400 mb-1"></i>
                                    <span class="text-[10px] text-slate-500 font-medium">Adjunto 1</span>
                                </div>
                                <input type="file" id="file1" hidden accept="image/*" onchange="uploadImg(1, this)">
                                <button onclick="delImg(1, event)" id="del1" class="hidden absolute top-1 right-1 p-1.5 bg-rose-500/90 hover:bg-rose-600 rounded-lg z-20 text-white shadow-sm backdrop-blur-sm" title="Eliminar"><i data-lucide="trash-2" class="h-3 w-3"></i></button>
                            </div>
                            <!-- Imagen 2 -->
                            <div class="relative group h-20 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl bg-slate-900 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-colors" onclick="document.getElementById('file2').click()">
                                <img id="img2" class="hidden absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity">
                                <div class="z-10 flex flex-col items-center">
                                    <i data-lucide="image-plus" class="h-5 w-5 text-slate-400 mb-1"></i>
                                    <span class="text-[10px] text-slate-500 font-medium">Adjunto 2</span>
                                </div>
                                <input type="file" id="file2" hidden accept="image/*" onchange="uploadImg(2, this)">
                                <button onclick="delImg(2, event)" id="del2" class="hidden absolute top-1 right-1 p-1.5 bg-rose-500/90 hover:bg-rose-600 rounded-lg z-20 text-white shadow-sm backdrop-blur-sm" title="Eliminar"><i data-lucide="trash-2" class="h-3 w-3"></i></button>
                            </div>
                        </div>

                        <button onclick="saveTemplate()" id="btn-save-tpl" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                            <i data-lucide="save" class="w-4 h-4 text-slate-400"></i> Guardar Plantilla
                        </button>
                    </div>
                </section>
            </div>

            <!-- Columna Derecha: Audiencia y Monitoreo -->
            <div class="xl:col-span-8 flex flex-col gap-6">
                
                <!-- Gestión de Contactos -->
                <section class="glass-panel border border-slate-800 rounded-2xl flex flex-col flex-1 max-h-[500px]">
                    <div class="p-5 border-b border-slate-800/80 bg-slate-900/50 rounded-t-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 class="font-bold flex items-center gap-2 text-slate-200 text-lg">
                                <i data-lucide="users" class="text-blue-400 h-5 w-5"></i> Directorio de Envío
                            </h3>
                            <p class="text-xs text-slate-500 mt-1">Contactos en la lista: <strong id="m-count" class="text-emerald-400">0</strong></p>
                        </div>
                        
                        <div class="flex items-center gap-2 w-full sm:w-auto">
                            <!-- Mini form rápido para agregar arriba en lugar de un bloque gigante -->
                            <form onsubmit="addMember(event)" class="flex-1 sm:flex-initial flex gap-2">
                                <input id="m-phone" required placeholder="Teléfono" class="w-28 p-2 text-xs bg-slate-950 border border-slate-700 rounded-lg outline-none focus:border-blue-500">
                                <input id="m-name" required placeholder="Nombre Completo" class="w-32 sm:w-40 p-2 text-xs bg-slate-950 border border-slate-700 rounded-lg outline-none focus:border-blue-500">
                                <!-- Campos extra ocultos temporalmente en UI simple, o usando selectores reducidos -->
                                <input id="m-mesa" placeholder="Dato Extra" class="w-24 p-2 text-xs bg-slate-950 border border-slate-700 rounded-lg outline-none focus:border-blue-500 hidden sm:block">
                                <select id="m-role" class="w-24 p-2 text-xs bg-slate-950 border border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-300 hidden sm:block">
                                    <option value="Presidente">Presidente</option>
                                    <option value="Secretario">Secretario</option>
                                    <option value="Miembro">Miembro</option>
                                    <option value="1er Suplente">1er Suplente</option>
                                    <option value="2do Suplente">2do Suplente</option>
                                    <option value="3er Suplente">3er Suplente</option>
                                    <option value="4to Suplente">4to Suplente</option>
                                    <option value="5to Suplente">5to Suplente</option>
                                    <option value="6to Suplente">6to Suplente</option>
                                </select>
                                <button id="btn-add-m" type="submit" class="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors" title="Añadir Contacto">
                                    <i data-lucide="plus" class="w-4 h-4"></i>
                                </button>
                            </form>
                            <button onclick="location.href='/api/export/csv'" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-2 rounded-lg transition-colors" title="Exportar CSV">
                                <i data-lucide="download" class="w-4 h-4 text-emerald-400"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-auto bg-slate-950/30">
                        <table class="w-full text-left text-sm whitespace-nowrap">
                            <thead class="bg-slate-900/80 sticky top-0 backdrop-blur-md z-10 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th class="px-5 py-3">Contacto</th>
                                    <th class="px-5 py-3">Grupo / Atributos</th>
                                    <th class="px-5 py-3 text-center">Tracking</th>
                                    <th class="px-5 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody id="m-body" class="divide-y divide-slate-800/40">
                                <!-- El contenido se llena dinámicamente -->
                            </tbody>
                        </table>
                        
                        <!-- Empty state -->
                        <div id="m-empty" class="hidden h-full flex flex-col items-center justify-center p-8 opacity-50">
                            <i data-lucide="user-plus" class="w-12 h-12 text-slate-600 mb-3"></i>
                            <p class="text-sm text-slate-400">No hay contactos en la lista.</p>
                            <p class="text-xs text-slate-500">Usa el formulario superior para añadir destinatarios.</p>
                        </div>
                    </div>
                </section>

                <!-- Consola de Logs Terminal -->
                <section class="glass-panel border border-slate-800 rounded-2xl flex flex-col h-[280px]">
                    <div class="px-4 py-3 border-b border-slate-800/80 bg-slate-900/50 rounded-t-2xl flex justify-between items-center">
                        <h3 class="font-bold flex items-center gap-2 text-slate-300 text-sm">
                            <i data-lucide="terminal-square" class="text-slate-400 h-4 w-4"></i> Terminal de Actividad
                        </h3>
                        <div class="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                            <button onclick="filterLogs('all')" id="tab-log-all" class="px-2.5 py-1 text-[10px] font-bold tracking-wide rounded bg-slate-800 text-white transition-colors">ALL</button>
                            <button onclick="filterLogs('success')" id="tab-log-success" class="px-2.5 py-1 text-[10px] font-bold tracking-wide rounded text-slate-500 hover:text-slate-300 transition-colors">OK</button>
                            <button onclick="filterLogs('error')" id="tab-log-error" class="px-2.5 py-1 text-[10px] font-bold tracking-wide rounded text-slate-500 hover:text-slate-300 transition-colors">ERR</button>
                        </div>
                    </div>
                    
                    <div id="logs" class="flex-1 p-4 overflow-auto font-mono text-[11px] leading-relaxed space-y-1.5 bg-slate-950/80 rounded-b-2xl">
                        <div class="text-slate-600">[SISTEMA] Listo y a la espera de operaciones.</div>
                    </div>
                </section>

            </div>
        </main>
    </div>

    <script>
        let currentAuth = 'login';
        let waPoller = null;
        let lastQR = null;
        let currentLogFilter = 'all';
        let allLogs = [];

        window.onload = () => { lucide.createIcons(); checkAuth(); };

        const showLoad = (show) => {
            const loader = document.getElementById('global-loader');
            if (show) {
                loader.classList.remove('hidden');
                setTimeout(() => loader.classList.remove('opacity-0'), 10);
            } else {
                loader.classList.add('opacity-0');
                setTimeout(() => loader.classList.add('hidden'), 300);
            }
        };

        const setBtnLoad = (id, loading, text) => {
            const b = document.getElementById(id);
            if(!b) return;
            b.disabled = loading;
            b.innerHTML = loading ? \`<div class="spinner w-4 h-4 mx-auto"></div>\` : text;
            b.classList.toggle('opacity-70', loading);
            b.classList.toggle('cursor-not-allowed', loading);
            b.classList.toggle('scale-[0.98]', loading);
        };

        function toggleAuth(tab) {
            currentAuth = tab;
            document.getElementById('tab-login').className = tab==='login' ? 'flex-1 pb-3 font-semibold border-b-2 border-emerald-500 text-emerald-400 transition-colors' : 'flex-1 pb-3 font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-300 transition-colors';
            document.getElementById('tab-register').className = tab==='register' ? 'flex-1 pb-3 font-semibold border-b-2 border-emerald-500 text-emerald-400 transition-colors' : 'flex-1 pb-3 font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-300 transition-colors';
            document.getElementById('auth-btn').innerHTML = tab==='login' ? 'Acceder al Panel' : 'Crear Cuenta Segura';
        }

        async function api(url, options = {}) {
            try {
                const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
                const data = await res.json();
                if(!res.ok) throw new Error(data.error || 'Error del servidor local.');
                return data;
            } catch (e) { alert(e.message); throw e; }
        }

        async function checkAuth() {
            try {
                const data = await (await fetch('/api/auth/me')).json();
                if(data.authenticated) initDash(data.username);
                else document.getElementById('auth-section').classList.remove('hidden');
            } catch(e) { document.getElementById('auth-section').classList.remove('hidden'); }
        }

        async function handleAuth(e) {
            e.preventDefault();
            setBtnLoad('auth-btn', true, '');
            try {
                const data = await api('/api/auth/' + currentAuth, { method: 'POST', body: JSON.stringify({
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value
                })});
                document.getElementById('auth-section').classList.add('hidden');
                initDash(data.username);
            } catch(e) {}
            setBtnLoad('auth-btn', false, currentAuth==='login' ? 'Acceder al Panel' : 'Crear Cuenta Segura');
        }

        async function logout() {
            showLoad(true);
            await api('/api/auth/logout', { method: 'POST' });
            location.reload();
        }

        function initDash(user) {
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('user-display').innerText = user;
            loadData();
            if(waPoller) clearInterval(waPoller);
            waPoller = setInterval(pollWA, 2000); // Polling más relajado
            pollWA();
        }

        async function loadData() {
            const tpl = await api('/api/template');
            document.getElementById('template').value = tpl.template;
            
            const imgs = await api('/api/template/images');
            updateImgUI(1, imgs.image1);
            updateImgUI(2, imgs.image2);

            loadMembers();
        }

        async function saveTemplate() {
            setBtnLoad('btn-save-tpl', true, '');
            try { await api('/api/template', { method: 'POST', body: JSON.stringify({ template: document.getElementById('template').value }) }); } catch(e){}
            setBtnLoad('btn-save-tpl', false, '<i data-lucide="save" class="w-4 h-4 text-slate-400"></i> Guardar Plantilla');
            lucide.createIcons();
        }

        async function uploadImg(idx, input) {
            const f = input.files[0]; if(!f) return;
            showLoad(true);
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    await api('/api/template/images', { method: 'POST', body: JSON.stringify({ index: idx, base64Data: e.target.result }) });
                    updateImgUI(idx, e.target.result);
                } catch(err){}
                showLoad(false);
            };
            reader.readAsDataURL(f);
        }

        async function delImg(idx, e) {
            e.stopPropagation();
            if(!confirm('¿Eliminar la imagen adjunta?')) return;
            showLoad(true);
            try {
                await api('/api/template/images/'+idx, { method: 'DELETE' });
                updateImgUI(idx, null);
                document.getElementById('file'+idx).value = '';
            } catch(err){}
            showLoad(false);
        }

        function updateImgUI(idx, b64) {
            const img = document.getElementById('img'+idx);
            const btn = document.getElementById('del'+idx);
            if(b64) { 
                img.src = b64; img.classList.remove('hidden'); btn.classList.remove('hidden');
                img.parentElement.classList.remove('border-dashed', 'border-slate-700');
                img.parentElement.classList.add('border-solid', 'border-emerald-500/50');
            } else { 
                img.src = ''; img.classList.add('hidden'); btn.classList.add('hidden');
                img.parentElement.classList.add('border-dashed', 'border-slate-700');
                img.parentElement.classList.remove('border-solid', 'border-emerald-500/50');
            }
        }

        async function loadMembers() {
            const ms = await api('/api/members');
            document.getElementById('m-count').innerText = ms.length;
            const b = document.getElementById('m-body');
            const empty = document.getElementById('m-empty');
            
            if(ms.length === 0) {
                b.innerHTML = '';
                empty.classList.remove('hidden');
                return;
            }
            empty.classList.add('hidden');

            b.innerHTML = ms.map(m => {
                // UI Badge for roles
                let roleColor = 'bg-slate-800 text-slate-300';
                if(m.rol.toLowerCase().includes('presidente') || m.rol.toLowerCase() === 'admin') roleColor = 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/30';
                else if(m.rol.toLowerCase().includes('secretario')) roleColor = 'bg-amber-900/40 text-amber-400 border border-amber-500/30';
                else if(m.rol.toLowerCase() === 'cliente') roleColor = 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/30';

                return \`
                <tr class="hover:bg-slate-800/30 transition-colors group">
                    <td class="px-5 py-3">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 font-bold text-xs border border-slate-700">
                                \${m.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div class="font-bold text-slate-200">\${m.nombre}</div>
                                <div class="text-[11px] text-slate-500 font-mono">\${m.telefono}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-5 py-3">
                        <div class="flex flex-col gap-1 items-start">
                            <span class="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide \${roleColor}">\${m.rol}</span>
                            \${m.mesa ? \`<span class="text-[10px] text-slate-500 flex items-center gap-1"><i data-lucide="tag" class="w-3 h-3"></i> N° de mesa: \${m.mesa}</span>\` : ''}
                        </div>
                    </td>
                    <td class="px-5 py-3 text-center">
                        <div class="flex flex-col items-center gap-1.5">
                            <label class="flex items-center gap-1.5 text-[10px] cursor-pointer text-slate-400 hover:text-slate-200 transition-colors">
                                <div class="relative flex items-center">
                                    <input type="checkbox" \${m.llamado?'checked':''} onchange="toggleM('\${m.id}','llamado',this.checked)" class="peer sr-only">
                                    <div class="w-6 h-3.5 bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:after:translate-x-2.5"></div>
                                </div>
                                Enviado
                            </label>
                            <label class="flex items-center gap-1.5 text-[10px] cursor-pointer text-slate-400 hover:text-slate-200 transition-colors">
                                <div class="relative flex items-center">
                                    <input type="checkbox" \${m.capacitado?'checked':''} onchange="toggleM('\${m.id}','capacitado',this.checked)" class="peer sr-only">
                                    <div class="w-6 h-3.5 bg-slate-700 rounded-full peer peer-checked:bg-blue-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:after:translate-x-2.5"></div>
                                </div>
                                Resp. OK
                            </label>
                        </div>
                    </td>
                    <td class="px-5 py-3 text-right">
                        <button onclick="delM('\${m.id}')" class="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" title="Eliminar Contacto">
                            <i data-lucide="trash-2" class="h-4 w-4"></i>
                        </button>
                    </td>
                </tr>
            \`}).join('');
            lucide.createIcons();
        }

        async function addMember(e) {
            e.preventDefault();
            setBtnLoad('btn-add-m', true, '');
            try {
                await api('/api/members', { method: 'POST', body: JSON.stringify({
                    mesa: document.getElementById('m-mesa').value || '-', 
                    nombre: document.getElementById('m-name').value,
                    telefono: document.getElementById('m-phone').value, 
                    rol: document.getElementById('m-role').value || 'Cliente'
                })});
                document.getElementById('m-phone').value = ''; 
                document.getElementById('m-name').value = '';
                document.getElementById('m-mesa').value = '';
                loadMembers();
            } catch(e){}
            setBtnLoad('btn-add-m', false, '<i data-lucide="plus" class="w-4 h-4"></i>');
            lucide.createIcons();
        }

        async function toggleM(id, f, v) { try{ await api(\`/api/members/\${id}/status\`, { method: 'PATCH', body: JSON.stringify({ field: f, value: v }) }); }catch(e){} }
        async function delM(id) { if(confirm('¿Confirmas eliminar este contacto de forma permanente?')) { await api('/api/members/'+id, { method: 'DELETE' }); loadMembers(); } }

        // WhatsApp Logic
        async function startWA() {
            setBtnLoad('btn-qr', true, '');
            try { await api('/api/wa/start', { method: 'POST', body: JSON.stringify({}) }); } catch(e){}
            setBtnLoad('btn-qr', false, 'Generar Código QR');
        }

        async function startWACode() {
            const p = document.getElementById('wa-phone').value;
            if(!p || p.length < 9) return alert('Ingresa un número de celular válido para vincular.');
            setBtnLoad('btn-code', true, '');
            try { await api('/api/wa/start', { method: 'POST', body: JSON.stringify({ phoneNumber: p }) }); } catch(e){}
            setBtnLoad('btn-code', false, 'Solicitar');
        }

        async function stopWA() {
            showLoad(true);
            try { await api('/api/wa/stop', { method: 'POST' }); } catch(e){}
            showLoad(false);
        }

        async function triggerBroadcast() {
            if(!confirm('¿Iniciar la campaña automatizada a todos los contactos de la lista?')) return;
            setBtnLoad('btn-send', true, '');
            try { await api('/api/wa/send', { method: 'POST' }); } catch(e){}
            setBtnLoad('btn-send', false, '<i data-lucide="zap" class="h-4 w-4 fill-white text-white"></i> Iniciar Campaña');
            lucide.createIcons();
        }

        async function pollWA() {
            try {
                const s = await (await fetch('/api/wa/status')).json();
                updateWAUI(s);
                allLogs = s.logs || [];
                renderLogs();
            } catch(e){}
        }

        function updateWAUI(s) {
            const b = document.getElementById('wa-badge');
            const d = document.getElementById('wa-disconnected'), l = document.getElementById('wa-loading'),
                  p = document.getElementById('wa-pairing'), c = document.getElementById('wa-connected');
            
            d.classList.add('hidden'); l.classList.add('hidden'); p.classList.add('hidden'); c.classList.add('hidden');
            b.innerText = s.status;

            if(s.status === 'DISCONNECTED') {
                d.classList.remove('hidden'); b.className = "px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wider bg-slate-800 text-slate-400 uppercase"; lastQR = null;
            } else if(s.status === 'INITIALIZING') {
                l.classList.remove('hidden'); b.className = "px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wider bg-amber-500/20 text-amber-400 uppercase";
            } else if(s.status === 'WAITING_FOR_QR' || s.status === 'WAITING_FOR_CODE') {
                p.classList.remove('hidden'); b.className = "px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wider bg-indigo-500/20 text-indigo-400 uppercase animate-pulse";
                
                if(s.pairingCode) {
                    document.getElementById('qr-container').classList.add('hidden');
                    document.getElementById('code-container').classList.remove('hidden');
                    document.getElementById('pairing-code-text').innerText = s.pairingCode;
                } else if(s.qr && s.qr !== lastQR) {
                    lastQR = s.qr;
                    document.getElementById('code-container').classList.add('hidden');
                    const qc = document.getElementById('qr-container');
                    qc.classList.remove('hidden'); qc.innerHTML = '';
                    new QRCode(qc, { text: s.qr, width: 220, height: 220, colorDark : "#0f172a", colorLight : "#ffffff", correctLevel: QRCode.CorrectLevel.M });
                }
            } else {
                c.classList.remove('hidden');
                b.className = s.status === 'SENDING' 
                    ? "px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wider bg-emerald-500 text-white uppercase shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" 
                    : "px-2 py-1 rounded-md text-[10px] font-extrabold tracking-wider bg-emerald-500/20 text-emerald-400 uppercase";
            }
        }

        function filterLogs(type) {
            currentLogFilter = type;
            ['all', 'success', 'error'].forEach(t => {
                const btn = document.getElementById('tab-log-'+t);
                if(t === type) {
                    btn.className = 'px-2.5 py-1 text-[10px] font-bold tracking-wide rounded bg-slate-700 text-white transition-colors shadow-sm';
                } else {
                    btn.className = 'px-2.5 py-1 text-[10px] font-bold tracking-wide rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors';
                }
            });
            renderLogs();
        }

        function renderLogs() {
            const lc = document.getElementById('logs');
            const isScrolledToBottom = lc.scrollHeight - lc.clientHeight <= lc.scrollTop + 2; // Tolerance
            
            const filtered = allLogs.filter(l => currentLogFilter === 'all' || l.type === currentLogFilter || (currentLogFilter==='error' && l.type==='warning'));
            
            if(filtered.length === 0) {
                lc.innerHTML = '<div class="text-slate-600 text-center mt-4 italic">No hay registros para este filtro.</div>';
                return;
            }

            lc.innerHTML = filtered.map(l => {
                let color = 'text-slate-400', icon = '<span class="text-slate-600 mr-1">ℹ</span>';
                if(l.type==='success') { color='text-emerald-400'; icon='<span class="text-emerald-500 mr-1">✓</span>'; }
                if(l.type==='error') { color='text-rose-400'; icon='<span class="text-rose-500 mr-1">✕</span>'; }
                if(l.type==='warning') { color='text-amber-400'; icon='<span class="text-amber-500 mr-1">⚠</span>'; }
                
                return \`
                <div class="flex items-start gap-2 \${color} p-1 hover:bg-slate-900/50 rounded transition-colors group">
                    <span class="opacity-40 text-[9px] mt-0.5 shrink-0 w-16 group-hover:opacity-80 transition-opacity">[\${l.timestamp}]</span>
                    <div class="flex-1 break-words">\${icon} \${l.message}</div>
                </div>\`;
            }).join('');

            // Autoscroll inteligente
            if(isScrolledToBottom) lc.scrollTop = lc.scrollHeight;
        }
    </script>
</body>
</html>
    `;
}