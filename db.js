import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE = path.resolve('db.json');

class PortableDB {
  constructor() {
    this.data = { users: [], members: [] };
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.save();
    } else {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } catch (error) {
        console.error("[DB ERROR]: No se pudo leer db.json, reiniciando...", error);
        this.save();
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error("[DB ERROR]: Error al escribir en db.json:", error);
    }
  }

  createUser(username, password) {
    const normalizedUsername = username.toLowerCase().trim();
    if (this.data.users.find(u => u.username === normalizedUsername)) {
      throw new Error("El nombre de usuario ya está registrado.");
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    const defaultTemplate = `Hola *{{nombre}}*, te saluda Juan Pimentel, coordinador electoral de la ONPE para tu mesa *{{mesa}}*.

Te notifico que has sido asignado bajo el cargo de: *{{cargo}}*. Tu presencia es vital para el proceso.

⚠️ *CONFIRMACIÓN ADMINISTRATIVA:*
Por favor, responde directamente a este mensaje con la palabra *RECIBIDO* para coordinar tu capacitación logística.`;

    const newUser = { id: crypto.randomUUID(), username: normalizedUsername, passwordHash, mensajeTemplate: defaultTemplate };
    this.data.users.push(newUser);
    this.save();
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

  updateTemplate(userId, newTemplate) {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      user.mensajeTemplate = newTemplate;
      this.save();
      return true;
    }
    return false;
  }

  getMembers(userId) {
    return this.data.members.filter(m => m.userId === userId);
  }

  addMember(userId, mesa, nombre, telefono, rol) {
    const newMember = {
      id: crypto.randomUUID(),
      userId,
      mesa: mesa.trim(),
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      rol: rol.trim(),
      llamado: false,
      capacitado: false
    };
    this.data.members.push(newMember);
    this.save();
    return newMember;
  }

  updateMemberStatus(userId, memberId, field, value) {
    const member = this.data.members.find(m => m.id === memberId && m.userId === userId);
    if (member && (field === 'llamado' || field === 'capacitado')) {
      member[field] = value;
      this.save();
      return true;
    }
    return false;
  }

  deleteMember(userId, memberId) {
    const initialLength = this.data.members.length;
    this.data.members = this.data.members.filter(m => !(m.id === memberId && m.userId === userId));
    this.save();
    return this.data.members.length < initialLength;
  }
}

export const db = new PortableDB();