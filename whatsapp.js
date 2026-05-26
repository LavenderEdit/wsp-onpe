import { create, ev } from '@open-wa/wa-automate';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { db } from './db.js';
import fs from 'fs';

puppeteer.use(StealthPlugin());

class WhatsAppManager {
    constructor() {
        this.waClient = null;
        this.waStatus = 'DISCONNECTED';
        this.activeWaUserId = null;
    }

    async startSession(userId) {
        if (this.waStatus !== 'DISCONNECTED') return { success: false, message: "Sesión ya inicializada." };

        this.activeWaUserId = userId;
        this.waStatus = 'INITIALIZING';

        const userDataDir = `C:\\Users\\USUARIO\\Documents\\DocLaptop\\Datos\\CCPP\\WebApps\\APP\\wsp-onpe\\_IGNORE_Session_${userId}`;

        try {
            const client = await create({
                sessionId: `Session_${userId}`,
                useChrome: true,
                executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
                headless: false,
                userDataDir: userDataDir,
                qrTimeout: 60,
                authTimeout: 60,
                blockCrashLogs: true,
                args: [
                    '--disable-infobars',
                    '--window-size=1280,800',
                    '--disable-blink-features=AutomationControlled'
                ]
            });

            this.waClient = client;
            this.waStatus = 'CONNECTED';
            return { success: true };

        } catch (err) {
            console.error("ERROR CRÍTICO:", err);
            this.reset();
            return { success: false, message: err.message };
        }
    }

    reset() {
        this.waClient = null;
        this.waStatus = 'DISCONNECTED';
        this.waQrCode = null;
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