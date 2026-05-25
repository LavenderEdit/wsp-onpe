export function getFrontendHTML() {
    return `
<!DOCTYPE html>
<html lang="es" class="h-full bg-slate-950 text-slate-100">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Replicador de Coordinación Electoral ONPE</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Lucide Icons para diseño premium -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        /* Estilos personalizados para barra de scroll y consola */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #020617;
        }
        ::-webkit-scrollbar-thumb {
            background: #1e293b;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #334155;
        }
    </style>
</head>
<body class="h-full font-sans antialiased flex flex-col justify-between">

    <!-- PANTALLA DE AUTENTICACIÓN (LOGIN/REGISTRO) -->
    <div id="auth-section" class="hidden min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950">
        <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
            <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-600/10 text-blue-500 mb-4">
                <i data-lucide="vote" class="h-8 w-8"></i>
            </div>
            <h2 class="text-3xl font-extrabold text-white tracking-tight">Coordinación Electoral</h2>
            <p class="mt-2 text-sm text-slate-400">Replicador local de mensajería masiva asíncrona</p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-slate-900 py-8 px-4 shadow-xl border border-slate-800 rounded-2xl sm:px-10">
                <!-- TABS -->
                <div class="flex border-b border-slate-800 mb-6">
                    <button id="tab-login" onclick="toggleAuthTab('login')" class="flex-1 pb-3 text-center font-medium border-b-2 border-blue-500 text-blue-400">Iniciar Sesión</button>
                    <button id="tab-register" onclick="toggleAuthTab('register')" class="flex-1 pb-3 text-center font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200">Registrarse</button>
                </div>

                <form id="auth-form" onsubmit="handleAuthSubmit(event)" class="space-y-6">
                    <div>
                        <label for="username" class="block text-sm font-medium text-slate-300">Usuario de Coordinador</label>
                        <div class="mt-1 relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                <i data-lucide="user" class="h-5 w-5"></i>
                            </span>
                            <input id="username" name="username" type="text" required class="block w-full pl-10 pr-3 py-2 border border-slate-800 bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-100 placeholder-slate-600 sm:text-sm" placeholder="Ej: JuanPimentel">
                        </div>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-slate-300">Contraseña</label>
                        <div class="mt-1 relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                                <i data-lucide="lock" class="h-5 w-5"></i>
                            </span>
                            <input id="password" name="password" type="password" required class="block w-full pl-10 pr-3 py-2 border border-slate-800 bg-slate-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-100 placeholder-slate-600 sm:text-sm" placeholder="••••••••">
                        </div>
                    </div>

                    <div id="auth-error" class="hidden text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg flex items-center gap-2">
                        <i data-lucide="alert-triangle" class="h-4 w-4 shrink-0"></i>
                        <span id="auth-error-msg"></span>
                    </div>

                    <div>
                        <button type="submit" id="auth-submit-btn" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-colors">
                            Ingresar al Panel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- PANEL PRINCIPAL (DASHBOARD) -->
    <div id="dashboard-section" class="hidden min-h-screen flex flex-col bg-slate-950">
        <!-- HEADER -->
        <header class="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                            <i data-lucide="vote" class="h-6 w-6"></i>
                        </div>
                        <div>
                            <h1 class="text-lg font-bold text-white tracking-tight leading-none">Replicador Electoral</h1>
                            <span class="text-xs text-slate-400">ONPE Coordinación Local</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                            <i data-lucide="user-check" class="h-4 w-4 text-emerald-500"></i>
                            <span id="current-user-display" class="text-sm font-medium text-slate-300">Coordinador</span>
                        </div>
                        <button onclick="handleLogout()" class="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-800 text-sm font-medium rounded-lg text-slate-300 bg-slate-950 hover:bg-slate-900 hover:text-white transition-colors">
                            <i data-lucide="log-out" class="h-4 w-4"></i>
                            <span>Salir</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- MAIN CONTAINER -->
        <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- PANEL IZQUIERDO: GESTION DE MIEMBROS DE MESA (5 columnas) -->
            <section class="lg:col-span-5 flex flex-col gap-6">
                <!-- FORMULARIO AGREGAR -->
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <h2 class="text-base font-bold text-white flex items-center gap-2 mb-4">
                        <i data-lucide="user-plus" class="text-blue-500 h-5 w-5"></i>
                        <span>Añadir Miembro de Mesa (Jerarquía ONPE)</span>
                    </h2>
                    <form id="member-form" onsubmit="handleAddMember(event)" class="space-y-4">
                        <div class="grid grid-cols-3 gap-4">
                            <div class="col-span-1">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">N° Mesa</label>
                                <input id="m-mesa" type="text" required class="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 text-sm placeholder-slate-750" placeholder="081428">
                            </div>
                            <div class="col-span-2">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Nombre Completo</label>
                                <input id="m-name" type="text" required class="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 text-sm placeholder-slate-700" placeholder="Ej: Juan Pérez Díaz">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Celular (Perú)</label>
                                <input id="m-phone" type="text" required class="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 text-sm placeholder-slate-700" placeholder="Ej: 986936332">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400">Cargo de Mesa</label>
                                <select id="m-role" required class="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-300 text-sm">
                                    <optgroup label="Miembros Titulares">
                                        <option value="Presidente">Presidente</option>
                                        <option value="Secretario">Secretario</option>
                                        <option value="Tercer Miembro">Tercer Miembro</option>
                                    </optgroup>
                                    <optgroup label="Miembros Suplentes Oficiales">
                                        <option value="1er Suplente">1er Suplente</option>
                                        <option value="2do Suplente">2do Suplente</option>
                                        <option value="3er Suplente">3er Suplente</option>
                                        <option value="4to Suplente">4to Suplente</option>
                                        <option value="5to Suplente">5to Suplente</option>
                                        <option value="6to Suplente">6to Suplente</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                        <button type="submit" class="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-950/50">
                            <i data-lucide="plus" class="h-4 w-4"></i>
                            <span>Registrar en la Mesa</span>
                        </button>
                    </form>
                </div>

                <!-- EDITOR DE PLANTILLA DINÁMICA -->
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <h2 class="text-base font-bold text-white flex items-center gap-2 mb-2">
                        <i data-lucide="edit-3" class="text-orange-500 h-5 w-5"></i>
                        <span>Editar Mensaje de Presentación</span>
                    </h2>
                    <p class="text-xs text-slate-400 mb-3">Usa las etiquetas dinámicas: <code class="text-blue-400 font-bold">{{nombre}}</code>, <code class="text-indigo-400 font-bold">{{cargo}}</code>, <code class="text-emerald-400 font-bold">{{mesa}}</code>.</p>
                    <textarea id="template-editor" rows="6" class="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" placeholder="Escribe tu mensaje aquí..."></textarea>
                    <button onclick="saveTemplate()" class="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                        <i data-lucide="save" class="h-3.5 w-3.5"></i>
                        <span>Guardar Cambios de Plantilla</span>
                    </button>
                </div>
            </section>

            <!-- PANEL DERECHO: CONECTOR DE WHATSAPP Y TRANSMISIÓN (7 columnas) -->
            <section class="lg:col-span-7 flex flex-col gap-6">
                <!-- CONTROLADOR DE SESIÓN DE WHATSAPP -->
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 class="text-base font-bold text-white flex items-center gap-2">
                                <i data-lucide="qr-code" class="text-indigo-500 h-5 w-5"></i>
                                <span>Conexión con WhatsApp</span>
                            </h2>
                            <p class="text-xs text-slate-400 mt-1">Conecta tu teléfono mediante código QR de forma totalmente gratuita</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="h-2.5 w-2.5 rounded-full bg-slate-600 animate-pulse" id="status-indicator"></span>
                            <span id="status-text" class="text-xs font-bold uppercase tracking-wider text-slate-400">DESCONECTADO</span>
                        </div>
                    </div>

                    <!-- ACCIONES DE WHATSAPP -->
                    <div class="flex justify-end gap-3 mb-4 hidden" id="wa-actions-panel">
                        <!-- Botones de acción dinámicos -->
                    </div>

                    <!-- VISUALIZADOR DE QR O ESTADOS -->
                    <div class="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-6 bg-slate-950 min-h-[280px]">
                        
                        <!-- ESTADO: DESCONECTADO -->
                        <div id="wa-view-disconnected" class="flex flex-col items-center text-center max-w-sm">
                            <div class="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
                                <i data-lucide="message-square-off" class="h-6 w-6"></i>
                            </div>
                            <h3 class="text-sm font-bold text-white">Requiere inicializar el motor de red</h3>
                            <p class="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">El motor de emulación de WhatsApp Web se encuentra inactivo. Haz clic en el botón de abajo para iniciarlo.</p>
                            <button onclick="startWhatsApp()" class="inline-flex items-center gap-2 py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-950/50">
                                <i data-lucide="play" class="h-4 w-4"></i>
                                <span>Conectar WhatsApp</span>
                            </button>
                        </div>

                        <!-- ESTADO: INICIALIZANDO -->
                        <div id="wa-view-initializing" class="hidden flex flex-col items-center text-center">
                            <div class="h-12 w-12 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin mb-4"></div>
                            <h3 class="text-sm font-bold text-white">Abriendo Navegador Chromium...</h3>
                            <p class="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">Esto puede tardar de 10 a 20 segundos según el rendimiento de tu procesador local. Por favor, espera.</p>
                        </div>

                        <!-- ESTADO: ESPERANDO QR (CÓDIGO QR ACTIVO) -->
                        <div id="wa-view-qr" class="hidden flex flex-col items-center text-center">
                            <div id="qr-image-container" class="bg-white p-3 rounded-xl border border-slate-200 shadow-xl mb-4">
                                <!-- Aquí se incrusta el QR dinámico -->
                            </div>
                            <h3 class="text-sm font-bold text-white">Escanea el Código QR</h3>
                            <p class="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">Abre WhatsApp en tu celular -> Ajustes / Dispositivos Vinculados -> Vincular dispositivo.</p>
                            <button onclick="stopWhatsApp()" class="mt-4 inline-flex items-center gap-2 py-1.5 px-3 rounded-lg border border-red-900 bg-red-950/30 text-red-400 hover:bg-red-900 hover:text-white text-xs font-semibold transition-colors">
                                <i data-lucide="square" class="h-3.5 w-3.5"></i>
                                <span>Cancelar inicialización</span>
                            </button>
                        </div>

                        <!-- ESTADO: CONECTADO / ACTIVO -->
                        <div id="wa-view-connected" class="hidden flex flex-col items-center text-center max-w-sm">
                            <div class="h-16 w-16 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                                <i data-lucide="check-circle" class="h-10 w-10"></i>
                            </div>
                            <h3 class="text-sm font-bold text-white">¡Sesión Vinculada y Activa!</h3>
                            <p class="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">Listo para proceder con el envío masivo programado para tus coordinados electorales registrados.</p>
                            
                            <div class="flex flex-wrap gap-3 justify-center">
                                <button onclick="triggerBroadcast()" class="inline-flex items-center gap-2 py-2 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-950/50">
                                    <i data-lucide="send-to-back" class="h-4 w-4"></i>
                                    <span>Iniciar Envío Masivo</span>
                                </button>
                                <button onclick="stopWhatsApp()" class="inline-flex items-center gap-2 py-2 px-4 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold transition-colors">
                                    <i data-lucide="power" class="h-4 w-4"></i>
                                    <span>Desconectar</span>
                                </button>
                            </div>
                        </div>

                        <!-- ESTADO: ENVIANDO EN CURSO -->
                        <div id="wa-view-sending" class="hidden flex flex-col items-center text-center">
                            <div class="relative flex items-center justify-center mb-4">
                                <div class="absolute h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                                <div class="h-10 w-10 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-emerald-500">
                                    <i data-lucide="send" class="h-5 w-5"></i>
                                </div>
                            </div>
                            <h3 class="text-sm font-bold text-white">Enviando notificaciones masivas...</h3>
                            <p class="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">No cierres esta pestaña ni apagues el servidor local hasta que se complete la transmisión secuencial.</p>
                        </div>

                    </div>
                </div>

                <!-- TABLA DE COORDINADOS OPERATIVOS -->
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex-1 flex flex-col min-h-[350px]">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-base font-bold text-white flex items-center gap-2">
                            <i data-lucide="table" class="text-emerald-500 h-5 w-5"></i>
                            <span>Matriz de Miembros Electorales (<span id="members-count">0</span>)</span>
                        </h2>
                        <button onclick="exportToExcel()" class="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                            <i data-lucide="download" class="h-3.5 w-3.5"></i>
                            <span>Exportar a Excel</span>
                        </button>
                    </div>

                    <!-- TABLA CONTENEDOR CON SCROLL -->
                    <div class="flex-1 overflow-y-auto max-h-[300px] border border-slate-850 rounded-xl bg-slate-950/50">
                        <table class="min-w-full divide-y divide-slate-850 text-xs">
                            <thead class="bg-slate-950 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" class="px-3 py-2 text-left font-semibold uppercase text-slate-400">Mesa</th>
                                    <th scope="col" class="px-3 py-2 text-left font-semibold uppercase text-slate-400">Miembro / Teléfono</th>
                                    <th scope="col" class="px-3 py-2 text-left font-semibold uppercase text-slate-400">Cargo</th>
                                    <th scope="col" class="px-3 py-2 text-center font-semibold uppercase text-slate-400">Llamado</th>
                                    <th scope="col" class="px-3 py-2 text-center font-semibold uppercase text-slate-400">Capacitado</th>
                                    <th scope="col" class="relative px-3 py-2"></th>
                                </tr>
                            </thead>
                            <tbody id="members-table-body" class="divide-y divide-slate-900">
                                <!-- Miembros inyectados dinámicamente -->
                            </tbody>
                        </table>
                        <div id="no-members-view" class="hidden flex flex-col items-center justify-center py-16 px-4 text-center">
                            <i data-lucide="users-round" class="h-10 w-10 text-slate-700 mb-2"></i>
                            <p class="text-sm font-medium text-slate-400">No hay coordinados registrados</p>
                            <p class="text-xs text-slate-600 mt-1">Utiliza el formulario de la izquierda para añadir miembros a tu mesa</p>
                        </div>
                    </div>
                </div>

                <!-- CONSOLA INTERACTIVA DE PROGRESO DE ENVÍO -->
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col h-[200px]">
                    <div class="flex justify-between items-center mb-2">
                        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <i data-lucide="terminal" class="h-3.5 w-3.5"></i>
                            <span>Bitácora de Despacho en Vivo</span>
                        </h2>
                        <button onclick="clearConsole()" class="text-[10px] font-medium text-slate-500 hover:text-slate-300 transition-colors">Limpiar log</button>
                    </div>

                    <!-- ÁREA DE LOGS -->
                    <div id="console-output" class="flex-1 bg-slate-950 p-3 border border-slate-850 rounded-xl overflow-y-auto font-mono text-[10px] flex flex-col gap-1 text-slate-500">
                        [SISTEMA]: Esperando inicialización de tráfico asíncrono secuencial...
                    </div>
                </div>
            </section>
        </main>

        <!-- FOOTER -->
        <footer class="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
            <div class="max-w-7xl mx-auto px-4">
                © 2026 Coordinación ONPE - Replicador de Código Abierto Desplegado Localmente.
            </div>
        </footer>
    </div>

    <!-- SCRIPTS DE INTERACCIÓN CLIENTE (SINGLE PAGE APP) -->
    <script>
        let currentAuthTab = 'login';
        let waStatusPoller = null;

        // Inicialización al cargar la página
        window.addEventListener('load', () => {
            lucide.createIcons();
            checkAuth();
        });

        // -----------------------------------------------------------------
        // CONTROL DE ACCESO (AUTENTICACIÓN)
        // -----------------------------------------------------------------
        function toggleAuthTab(tab) {
            currentAuthTab = tab;
            const loginBtn = document.getElementById('tab-login');
            const registerBtn = document.getElementById('tab-register');
            const submitBtn = document.getElementById('auth-submit-btn');
            const errorDiv = document.getElementById('auth-error');

            errorDiv.classList.add('hidden');

            if (tab === 'login') {
                loginBtn.className = "flex-1 pb-3 text-center font-medium border-b-2 border-blue-500 text-blue-400";
                registerBtn.className = "flex-1 pb-3 text-center font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200";
                submitBtn.innerText = "Ingresar al Panel";
            } else {
                registerBtn.className = "flex-1 pb-3 text-center font-medium border-b-2 border-blue-500 text-blue-400";
                loginBtn.className = "flex-1 pb-3 text-center font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200";
                submitBtn.innerText = "Crear Cuenta de Coordinador";
            }
        }

        async function checkAuth() {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();

                if (data.authenticated) {
                    showDashboard(data.username);
                } else {
                    showAuth();
                }
            } catch (err) {
                showAuth();
            }
        }

        async function handleAuthSubmit(e) {
            e.preventDefault();
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const errorDiv = document.getElementById('auth-error');
            const errorMsg = document.getElementById('auth-error-msg');

            const payload = {
                username: usernameInput.value,
                password: passwordInput.value
            };

            const endpoint = currentAuthTab === 'login' ? '/api/auth/login' : '/api/auth/register';

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (res.ok && data.success) {
                    showDashboard(data.username);
                } else {
                    errorDiv.classList.remove('hidden');
                    errorMsg.innerText = data.error || "Ocurrió un error inesperado.";
                }
            } catch (err) {
                errorDiv.classList.remove('hidden');
                errorMsg.innerText = "No se puede establecer conexión con el servidor local.";
            }
        }

        async function handleLogout() {
            await fetch('/api/auth/logout', { method: 'POST' });
            if (waStatusPoller) clearInterval(waStatusPoller);
            showAuth();
        }

        function showAuth() {
            document.getElementById('auth-section').classList.remove('hidden');
            document.getElementById('dashboard-section').classList.add('hidden');
        }

        function showDashboard(username) {
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('dashboard-section').classList.remove('hidden');
            document.getElementById('current-user-display').innerText = username;
            
            // Cargar datos iniciales
            loadMembers();
            loadTemplate();
            
            // Iniciar Polling de estado de WhatsApp
            if (waStatusPoller) clearInterval(waStatusPoller);
            waStatusPoller = setInterval(pollWhatsAppStatus, 1500);
            pollWhatsAppStatus();
        }

        // -----------------------------------------------------------------
        // CONTROL DE PLANTILLAS DINÁMICAS
        // -----------------------------------------------------------------
        async function loadTemplate() {
            try {
                const res = await fetch('/api/template');
                const data = await res.json();
                document.getElementById('template-editor').value = data.template;
            } catch (err) {
                console.error("Error al cargar la plantilla:", err);
            }
        }

        async function saveTemplate() {
            const templateValue = document.getElementById('template-editor').value;
            try {
                const res = await fetch('/api/template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ template: templateValue })
                });
                if (res.ok) {
                    alert("Plantilla de presentación electoral guardada con éxito.");
                } else {
                    alert("No se pudo guardar la plantilla.");
                }
            } catch (err) {
                alert("Error de red al guardar la plantilla.");
            }
        }

        // -----------------------------------------------------------------
        // CONTROL DE MIEMBROS DE MESA
        // -----------------------------------------------------------------
        async function loadMembers() {
            const tableBody = document.getElementById('members-table-body');
            const noMembersView = document.getElementById('no-members-view');
            const countDisplay = document.getElementById('members-count');

            try {
                const res = await fetch('/api/members');
                const members = await res.json();

                countDisplay.innerText = members.length;
                tableBody.innerHTML = '';

                if (members.length === 0) {
                    noMembersView.classList.remove('hidden');
                    return;
                }

                noMembersView.classList.add('hidden');

                members.forEach(m => {
                    const tr = document.createElement('tr');
                    
                    // Colores de insignias personalizados para Titulares y Suplentes (ONPE Oficial)
                    let badge = "bg-slate-900 border-slate-800 text-slate-300";
                    if (m.rol === 'Presidente') badge = "bg-blue-950/40 border-blue-900/40 text-blue-400";
                    if (m.rol === 'Secretario') badge = "bg-indigo-950/40 border-indigo-900/40 text-indigo-400";
                    if (m.rol === 'Tercer Miembro') badge = "bg-emerald-950/40 border-emerald-900/40 text-emerald-400";
                    if (m.rol.includes('Suplente')) badge = "bg-amber-950/40 border-amber-900/40 text-amber-400";

                    tr.innerHTML = \`
                        <td class="px-3 py-2 font-bold text-slate-300">\${m.mesa}</td>
                        <td class="px-3 py-2">
                            <div class="font-bold text-white">\${m.nombre}</div>
                            <div class="text-slate-400 text-[11px]">\${m.telefono}</div>
                        </td>
                        <td class="px-3 py-2">
                            <span class="px-2 py-0.5 rounded-full border text-[10px] font-bold \${badge}">\${m.rol}</span>
                        </td>
                        <td class="px-3 py-2 text-center">
                            <input type="checkbox" \${m.llamado ? 'checked' : ''} onchange="toggleStatus('\${m.id}', 'llamado', this.checked)" class="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0">
                        </td>
                        <td class="px-3 py-2 text-center">
                            <input type="checkbox" \${m.capacitado ? 'checked' : ''} onchange="toggleStatus('\${m.id}', 'capacitado', this.checked)" class="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0">
                        </td>
                        <td class="px-3 py-2 text-right">
                            <button onclick="deleteMember('\${m.id}')" class="text-slate-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-900">
                                <i data-lucide="trash" class="h-3.5 w-3.5"></i>
                            </button>
                        </td>
                    \`;
                    tableBody.appendChild(tr);
                });
                lucide.createIcons();

            } catch (err) {
                console.error("Error al cargar coordinados:", err);
            }
        }

        async function handleAddMember(e) {
            e.preventDefault();
            const mesaInput = document.getElementById('m-mesa');
            const nameInput = document.getElementById('m-name');
            const phoneInput = document.getElementById('m-phone');
            const roleSelect = document.getElementById('m-role');

            const payload = {
                mesa: mesaInput.value,
                nombre: nameInput.value,
                telefono: phoneInput.value,
                rol: roleSelect.value
            };

            try {
                const res = await fetch('/api/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    nameInput.value = '';
                    phoneInput.value = '';
                    loadMembers();
                } else {
                    const data = await res.json();
                    alert("Error: " + data.error);
                }
            } catch (e) {
                alert("No se pudo agregar miembro. Error del servidor local.");
            }
        }

        async function toggleStatus(id, field, value) {
            try {
                await fetch(\`/api/members/\${id}/status\`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ field, value })
                });
            } catch (err) {
                console.error("No se pudo actualizar el estado del miembro:", err);
            }
        }

        async function deleteMember(id) {
            if (confirm("¿Estás seguro de que deseas eliminar este miembro de mesa de la lista?")) {
                try {
                    const res = await fetch(\`/api/members/\${id}\`, { method: 'DELETE' });
                    if (res.ok) {
                        loadMembers();
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }

        function exportToExcel() {
            window.location.href = '/api/export/csv';
        }

        // -----------------------------------------------------------------
        // CONTROL DEL MOTOR DE WHATSAPP
        // -----------------------------------------------------------------
        async function startWhatsApp() {
            try {
                const res = await fetch('/api/wa/start', { method: 'POST' });
                if (!res.ok) {
                    const data = await res.json();
                    alert(data.error || "Ocurrió un error.");
                }
            } catch (e) {
                console.error(e);
            }
        }

        async function stopWhatsApp() {
            try {
                const res = await fetch('/api/wa/stop', { method: 'POST' });
                if (!res.ok) {
                    const data = await res.json();
                    alert(data.error);
                }
            } catch (e) {
                console.error(e);
            }
        }

        async function triggerBroadcast() {
            try {
                const res = await fetch('/api/wa/send', { method: 'POST' });
                if (!res.ok) {
                    const data = await res.json();
                    alert(data.error);
                }
            } catch (e) {
                console.error(e);
            }
        }

        async function pollWhatsAppStatus() {
            try {
                const res = await fetch('/api/wa/status');
                if (!res.ok) return;

                const data = await res.json();

                // Actualizar badges de estado de WhatsApp
                updateStatusUI(data.status, data.qr);

                // Actualizar Consola
                updateConsole(data.logs);

            } catch (err) {
                console.error("Fallo de polling:", err);
            }
        }

        function updateStatusUI(status, qr) {
            const indicator = document.getElementById('status-indicator');
            const text = document.getElementById('status-text');

            const viewDisconnected = document.getElementById('wa-view-disconnected');
            const viewInitializing = document.getElementById('wa-view-initializing');
            const viewQr = document.getElementById('wa-view-qr');
            const viewConnected = document.getElementById('wa-view-connected');
            const viewSending = document.getElementById('wa-view-sending');

            // Ocultar todas por defecto
            viewDisconnected.classList.add('hidden');
            viewInitializing.classList.add('hidden');
            viewQr.classList.add('hidden');
            viewConnected.classList.add('hidden');
            viewSending.classList.add('hidden');

            text.innerText = status;

            switch (status) {
                case 'DISCONNECTED':
                    indicator.className = "h-2.5 w-2.5 rounded-full bg-slate-600 animate-none";
                    viewDisconnected.classList.remove('hidden');
                    break;
                case 'INITIALIZING':
                    indicator.className = "h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse";
                    viewInitializing.classList.remove('hidden');
                    break;
                case 'WAITING_FOR_QR':
                    indicator.className = "h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse";
                    viewQr.classList.remove('hidden');
                    if (qr) {
                        const qrContainer = document.getElementById('qr-image-container');
                        qrContainer.innerHTML = \`<img src="\${qr.startsWith('data:') ? qr : 'data:image/png;base64,' + qr}" alt="WhatsApp QR" class="h-48 w-48 block">\`;
                    }
                    break;
                case 'CONNECTED':
                    indicator.className = "h-2.5 w-2.5 rounded-full bg-emerald-500 animate-none";
                    viewConnected.classList.remove('hidden');
                    break;
                case 'SENDING':
                    indicator.className = "h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping";
                    viewSending.classList.remove('hidden');
                    break;
            }
        }

        function updateConsole(logs) {
            const consoleOutput = document.getElementById('console-output');
            if (!logs || logs.length === 0) {
                return;
            }

            consoleOutput.innerHTML = '';
            logs.forEach(log => {
                let colorClass = 'text-slate-400';
                if (log.type === 'success') colorClass = 'text-emerald-400 font-semibold';
                if (log.type === 'warning') colorClass = 'text-amber-400 font-semibold';
                if (log.type === 'error') colorClass = 'text-rose-400 font-semibold';

                const logElement = document.createElement('div');
                logElement.className = \`flex gap-2 items-start \${colorClass}\`;
                logElement.innerHTML = \`
                    <span class="text-slate-600 shrink-0">[\${log.timestamp}]</span>
                    <span>\${log.message}</span>
                \`;
                consoleOutput.appendChild(logElement);
            });

            // Auto-scroll al final
            consoleOutput.scrollTop = consoleOutput.scrollHeight;
        }

        function clearConsole() {
            document.getElementById('console-output').innerHTML = '<span class="text-slate-600">[SISTEMA]: Logs limpios. Esperando nuevo proceso...</span>';
        }
    </script>
</body>
</html>
  `;
}