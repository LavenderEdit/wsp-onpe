import { create } from '@open-wa/wa-automate';
import { db } from './db.js';

class WhatsAppManager {
    constructor() {
        this.waClient = null;
        this.waStatus = 'DISCONNECTED'; // DISCONNECTED, INITIALIZING, WAITING_FOR_QR, CONNECTED, SENDING
        this.waQrCode = null;
        this.activeWaUserId = null;
        this.broadcastLogs = [];
    }

    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    logBroadcast(message, type = 'info') {
        const logEntry = {
            timestamp: new Date().toLocaleTimeString(),
            message,
            type // info, success, warning, error
        };
        this.broadcastLogs.push(logEntry);
        console.log(`[ENVÍO MASIVO] [${type.toUpperCase()}] ${message}`);
    }

    normalizarNumeroPeru(telefonoCrudo) {
        let limpio = telefonoCrudo.replace(/\D/g, '');
        if (limpio.startsWith('51')) {
            if (limpio.length === 11) return `${limpio}@c.us`;
        }
        if (limpio.length === 9 && limpio.startsWith('9')) {
            return `51${limpio}@c.us`;
        }
        throw new Error(`El número "${telefonoCrudo}" no cumple con el plan de numeración de Perú (ej: 987654321).`);
    }

    async startSession(userId) {
        if (this.waStatus !== 'DISCONNECTED') {
            return { success: false, message: "La sesión ya se encuentra inicializada o en proceso." };
        }

        this.activeWaUserId = userId;
        this.waStatus = 'INITIALIZING';
        this.waQrCode = null;
        this.broadcastLogs = [];

        this.logBroadcast("Iniciando motor Google Chrome (Modo Visible)...");

        create({
            sessionId: `Session_${userId}`,
            multiDevice: true,
            authTimeout: 60,
            qrTimeout: 0,
            blockCrashLogs: true,
            disableSpins: true,
            headless: false,
            useChrome: true,
            cacheEnabled: false,
            hostNotificationLang: 'es-ES',
            qrLogSkip: true,
            qrCallback: (base64QrImg) => {
                this.waStatus = 'WAITING_FOR_QR';
                this.waQrCode = base64QrImg;
                this.logBroadcast("Código QR generado. Esperando escaneo desde tu celular móvil...");
            }
        }).then((client) => {
            this.waClient = client;
            this.waStatus = 'CONNECTED';
            this.waQrCode = null;
            this.logBroadcast("¡Autenticación de WhatsApp realizada con éxito!", "success");

            client.onStateChanged((state) => {
                this.logBroadcast(`Estado de conexión cambiado a: ${state}`, "warning");
                if (state === 'UNPAIRED' || state === 'CONFLICT') {
                    this.reset();
                }
            });
        }).catch((err) => {
            console.error("[WA ERROR] Error al instanciar:", err);
            this.logBroadcast(`Fallo crítico al iniciar el cliente: ${err.message}`, "error");
            this.reset();
        });

        return { success: true };
    }

    async stopSession(userId) {
        if (this.activeWaUserId !== userId) {
            throw new Error("No tienes permisos para detener esta sesión de WhatsApp activa.");
        }
        this.logBroadcast("Deteniendo sesión de WhatsApp de forma controlada...");
        if (this.waClient) {
            try {
                await this.waClient.close();
            } catch (e) {
                console.error(e);
            }
        }
        this.reset();
        return { success: true };
    }

    reset() {
        this.waClient = null;
        this.waStatus = 'DISCONNECTED';
        this.waQrCode = null;
        this.activeWaUserId = null;
    }

    async sendBulk(userId) {
        if (!this.waClient || this.waStatus !== 'CONNECTED') {
            throw new Error("El cliente de WhatsApp no está conectado o se encuentra ocupado.");
        }
        if (this.activeWaUserId !== userId) {
            throw new Error("Esta sesión de WhatsApp pertenece a otro coordinador activo.");
        }

        const miembros = db.getMembers(userId);
        if (miembros.length === 0) {
            throw new Error("No tienes miembros de mesa registrados para enviar.");
        }

        const template = db.getTemplate(userId);
        const { image1, image2 } = db.getUserImagesInfo(userId);

        this.waStatus = 'SENDING';
        this.broadcastLogs = [];
        this.logBroadcast(`Iniciando envío asíncrono secuencial a ${miembros.length} destinatarios...`, "info");

        const hasImg1 = !!image1;
        const hasImg2 = !!image2;

        if (hasImg1 || hasImg2) {
            this.logBroadcast("Se detectaron recursos de imagen activos. Los mensajes se procesarán en formato multimedia.", "info");
        } else {
            this.logBroadcast("No hay imágenes activas. Se utilizará envío de texto plano convencional.", "info");
        }

        (async () => {
            for (const miembro of miembros) {
                try {
                    const jid = this.normalizarNumeroPeru(miembro.telefono);

                    const mensajePersonalizado = template
                        .replace(/{{nombre}}/g, miembro.nombre)
                        .replace(/{{cargo}}/g, miembro.rol)
                        .replace(/{{mesa}}/g, miembro.mesa);

                    this.logBroadcast(`Enviando a ${miembro.nombre} (Mesa ${miembro.mesa})...`, "info");

                    if (hasImg1 && hasImg2) {
                        await this.waClient.sendImage(jid, image1, 'onpe_info1.png', mensajePersonalizado);
                        await this.delay(1500);
                        await this.waClient.sendImage(jid, image2, 'onpe_info2.png', '');
                        this.logBroadcast(`[✓ ENTREGADO] Mensaje multimedia doble enviado a ${miembro.nombre}.`, "success");

                    } else if (hasImg1) {
                        await this.waClient.sendImage(jid, image1, 'onpe_info.png', mensajePersonalizado);
                        this.logBroadcast(`[✓ ENTREGADO] Mensaje con imagen enviado a ${miembro.nombre}.`, "success");

                    } else if (hasImg2) {
                        await this.waClient.sendImage(jid, image2, 'onpe_info.png', mensajePersonalizado);
                        this.logBroadcast(`[✓ ENTREGADO] Mensaje con imagen enviado a ${miembro.nombre}.`, "success");

                    } else {
                        const resEnvio = await this.waClient.sendText(jid, mensajePersonalizado);
                        if (resEnvio) {
                            this.logBroadcast(`[✓ ENTREGADO] Mensaje de texto enviado a ${miembro.nombre}.`, "success");
                        }
                    }

                } catch (err) {
                    this.logBroadcast(`[X ERROR] No se pudo enviar a ${miembro.nombre}: ${err.message}`, "error");
                }

                const esUltimo = miembros.indexOf(miembro) === miembros.length - 1;
                if (!esUltimo) {
                    const latencia = Math.floor(Math.random() * (22000 - 8000 + 1)) + 8000;
                    this.logBroadcast(`Aplicando pausa biométrica de seguridad de ${Math.round(latencia / 1000)} segundos antes de la siguiente transmisión...`, "info");
                    await this.delay(latencia);
                }
            }

            this.logBroadcast("======================================================", "info");
            this.logBroadcast("¡Proceso de envío de notificaciones completado con éxito!", "success");
            this.logBroadcast("======================================================", "info");
            this.waStatus = 'CONNECTED';
        })();

        return { success: true };
    }
}

export const whatsappManager = new WhatsAppManager();