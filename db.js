import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promises as fsPromises } from 'fs';

const DB_FILE = path.resolve('db.json');
const UPLOADS_DIR = path.resolve('uploads');

class PortableDB {
  constructor() {
    this.data = { users: [], members: [] };
    this.writeQueue = Promise.resolve();
    this.initSync();
  }

  initSync() {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } else {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } catch (error) {
        console.error("[DB ERROR]: db.json corrupto, reiniciando...", error);
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
      }
    }
  }

  async save() {
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        await fsPromises.writeFile(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
      } catch (error) {
        console.error("[DB ERROR]: Error al escribir asíncronamente:", error);
      }
    });
    return this.writeQueue;
  }

  async createUser(username, password) {
    const normalizedUsername = username.toLowerCase().trim();
    if (this.data.users.find(u => u.username === normalizedUsername)) {
      throw new Error("El nombre de usuario ya está registrado.");
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    const defaultTemplate = `Hola *{{nombre}}*, te saluda coordinador electoral de la ONPE para tu mesa *{{mesa}}*.\n\nTe notifico que has sido asignado bajo el cargo de: *{{cargo}}*. Tu presencia es vital para el proceso.\n\n⚠️ *CONFIRMACIÓN ADMINISTRATIVA:*\nPor favor, responde directamente a este mensaje con la palabra *RECIBIDO*.`;

    const newUser = {
      id: crypto.randomUUID(),
      username: normalizedUsername,
      passwordHash,
      mensajeTemplate: defaultTemplate,
      image1: null,
      image2: null
    };
    this.data.users.push(newUser);
    await this.save();
    return newUser;
  }

  verifyUser(username, password) {
    const normalizedUsername = username.toLowerCase().trim();
    const user = this.data.users.find(u => u.username === normalizedUsername);
    if (!user) return null;

    const [salt, originalHash] = user.passwordHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash ? user : null;
  }

  getTemplate(userId) {
    const user = this.data.users.find(u => u.id === userId);
    return user ? user.mensajeTemplate : '';
  }

  async updateTemplate(userId, newTemplate) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.mensajeTemplate = newTemplate;
      await this.save();
      return true;
    }
    return false;
  }

  async saveUserImage(userId, index, base64Data) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error("Coordinador no encontrado.");

    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Clean, 'base64');
    const fileName = `${userId}_image${index}_${Date.now()}.png`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    this._deleteOldImageSync(index === 1 ? user.image1 : user.image2);

    await fsPromises.writeFile(filePath, buffer);
    if (index === 1) user.image1 = fileName;
    if (index === 2) user.image2 = fileName;

    await this.save();
    return true;
  }

  async deleteUserImage(userId, index) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return false;

    const fileName = index === 1 ? user.image1 : user.image2;
    if (fileName) {
      this._deleteOldImageSync(fileName);
      if (index === 1) user.image1 = null;
      if (index === 2) user.image2 = null;
      await this.save();
      return true;
    }
    return false;
  }

  _deleteOldImageSync(fileName) {
    if (!fileName) return;
    const filePath = path.join(UPLOADS_DIR, fileName);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { }
    }
  }

  getUserImagesInfo(userId) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return { image1: null, image2: null };

    let img1Base64 = null, img2Base64 = null;
    if (user.image1 && fs.existsSync(path.join(UPLOADS_DIR, user.image1))) {
      img1Base64 = `data:image/png;base64,${fs.readFileSync(path.join(UPLOADS_DIR, user.image1), 'base64')}`;
    }
    if (user.image2 && fs.existsSync(path.join(UPLOADS_DIR, user.image2))) {
      img2Base64 = `data:image/png;base64,${fs.readFileSync(path.join(UPLOADS_DIR, user.image2), 'base64')}`;
    }
    return { image1: img1Base64, image2: img2Base64 };
  }

  getMembers(userId) {
    return this.data.members.filter(m => m.userId === userId).reverse(); // Más recientes primero
  }

  async addMember(userId, mesa, nombre, telefono, rol) {
    const newMember = {
      id: crypto.randomUUID(), userId, mesa: mesa.trim(), nombre: nombre.trim(),
      telefono: telefono.trim(), rol: rol.trim(), llamado: false, capacitado: false
    };
    this.data.members.push(newMember);
    await this.save();
    return newMember;
  }

  async updateMemberStatus(userId, memberId, field, value) {
    const member = this.data.members.find(m => m.id === memberId && m.userId === userId);
    if (member && (field === 'llamado' || field === 'capacitado')) {
      member[field] = value;
      await this.save();
      return true;
    }
    return false;
  }

  async deleteMember(userId, memberId) {
    const initialLength = this.data.members.length;
    this.data.members = this.data.members.filter(m => !(m.id === memberId && m.userId === userId));
    await this.save();
    return this.data.members.length < initialLength;
  }
}

export const db = new PortableDB();