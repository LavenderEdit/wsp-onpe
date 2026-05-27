import pkg from "whatsapp-web.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import fs from "fs";
import { db } from "./db.js";

const { Client, LocalAuth, MessageMedia } = pkg;
puppeteer.use(StealthPlugin());

class WhatsAppMultiManager {
  constructor() {
    this.sessions = new Map();
  }

  getSession(userId) {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        client: null,
        status: "DISCONNECTED",
        qr: null,
        pairingCode: null,
        logs: []
      });
    }
    return this.sessions.get(userId);
  }

  addLog(userId, type, message) {
    const session = this.getSession(userId);
    const time = new Date().toLocaleTimeString("es-PE", { hour12: false });
    session.logs.push({ timestamp: time, type, message });
    if (session.logs.length > 200) session.logs.shift();
  }

  _clearLocks(userId) {
    try {
      const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `session-${userId}`);
      const locks = [
        path.join(sessionPath, 'SingletonLock'),
        path.join(sessionPath, 'SingletonCookie'),
        path.join(sessionPath, 'Default', 'SingletonLock')
      ];
      locks.forEach(lock => fs.existsSync(lock) && fs.unlinkSync(lock));
    } catch (error) { }
  }

  async startSession(userId, phoneNumber = null) {
    const session = this.getSession(userId);
    if (session.client) return { success: false, message: "La sesión ya está iniciada." };

    this._clearLocks(userId);

    const isDocker = process.env.IS_DOCKER === 'true';
    const chromePath = isDocker ? "/usr/bin/chromium" : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

    session.client = new Client({
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: {
        headless: true,
        executablePath: chromePath,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
      },
    });

    session.status = "INITIALIZING";
    session.logs = [];
    this.addLog(userId, "info", "Iniciando motor de WhatsApp...");

    session.client.on("qr", async (qr) => {
      session.qr = qr;
      session.status = "WAITING_FOR_QR";

      if (phoneNumber) {
        try {
          session.status = "WAITING_FOR_CODE";
          const code = await session.client.requestPairingCode(phoneNumber);
          session.pairingCode = code;
          this.addLog(userId, "info", `Código de vinculación generado: ${code}`);
        } catch (e) {
          this.addLog(userId, "error", "Error al generar código: " + e.message);
        }
      }
    });

    session.client.on("ready", () => {
      session.status = "CONNECTED";
      session.qr = null;
      session.pairingCode = null;
      this.addLog(userId, "success", "¡WhatsApp conectado y listo!");
    });

    session.client.on("disconnected", (reason) => {
      this.addLog(userId, "warning", "WhatsApp desconectado: " + reason);
      this.stopSession(userId);
    });

    try {
      await session.client.initialize();
      return { success: true };
    } catch (e) {
      this.stopSession(userId);
      return { success: false, message: "Fallo al inicializar. Reintenta." };
    }
  }

  async stopSession(userId) {
    const session = this.getSession(userId);
    if (session.client) {
      try {
        await session.client.logout();
      } catch (e) { }
      try {
        await session.client.destroy();
      } catch (e) { }
    }
    this.sessions.delete(userId);
    this._clearLocks(userId);
  }

  async sendBulk(userId) {
    const session = this.getSession(userId);
    if (!session.client || session.status !== "CONNECTED") {
      throw new Error("Debes conectar tu WhatsApp primero.");
    }

    const members = db.getMembers(userId);
    const template = db.getTemplate(userId);
    const imagesInfo = db.getUserImagesInfo(userId);

    if (members.length === 0) throw new Error("No hay miembros para enviar.");

    session.status = "SENDING";
    this.addLog(userId, "info", `Iniciando envío a ${members.length} contactos...`);

    (async () => {
      let exitos = 0, errores = 0;
      for (const member of members) {
        let phone = member.telefono.trim().replace(/\D/g, "");
        if (phone.length === 9) phone = `51${phone}`;
        const chatId = `${phone}@c.us`;

        let msg = template.replace(/{{nombre}}/gi, member.nombre).replace(/{{mesa}}/gi, member.mesa).replace(/{{cargo}}/gi, member.rol);

        this.addLog(userId, "info", `Enviando a ${member.nombre}...`);

        try {
          if (imagesInfo.image1) {
            const m1 = new MessageMedia("image/png", imagesInfo.image1.replace(/^data:image\/\w+;base64,/, ""), "img1.png");
            await session.client.sendMessage(chatId, m1);
            await new Promise(r => setTimeout(r, 1500));
          }
          if (imagesInfo.image2) {
            const m2 = new MessageMedia("image/png", imagesInfo.image2.replace(/^data:image\/\w+;base64,/, ""), "img2.png");
            await session.client.sendMessage(chatId, m2);
            await new Promise(r => setTimeout(r, 1500));
          }

          await session.client.sendMessage(chatId, msg);
          await db.updateMemberStatus(userId, member.id, "llamado", true);
          this.addLog(userId, "success", `✓ Enviado a ${member.nombre} (${phone})`);
          exitos++;
        } catch (e) {
          this.addLog(userId, "error", `✕ Falló ${member.nombre}: ${e.message}`);
          errores++;
        }

        const delay = Math.floor(Math.random() * 6000) + 6000;
        await new Promise(r => setTimeout(r, delay));
      }

      this.addLog(userId, "success", `🔥 PROCESO TERMINADO. Éxitos: ${exitos} | Errores: ${errores}`);
      session.status = "CONNECTED";
    })();
  }
}

export const whatsappManager = new WhatsAppMultiManager();