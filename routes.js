import express from 'express';
import crypto from 'crypto';
import { db } from './db.js';
import { whatsappManager } from './whatsapp.js';
import { getFrontendHTML } from './views.js';

export const router = express.Router();
export const activeSessions = new Map();

export const requireAuth = (req, res, next) => {
    const sid = req.cookies.sid;
    if (!sid || !activeSessions.has(sid)) {
        return res.status(401).json({ error: "No autorizado. Inicie sesión." });
    }
    req.userId = activeSessions.get(sid);
    const user = db.data.users.find(u => u.id === req.userId);
    if (!user) return res.status(401).json({ error: "Usuario no existe." });
    req.username = user.username;
    next();
};

router.get('/', (req, res) => {
    res.send(getFrontendHTML());
});

router.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password || username.length < 3 || password.length < 4) {
        return res.status(400).json({ error: "Datos de usuario inválidos." });
    }
    try {
        const user = db.createUser(username, password);
        const sid = crypto.randomUUID();
        activeSessions.set(sid, user.id);
        res.cookie('sid', sid, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ success: true, username: user.username });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.verifyUser(username, password);
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas." });
    const sid = crypto.randomUUID();
    activeSessions.set(sid, user.id);
    res.cookie('sid', sid, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true, username: user.username });
});

router.post('/api/auth/logout', (req, res) => {
    const sid = req.cookies.sid;
    if (sid) { activeSessions.delete(sid); res.clearCookie('sid'); }
    res.json({ success: true });
});

router.get('/api/auth/me', (req, res) => {
    const sid = req.cookies.sid;
    if (!sid || !activeSessions.has(sid)) return res.json({ authenticated: false });
    const userId = activeSessions.get(sid);
    const user = db.data.users.find(u => u.id === userId);
    if (!user) return res.json({ authenticated: false });
    res.json({ authenticated: true, username: user.username });
});

router.get('/api/template', requireAuth, (req, res) => {
    res.json({ template: db.getTemplate(req.userId) });
});

router.post('/api/template', requireAuth, (req, res) => {
    const { template } = req.body;
    db.updateTemplate(req.userId, template);
    res.json({ success: true });
});

router.get('/api/members', requireAuth, (req, res) => {
    res.json(db.getMembers(req.userId));
});

router.post('/api/members', requireAuth, (req, res) => {
    const { mesa, nombre, telefono, rol } = req.body;
    if (!mesa || !nombre || !telefono || !rol) {
        return res.status(400).json({ error: "Todos los campos son obligatorios, incluyendo el Número de Mesa." });
    }
    const newMember = db.addMember(req.userId, mesa, nombre, telefono, rol);
    res.json(newMember);
});

router.patch('/api/members/:id/status', requireAuth, (req, res) => {
    const { field, value } = req.body;
    const success = db.updateMemberStatus(req.userId, req.params.id, field, value);
    if (success) res.json({ success: true });
    else res.status(400).json({ error: "No se pudo actualizar el estado operativo." });
});

router.delete('/api/members/:id', requireAuth, (req, res) => {
    const success = db.deleteMember(req.userId, req.params.id);
    if (success) res.json({ success: true });
    else res.status(404).json({ error: "No se encontró el miembro especificado." });
});

router.get('/api/export/csv', requireAuth, (req, res) => {
    const members = db.getMembers(req.userId);

    let csvContent = "\uFEFFMESA,DNI/CELULAR,APELLIDOS Y NOMBRES,CARGO,LLAMADO,CAPACITADO\n";

    members.forEach(m => {
        csvContent += `"${m.mesa}","${m.telefono}","${m.nombre}","${m.rol}","${m.llamado ? 'SÍ' : 'NO'}","${m.capacitado ? 'SÍ' : 'NO'}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_coordinacion_onpe.csv');
    res.status(200).send(csvContent);
});

router.get('/api/wa/status', requireAuth, (req, res) => {
    res.json({
        status: whatsappManager.waStatus,
        qr: whatsappManager.waQrCode,
        activeUser: whatsappManager.activeWaUserId ? db.data.users.find(u => u.id === whatsappManager.activeWaUserId)?.username : null,
        isCurrentUserSession: whatsappManager.activeWaUserId === req.userId,
        logs: whatsappManager.broadcastLogs
    });
});

router.post('/api/wa/start', requireAuth, async (req, res) => {
    if (whatsappManager.waClient && whatsappManager.activeWaUserId !== req.userId) {
        const activeUserName = db.data.users.find(u => u.id === whatsappManager.activeWaUserId)?.username;
        return res.status(400).json({ error: `WhatsApp ocupado por el usuario: ${activeUserName}` });
    }
    const result = await whatsappManager.startSession(req.userId);
    res.json({ success: true, status: whatsappManager.waStatus });
});

router.post('/api/wa/stop', requireAuth, async (req, res) => {
    try { await whatsappManager.stopSession(req.userId); res.json({ success: true }); }
    catch (error) { res.status(403).json({ error: error.message }); }
});

router.post('/api/wa/send', requireAuth, async (req, res) => {
    try {
        const userTemplate = db.getTemplate(req.userId);

        whatsappManager.sendBulkCustom = async function (userId, customTemplate) {
            if (!this.waClient || this.waStatus !== 'CONNECTED') throw new Error("WhatsApp desvinculado.");
            const miembros = db.getMembers(userId);
            if (miembros.length === 0) throw new Error("No hay miembros cargados.");

            this.waStatus = 'SENDING';
            this.broadcastLogs = [];
            this.logBroadcast(`Iniciando despacho asíncrono para tus mesas electorales...`, "info");

            (async () => {
                for (const miembro of miembros) {
                    try {
                        const jid = this.normalizarNumeroPeru(miembro.telefono);

                        let mensajeFinal = customTemplate
                            .replace(/{{nombre}}/g, miembro.nombre)
                            .replace(/{{cargo}}/g, miembro.rol)
                            .replace(/{{mesa}}/g, miembro.mesa);

                        this.logBroadcast(`Enviando a ${miembro.nombre} (Mesa ${miembro.mesa})...`, "info");
                        await this.waClient.sendText(jid, mensajeFinal);
                        this.logBroadcast(`[✓ ENTREGADO] Notificación enviada a ${miembro.nombre}.`, "success");
                    } catch (err) {
                        this.logBroadcast(`[X ERROR] Fallo en ${miembro.nombre}: ${err.message}`, "error");
                    }

                    const esUltimo = miembros.indexOf(miembro) === miembros.length - 1;
                    if (!esUltimo) {
                        const latencia = Math.floor(Math.random() * (22000 - 8000 + 1)) + 8000;
                        this.logBroadcast(`Pausa de seguridad: ${Math.round(latencia / 1000)} segundos...`, "info");
                        await this.delay(latencia);
                    }
                }
                this.logBroadcast("¡Proceso de envío masivo dinámico completado!", "success");
                this.waStatus = 'CONNECTED';
            })();
        };

        await whatsappManager.sendBulkCustom(req.userId, userTemplate);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});