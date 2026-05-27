import express from 'express';
import crypto from 'crypto';
import { db } from './db.js';
import { whatsappManager } from './whatsapp.js';
import { getFrontendHTML } from './views.js';

export const router = express.Router();
export const activeSessions = new Map();

export const requireAuth = (req, res, next) => {
    const sid = req.cookies.sid;
    if (!sid || !activeSessions.has(sid)) return res.status(401).json({ error: "No autorizado." });
    req.userId = activeSessions.get(sid);
    const user = db.data.users.find(u => u.id === req.userId);
    if (!user) return res.status(401).json({ error: "Usuario inexistente." });
    req.username = user.username;
    next();
};

router.get('/', (req, res) => res.send(getFrontendHTML()));

router.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.createUser(username, password);
        const sid = crypto.randomUUID();
        activeSessions.set(sid, user.id);
        res.cookie('sid', sid, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ success: true, username: user.username });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

router.post('/api/auth/login', (req, res) => {
    const user = db.verifyUser(req.body.username, req.body.password);
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas." });
    const sid = crypto.randomUUID();
    activeSessions.set(sid, user.id);
    res.cookie('sid', sid, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true, username: user.username });
});

router.post('/api/auth/logout', async (req, res) => {
    const sid = req.cookies.sid;
    if (sid) {
        const userId = activeSessions.get(sid);
        await whatsappManager.stopSession(userId);
        activeSessions.delete(sid);
        res.clearCookie('sid');
    }
    res.json({ success: true });
});

router.get('/api/auth/me', (req, res) => {
    const sid = req.cookies.sid;
    if (!sid || !activeSessions.has(sid)) return res.json({ authenticated: false });
    res.json({ authenticated: true, username: db.data.users.find(u => u.id === activeSessions.get(sid))?.username });
});

router.get('/api/template', requireAuth, (req, res) => res.json({ template: db.getTemplate(req.userId) }));
router.post('/api/template', requireAuth, async (req, res) => {
    await db.updateTemplate(req.userId, req.body.template);
    res.json({ success: true });
});

router.get('/api/template/images', requireAuth, (req, res) => res.json(db.getUserImagesInfo(req.userId)));
router.post('/api/template/images', requireAuth, async (req, res) => {
    try {
        await db.saveUserImage(req.userId, Number(req.body.index), req.body.base64Data);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/api/template/images/:index', requireAuth, async (req, res) => {
    const success = await db.deleteUserImage(req.userId, Number(req.params.index));
    success ? res.json({ success: true }) : res.status(404).json({ error: "No encontrada." });
});

router.get('/api/members', requireAuth, (req, res) => res.json(db.getMembers(req.userId)));
router.post('/api/members', requireAuth, async (req, res) => {
    try {
        res.json(await db.addMember(req.userId, req.body.mesa, req.body.nombre, req.body.telefono, req.body.rol));
    } catch (error) { res.status(400).json({ error: error.message }); }
});
router.patch('/api/members/:id/status', requireAuth, async (req, res) => {
    const success = await db.updateMemberStatus(req.userId, req.params.id, req.body.field, req.body.value);
    success ? res.json({ success: true }) : res.status(400).json({ error: "Error al actualizar." });
});
router.delete('/api/members/:id', requireAuth, async (req, res) => {
    const success = await db.deleteMember(req.userId, req.params.id);
    success ? res.json({ success: true }) : res.status(404).json({ error: "No encontrado." });
});

router.get('/api/export/csv', requireAuth, (req, res) => {
    const members = db.getMembers(req.userId);
    let csvContent = "\uFEFFMESA;CELULAR;NOMBRES;CARGO;LLAMADO;CAPACITADO\n"; // Usamos ; para Excel en español
    members.forEach(m => {
        csvContent += `"${m.mesa}";"${m.telefono}";"${m.nombre}";"${m.rol}";"${m.llamado ? 'SÍ' : 'NO'}";"${m.capacitado ? 'SÍ' : 'NO'}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=coordinados_onpe.csv');
    res.send(csvContent);
});

router.get('/api/wa/status', requireAuth, (req, res) => {
    res.json(whatsappManager.getSession(req.userId));
});

router.post('/api/wa/start', requireAuth, async (req, res) => {
    const result = await whatsappManager.startSession(req.userId, req.body.phoneNumber);
    result.success ? res.json({ success: true }) : res.status(400).json({ error: result.message });
});

router.post('/api/wa/stop', requireAuth, async (req, res) => {
    await whatsappManager.stopSession(req.userId);
    res.json({ success: true });
});

router.post('/api/wa/send', requireAuth, async (req, res) => {
    try {
        await whatsappManager.sendBulk(req.userId);
        res.json({ success: true });
    } catch (error) { res.status(400).json({ error: error.message }); }
});