const express = require('express');
const multer = require('multer');
const path = require('path');
const archiver = require('archiver');
const cors = require('cors');
const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');

const app = express();
const PORT = process.env.PORT || 3000;
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const BUCKET_NAME = process.env.GCS_BUCKET_NAME;

const db = new Firestore({ projectId: PROJECT_ID });
const storage = new Storage({ projectId: PROJECT_ID });
const bucket = storage.bucket(BUCKET_NAME);
const stateDoc = db.collection('app').doc('state');

// Multer — 메모리에만 올림 (로컬 디스크 사용 안 함)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());

// 모든 정적 파일 no-cache (항상 재검증, 304 Not Modified로 빠르게 처리)
app.use(express.static(__dirname, {
    setHeaders: (res) => {
        res.set('Cache-Control', 'no-cache');
    }
}));

// 상태 초기화
async function loadState() {
    const snap = await stateDoc.get();
    if (!snap.exists) {
        const init = { missions: {}, photos: [] };
        await stateDoc.set(init);
        return init;
    }
    return snap.data();
}

async function saveState(state) {
    await stateDoc.set(state);
}

// GET /api/state
app.get('/api/state', async (req, res) => {
    try {
        res.json(await loadState());
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PUT /api/schedule
app.put('/api/schedule', async (req, res) => {
    try {
        const state = await loadState();
        state.schedule = req.body.schedule;
        await saveState(state);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PUT /api/checklist
app.put('/api/checklist', async (req, res) => {
    try {
        const state = await loadState();
        state.checklist = req.body.checklist;
        await saveState(state);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/mission/:id/complete
app.post('/api/mission/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const { charId, action } = req.body;
        const state = await loadState();

        if (!state.missions[id]) {
            state.missions[id] = { completedBy: [], currentCount: 0, done: false };
        }
        const m = state.missions[id];

        if (!m.counts) m.counts = {};
        if (action === 'reset') {
            // 내 카운트만 리셋
            m.counts[charId] = 0;
            m.completedBy = m.completedBy.filter(c => c !== charId);
        } else if (action === 'increment') {
            m.counts[charId] = (m.counts[charId] || 0) + 1;
            if (!m.completedBy.includes(charId)) m.completedBy.push(charId);
        } else {
            // 일반 미션 토글
            if (m.completedBy.includes(charId)) {
                m.completedBy = m.completedBy.filter(c => c !== charId);
            } else {
                m.completedBy.push(charId);
            }
        }
        m.done = m.completedBy.length > 0;

        await saveState(state);
        res.json({ success: true, mission: m });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/upload — Cloud Storage에 업로드
app.post('/api/upload', upload.array('photos', 20), async (req, res) => {
    try {
        const { charId } = req.body;
        const state = await loadState();

        const newPhotos = await Promise.all(req.files.map(async (f) => {
            const id = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const ext = path.extname(f.originalname);
            const filename = `${id}${ext}`;
            const file = bucket.file(filename);

            await file.save(f.buffer, {
                contentType: f.mimetype,
                metadata: { cacheControl: 'public, max-age=31536000' }
            });

            return {
                id,
                filename,
                originalName: f.originalname,
                charId: charId || 'unknown',
                uploadedAt: new Date().toISOString(),
                url: `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`
            };
        }));

        state.photos = [...(state.photos || []), ...newPhotos];
        await saveState(state);
        res.json({ success: true, photos: newPhotos });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE /api/photo/:id
app.delete('/api/photo/:id', async (req, res) => {
    try {
        const state = await loadState();
        const photo = state.photos.find(p => p.id === req.params.id);
        if (!photo) return res.status(404).json({ error: 'not found' });

        await bucket.file(photo.filename).delete().catch(() => {});
        state.photos = state.photos.filter(p => p.id !== req.params.id);
        await saveState(state);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/download-all — 전체 사진 ZIP
app.get('/api/download-all', async (req, res) => {
    try {
        const state = await loadState();
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=taiwan-trip-photos.zip');

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        await Promise.all((state.photos || []).map(async (p) => {
            const [buffer] = await bucket.file(p.filename).download();
            archive.append(buffer, { name: p.originalName || p.filename });
        }));

        archive.finalize();
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/bulletins
app.get('/api/bulletins', async (req, res) => {
    try {
        const state = await loadState();
        res.json(state.bulletins || []);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/bulletin
app.post('/api/bulletin', async (req, res) => {
    try {
        const state = await loadState();
        if (!state.bulletins) state.bulletins = [];
        const bulletin = { id: Date.now().toString(), timestamp: new Date().toISOString(), ...req.body };
        state.bulletins.unshift(bulletin);
        await saveState(state);
        res.json(bulletin);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/bulletin/:id
app.delete('/api/bulletin/:id', async (req, res) => {
    try {
        const state = await loadState();
        state.bulletins = (state.bulletins || []).filter(b => b.id !== req.params.id);
        await saveState(state);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
    console.log(`🕵️ 극비수사: 대만 서버 가동 중 → PORT ${PORT}`);
});
