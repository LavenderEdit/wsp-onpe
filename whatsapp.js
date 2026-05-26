import pkg from "whatsapp-web.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import fs from "fs";
import { db } from "./db.js"; // Importamos la DB portable para leer miembros y plantillas

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
    return new Client({
      authStrategy: new LocalAuth({ clientId: "client-one" }),
      puppeteer: {
        headless: false,
        executablePath:
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
        this.waQrCode = qr; // Almacena la cadena raw string del QR
        this.waStatus = "WAITING_FOR_QR"; // Cambiado de 'QR_READY' a 'WAITING_FOR_QR'
      });

      this.waClient.on("ready", () => {
        this.waStatus = "CONNECTED"; // Cambiado de 'READY' a 'CONNECTED'
        this.waQrCode = null;
      });

      this.waClient.on("disconnected", () => {
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
      console.error(e);
      return { success: false, message: "Error al inicializar cliente." };
    }
  }

  async stopSession(userId) {
    if (this.waClient && this.activeWaUserId === userId) {
      await this.waClient.destroy();
      this.waClient = null;
      this.waStatus = "DISCONNECTED";
      this.activeWaUserId = null;
    }
  }

  // Método utilitario interno para generar pausas asíncronas de tiempo aleatorio
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Genera la marca de tiempo exacta para la consola en vivo
  _getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString("es-PE", { hour12: false });
  }

  async sendBulk(userId) {
    // Validación de seguridad inicial del motor
    if (!this.waClient || this.waStatus !== "CONNECTED") {
      throw new Error(
        "El motor de emulación de WhatsApp no está listo o está desconectado.",
      );
    }

    // Obtener la información del coordinador desde db.json
    const members = db.getMembers(userId);
    const template = db.getTemplate(userId);
    const imagesInfo = db.getUserImagesInfo(userId);

    if (!members || members.length === 0) {
      throw new Error(
        "No hay miembros de mesa registrados para iniciar la transmisión.",
      );
    }

    // Cambiar estado a SENDING para que la vista muestre el spinner de transmisión
    this.waStatus = "SENDING";
    this.broadcastLogs = []; // Reiniciamos la bitácora para el nuevo proceso

    this.broadcastLogs.push({
      timestamp: this._getTimestamp(),
      type: "info",
      message: `Iniciando transmisión masiva para ${members.length} destinatarios...`,
    });

    // Ejecutar el proceso en segundo plano de manera asíncrona (No bloqueante)
    (async () => {
      try {
        for (const member of members) {
          // Formatear número de teléfono al estándar internacional de WhatsApp Web para Perú (51)
          let formattedPhone = member.telefono.trim().replace(/\D/g, "");
          if (!formattedPhone.startsWith("51")) {
            formattedPhone = `51${formattedPhone}`;
          }
          const chatId = `${formattedPhone}@c.us`;

          // Renderizar las etiquetas dinámicas de la plantilla guardada
          let customizedMessage = template
            .replace(/{{nombre}}/g, member.nombre)
            .replace(/{{mesa}}/g, member.mesa)
            .replace(/{{cargo}}/g, member.rol);

          this.broadcastLogs.push({
            timestamp: this._getTimestamp(),
            type: "info",
            message: `Procesando envío hacia: ${member.nombre} (${member.rol})...`,
          });

          // 1. Despachar Imagen 1 (Si existe)
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
              await this._sleep(2000); // Pequeña pausa táctica entre multimedia y texto
            } catch (errImg1) {
              this.broadcastLogs.push({
                timestamp: this._getTimestamp(),
                type: "warning",
                message: `No se pudo adjuntar la Imagen Principal para ${member.nombre}: ${errImg1.message}`,
              });
            }
          }

          // 2. Despachar Imagen 2 (Si existe)
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

          // 3. Despachar el Mensaje de Texto finalizado
          try {
            await this.waClient.sendMessage(chatId, customizedMessage);

            // Actualizar estado administrativo en la Base de Datos automáticamente
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

          // Delay anti-ban dinámico aleatorio (Entre 6 y 12 segundos) antes de pasar al siguiente miembro
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
        // Al finalizar la cola de tareas, restablecemos el estado a CONNECTED para reactivar los botones de la SPA
        this.waStatus = "CONNECTED";
      }
    })();
  }
}

export const whatsappManager = new WhatsAppService();
