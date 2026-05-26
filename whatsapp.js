import pkg from "whatsapp-web.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import fs from "fs";
import { db } from "./db.js";

const { Client, LocalAuth, MessageMedia } = pkg;
puppeteer.use(StealthPlugin());

class WhatsAppService {
  constructor() {
    this.waClient = null;
    this.waStatus = "DISCONNECTED";
    this.waQrCode = null;
    this.activeWaUserId = null;
    this.broadcastLogs = [];
  }

  _createClient() {
    const isDocker = process.env.IS_DOCKER === 'true';
    const chromePath = isDocker
      ? "/usr/bin/chromium"
      : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    return new Client({
      authStrategy: new LocalAuth({ clientId: "client-one" }),
      puppeteer: {
        headless: true,
        executablePath: chromePath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        ],
      },
    });
  }

  async startSession(userId) {
    if (
      this.waClient &&
      this.activeWaUserId &&
      this.activeWaUserId !== userId
    ) {
      return { success: false, message: "Otra sesión está activa." };
    }

    if (!this.waClient) {
      this.waClient = this._createClient();

      this.waClient.on("qr", (qr) => {
        this.waQrCode = qr;
        this.waStatus = "WAITING_FOR_QR";
      });

      this.waClient.on("ready", () => {
        this.waStatus = "CONNECTED";
        this.waQrCode = null;
      });

      this.waClient.on("disconnected", () => {
        this.waStatus = "DISCONNECTED";
        this.waClient = null;
        this.activeWaUserId = null;
      });

      this.waClient.on("error", (err) => {
        console.error("[SISTEMA] Capturado fallo asíncrono del cliente WA:", err);
        this.waStatus = "DISCONNECTED";
        this.waClient = null;
        this.activeWaUserId = null;
      });

      this.waClient.on("auth_failure", (msg) => {
        console.error("[SISTEMA] Fallo de autenticación en WA:", msg);
        this.waStatus = "DISCONNECTED";
        this.waClient = null;
        this.activeWaUserId = null;
      });
    }

    this.activeWaUserId = userId;
    try {
      await this.waClient.initialize();
      return { success: true };
    } catch (e) {
      console.error("[SISTEMA] Excepción al inicializar cliente WA:", e);
      this.reset();
      return { success: false, message: "Error al inicializar cliente de WhatsApp." };
    }
  }

  async stopSession(userId) {
    if (this.waClient && this.activeWaUserId === userId) {
      try {
        await this.waClient.destroy();
      } catch (e) {
        console.error(e);
      }
      this.waClient = null;
      this.waStatus = "DISCONNECTED";
      this.activeWaUserId = null;
    }
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  _getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString("es-PE", { hour12: false });
  }

  async sendBulk(userId) {
    if (!this.waClient || this.waStatus !== "CONNECTED") {
      throw new Error(
        "El motor de emulación de WhatsApp no está listo o está desconectado.",
      );
    }

    const members = db.getMembers(userId);
    const template = db.getTemplate(userId);
    const imagesInfo = db.getUserImagesInfo(userId);

    if (!members || members.length === 0) {
      throw new Error(
        "No hay miembros de mesa registrados para iniciar la transmisión.",
      );
    }

    this.waStatus = "SENDING";
    this.broadcastLogs = [];

    this.broadcastLogs.push({
      timestamp: this._getTimestamp(),
      type: "info",
      message: `Iniciando transmisión masiva para ${members.length} destinatarios...`,
    });

    (async () => {
      try {
        for (const member of members) {
          let formattedPhone = member.telefono.trim().replace(/\D/g, "");
          if (!formattedPhone.startsWith("51")) {
            formattedPhone = `51${formattedPhone}`;
          }
          const chatId = `${formattedPhone}@c.us`;

          let customizedMessage = template
            .replace(/{{nombre}}/g, member.nombre)
            .replace(/{{mesa}}/g, member.mesa)
            .replace(/{{cargo}}/g, member.rol);

          this.broadcastLogs.push({
            timestamp: this._getTimestamp(),
            type: "info",
            message: `Procesando envío hacia: ${member.nombre} (${member.rol})...`,
          });

          if (imagesInfo.image1) {
            try {
              const base64Clean = imagesInfo.image1.replace(
                /^data:image\/\w+;base64,/,
                "",
              );
              const media1 = new MessageMedia(
                "image/png",
                base64Clean,
                "soporte_principal.png",
              );
              await this.waClient.sendMessage(chatId, media1);
              await this._sleep(2000);
            } catch (errImg1) {
              this.broadcastLogs.push({
                timestamp: this._getTimestamp(),
                type: "warning",
                message: `No se pudo adjuntar la Imagen Principal para ${member.nombre}: ${errImg1.message}`,
              });
            }
          }

          if (imagesInfo.image2) {
            try {
              const base64Clean = imagesInfo.image2.replace(
                /^data:image\/\w+;base64,/,
                "",
              );
              const media2 = new MessageMedia(
                "image/png",
                base64Clean,
                "anexo_soporte.png",
              );
              await this.waClient.sendMessage(chatId, media2);
              await this._sleep(2000);
            } catch (errImg2) {
              this.broadcastLogs.push({
                timestamp: this._getTimestamp(),
                type: "warning",
                message: `No se pudo adjuntar la Imagen de Anexo para ${member.nombre}: ${errImg2.message}`,
              });
            }
          }

          try {
            await this.waClient.sendMessage(chatId, customizedMessage);

            db.updateMemberStatus(userId, member.id, "llamado", true);

            this.broadcastLogs.push({
              timestamp: this._getTimestamp(),
              type: "success",
              message: `✓ Mensaje entregado con éxito a ${member.nombre}.`,
            });
          } catch (errText) {
            this.broadcastLogs.push({
              timestamp: this._getTimestamp(),
              type: "error",
              message: `✕ Error crítico al enviar texto a ${member.nombre}: ${errText.message}`,
            });
          }

          const randomDelay =
            Math.floor(Math.random() * (12000 - 6000 + 1)) + 6000;
          await this._sleep(randomDelay);
        }

        this.broadcastLogs.push({
          timestamp: this._getTimestamp(),
          type: "success",
          message: "=========================================",
        });
        this.broadcastLogs.push({
          timestamp: this._getTimestamp(),
          type: "success",
          message:
            "🎉 PROCESO TERMINADO: Despacho secuencial completado de forma segura.",
        });
      } catch (globalError) {
        this.broadcastLogs.push({
          timestamp: this._getTimestamp(),
          type: "error",
          message: `Fallo general en la cola de envíos: ${globalError.message}`,
        });
      } finally {
        this.waStatus = "CONNECTED";
      }
    })();
  }

  reset() {
    this.waClient = null;
    this.waStatus = "DISCONNECTED";
    this.waQrCode = null;
    this.activeWaUserId = null;
  }
}

export const whatsappManager = new WhatsAppService();