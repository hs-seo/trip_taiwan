const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 18963;
const STATE_FILE = path.join(__dirname, 'state.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Initialize state file if missing
function loadState() {
    if (!fs.existsSync(STATE_FILE)) {
        const init = { missions: {}, photos: [] };
        fs.writeFileSync(STATE_FILE, JSON.stringify(init, null, 2));
        return init;
    }
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
}

function saveState(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Multer storage for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOADS_DIR));

// GET /api/state — return full server state
app.get('/api/state', (req, res) => {
    res.json(loadState());
});

// POST /api/mission/:id/complete — mark mission done by a character
app.post('/api/mission/:id/complete', (req, res) => {
    const { id } = req.params;
    const { charId, action } = req.body; // action: 'add' | 'increment' | 'reset'

    const state = loadState();
    if (!state.missions[id]) {
        state.missions[id] = { completedBy: [], currentCount: 0, done: false };
    }
    const m = state.missions[id];

    if (action === 'reset') {
        m.completedBy = m.completedBy.filter(c => c !== charId);
        m.currentCount = Math.max(0, m.currentCount - 1);
        if (m.currentCount === 0) m.done = false;
    } else if (action === 'increment') {
        m.currentCount++;
        if (!m.completedBy.includes(charId)) m.completedBy.push(charId);
    } else {
        // toggle
        if (m.completedBy.includes(charId)) {
            m.completedBy = m.completedBy.filter(c => c !== charId);
            m.done = false;
        } else {
            m.completedBy.push(charId);
            m.done = true;
        }
    }

    saveState(state);
    res.json({ success: true, mission: m });
});

// POST /api/upload — upload photo(s)
app.post('/api/upload', upload.array('photos', 20), (req, res) => {
    const { charId } = req.body;
    const state = loadState();

    const newPhotos = req.files.map(f => ({
        id: path.basename(f.filename, path.extname(f.filename)),
        filename: f.filename,
        originalName: f.originalname,
        charId: charId || 'unknown',
        uploadedAt: new Date().toISOString(),
        url: `/uploads/${f.filename}`
    }));
    state.photos = [...(state.photos || []), ...newPhotos];
    saveState(state);
    res.json({ success: true, photos: newPhotos });
});

// DELETE /api/photo/:id — delete a photo
app.delete('/api/photo/:id', (req, res) => {
    const state = loadState();
    const photo = state.photos.find(p => p.id === req.params.id);
    if (!photo) return res.status(404).json({ error: 'not found' });

    const filePath = path.join(UPLOADS_DIR, photo.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    state.photos = state.photos.filter(p => p.id !== req.params.id);
    saveState(state);
    res.json({ success: true });
});

// GET /api/download-all — download all photos as ZIP
app.get('/api/download-all', (req, res) => {
    const state = loadState();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=taiwan-trip-photos.zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    (state.photos || []).forEach(p => {
        const filePath = path.join(UPLOADS_DIR, p.filename);
        if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: p.originalName || p.filename });
        }
    });
    archive.finalize();
});

app.listen(PORT, () => {
    console.log(`🕵️ 극비수사: 대만 서버 가동 중 → PORT ${PORT}`);
});
