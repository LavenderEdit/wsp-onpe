import pkg from 'whatsapp-web.js';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const { Client, LocalAuth } = pkg;
puppeteer.use(StealthPlugin());

class WhatsAppService {
    constructor() {
        this.waClient = null;
        this.waStatus = 'DISCONNECTED';
        this.waQrCode = null;
        this.activeWaUserId = null;
        this.broadcastLogs = [];
    }

    _createClient() {
        return new Client({
            authStrategy: new LocalAuth({ clientId: "client-one" }),
            puppeteer: {
                headless: false,
                executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
    }

    async startSession(userId) {
        if (this.waClient && this.activeWaUserId && this.activeWaUserId !== userId) {
            return { success: false, message: "Otra sesión está activa." };
        }

        if (!this.waClient) {
            this.waClient = this._createClient();

            this.waClient.on('qr', (qr) => {
                this.waQrCode = qr;
                this.waStatus = 'QR_READY';
            });

            this.waClient.on('ready', () => {
                this.waStatus = 'READY';
                this.waQrCode = null;
            });

            this.waClient.on('disconnected', () => {
                this.waStatus = 'DISCONNECTED';
                this.waClient = null;
                this.activeWaUserId = null;
            });
        }

        this.activeWaUserId = userId;
        try {
            await this.waClient.initialize();
            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false, message: "Error al inicializar cliente." };
        }
    }

    async stopSession(userId) {
        if (this.waClient && this.activeWaUserId === userId) {
            await this.waClient.destroy();
            this.waClient = null;
            this.waStatus = 'DISCONNECTED';
            this.activeWaUserId = null;
        }
    }

    async sendBulk(userId) {
    }
}

export const whatsappManager = new WhatsAppService();