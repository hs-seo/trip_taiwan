document.addEventListener('DOMContentLoaded', async () => {
    // ─── 0. Character Selection ─────────────────────────────────────────────
    const charOverlay = document.getElementById('char-select-overlay');
    const charGrid = document.getElementById('char-select-grid');
    const currentCharBadge = document.getElementById('current-char-badge');

    function showCharSelect() {
        const humans = defaultTripData.familyCharacters.filter(c => c.type === 'human');
        charGrid.innerHTML = humans.map(c => `
            <div class="char-select-card" onclick="selectCharacter('${c.id}')">
                <div style="width:64px;height:64px;border:3px solid var(--border-color);overflow:hidden;background:var(--bg-color);margin:0 auto 8px;">
                    <img src="${c.img}" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;"
                         onerror="this.outerHTML='<div style=\\'font-size:2.5rem;display:flex;align-items:center;justify-content:center;height:100%;\\'>${c.icon}</div>'">
                </div>
                <div style="font-weight:900;font-size:0.95rem;">${c.name}</div>
                <div style="font-size:0.7rem;color:var(--text-secondary);font-weight:700;margin-top:2px;">요원 선택</div>
            </div>
        `).join('');
        charOverlay.style.display = 'flex';
    }

    window.selectCharacter = (charId) => {
        setSelectedChar(charId);
        charOverlay.style.display = 'none';
        updateCharBadge();
        init();
    };

    function updateCharBadge() {
        const char = getSelectedChar();
        if (!char) return;
        currentCharBadge.innerHTML = `
            <div style="width:28px;height:28px;overflow:hidden;border:2px solid var(--border-color);background:var(--bg-color);flex-shrink:0;">
                <img src="${char.img}" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;"
                     onerror="this.outerHTML='<span style=\\'font-size:1.1rem;\\'>${char.icon}</span>'">
            </div>
            <span style="font-weight:900;font-size:0.75rem;">${char.name} 요원</span>
        `;
        currentCharBadge.onclick = () => showCharSelect();
    }

    // ─── Schedule state (init() 전에 선언 필수 — TDZ 방지) ──────────────────
    const scheduleTabs = document.getElementById('schedule-tabs');
    const timelineContainer = document.getElementById('schedule-timeline');
    const editScheduleBtn = document.getElementById('edit-schedule-btn');
    let isScheduleEditing = false;
    let currentScheduleDay = 1;

    // ─── Boot ────────────────────────────────────────────────────────────────
    function init() {
        renderHome();
        renderScheduleTabs();
        renderDay(currentScheduleDay);
        renderMissions();
        renderGallery();
        renderChecklist();
    }

    if (!getSelectedChar()) {
        showCharSelect();
    } else {
        updateCharBadge();
        init();
    }

    // 서버 상태 수신 후 미션/갤러리만 갱신 (await 제거 → 즉시 비동기 실행)
    fetchServerState().then(() => {
        renderMissions();
        renderGallery();
    });

    // ─── Nav ─────────────────────────────────────────────────────────────────
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget.getAttribute('data-target');
            navItems.forEach(n => n.classList.remove('active'));
            e.currentTarget.classList.add('active');
            views.forEach(v => {
                v.classList.remove('active');
                if (v.id === `view-${target}`) v.classList.add('active');
            });
        });
    });

    // ─── 6. Weather (Open-Meteo) ─────────────────────────────────────────────
    async function fetchWeather() {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=25.04&longitude=121.56&current_weather=true&timezone=Asia%2FTaipei');
            const data = await res.json();
            const cw = data.current_weather;
            const code = cw.weathercode;
            const iconMap = { 0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️', 45:'🌫️', 48:'🌫️', 51:'🌦️', 61:'🌧️', 71:'❄️', 80:'🌦️', 95:'⛈️' };
            const descMap = { 0:'맑음', 1:'대체로 맑음', 2:'구름 조금', 3:'흐림', 45:'안개', 51:'이슬비', 61:'비', 71:'눈', 80:'소나기', 95:'뇌우' };
            const icon = iconMap[code] || '🌡️';
            const desc = descMap[code] || '날씨 확인중';
            document.querySelector('.weather-card .temp').innerHTML = `${Math.round(cw.temperature)}°C ${icon}`;
            document.querySelector('.weather-card p').textContent = `타이베이 현재: ${desc}`;
        } catch(e) { /* API 연결 안될 때는 정적 텍스트 유지 */ }
    }

    // ─── Home ─────────────────────────────────────────────────────────────────
    function renderHome() {
        const dDayCounter = document.getElementById('d-day-counter');
        const start = new Date(tripData.startDate).getTime();
        const days = Math.ceil((start - Date.now()) / 86400000);
        dDayCounter.innerText = days > 0 ? `D-${days}` : days === 0 ? 'D-Day 🎉' : `D+${Math.abs(days)}`;

        document.getElementById('home-highlights').innerHTML = tripData.schedule[0].events.slice(0, 2).map(ev => `
            <div class="timeline-item">
                <div class="time">${ev.time}</div>
                <div class="timeline-content">
                    <div class="timeline-icon"><i class="fa-solid ${ev.icon}"></i></div>
                    <h4>${ev.title}</h4>
                    <p>${ev.desc}</p>
                </div>
            </div>
        `).join('');

        document.getElementById('home-avatars').innerHTML = defaultTripData.familyCharacters.map(char => `
            <div class="avatar-card">
                <div class="avatar-icon" style="width:48px;height:48px;border:2px solid var(--border-color);overflow:hidden;background:var(--bg-color);margin-bottom:5px;">
                    <img src="${char.img}" alt="${char.name}" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;"
                         onerror="this.onerror=null;this.outerHTML='<span style=\\'font-size:1.8rem;display:flex;align-items:center;justify-content:center;height:100%;\\'>${char.icon}</span>'">
                </div>
                <div class="avatar-name">${char.name}</div>
                <div style="width:100%;padding-left:14px;padding-right:2px;padding-top:2px;">
                    <div class="rpg-bar"><div class="rpg-label">HP</div><div class="hp-bar-fill" style="width:${char.hp}%"></div></div>
                    <div class="rpg-bar"><div class="rpg-label">MP</div><div class="mp-bar-fill" style="width:${char.mp}%"></div></div>
                </div>
            </div>
        `).join('');

        fetchWeather();
    }

    // ─── Schedule ────────────────────────────────────────────────────────────
    function renderScheduleTabs() {
        scheduleTabs.innerHTML = tripData.schedule.map(day => `
            <div class="day-tab ${day.day === currentScheduleDay ? 'active':''}" data-day="${day.day}">
                Day ${day.day}<br><span style="font-size:0.7rem;">${day.date}</span>
            </div>
        `).join('');
        document.querySelectorAll('.day-tab').forEach(tab => {
            tab.addEventListener('click', e => {
                if (isScheduleEditing) return;
                document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                currentScheduleDay = parseInt(e.currentTarget.getAttribute('data-day'));
                renderDay(currentScheduleDay);
            });
        });
    }

    function renderDay(dayNum) {
        const dayData = tripData.schedule.find(d => d.day === dayNum);
        // Route map
        const routeMap = document.getElementById('route-map');
        const major = dayData.events.filter(e => !['fa-bed','fa-plane','fa-ticket'].includes(e.icon)).slice(0, 4);
        routeMap.innerHTML = `
            <div class="route-line-container"><div class="route-line"></div></div>
            ${major.map((ev,i) => `
            <div class="route-node">
                <i class="fa-solid fa-map-pin route-pin" style="animation-delay:${i*0.2}s"></i>
                <div class="route-label">${ev.title.split(' ')[0]}</div>
            </div>`).join('')}
            <div class="tape" style="top:-10px;width:60px;"></div>`;

        const imageInsertAfter = 3;
        timelineContainer.innerHTML = dayData.events.map((ev, index) => {
            let block = '';
            if (isScheduleEditing) {
                block = `<div class="timeline-item" data-id="${ev.id}">
                    <input type="text" class="edit-input" style="width:55px;" value="${ev.time}" data-field="time">
                    <div class="timeline-content" style="padding:10px;">
                        <input type="text" class="edit-input" value="${ev.title}" data-field="title">
                        <input type="text" class="edit-input" value="${ev.desc}" data-field="desc">
                    </div></div>`;
            } else {
                // 5. Map link button on each event
                const mapBtn = ev.mapUrl ? `<a href="${ev.mapUrl}" target="_blank" rel="noopener" class="map-link-btn" title="구글 지도로 보기"><i class="fa-solid fa-map-location-dot"></i></a>` : '';
                block = `<div class="timeline-item fade-up" style="animation-delay:${index*0.1}s">
                    <div class="time">${ev.time}</div>
                    <div class="timeline-content">
                        <div class="timeline-icon"><i class="fa-solid ${ev.icon}"></i></div>
                        <h4>${ev.title} ${mapBtn}</h4>
                        <p>${ev.desc}</p>
                    </div></div>`;
            }
            if (!isScheduleEditing && index === imageInsertAfter && dayData.mapImage) {
                block += `<div class="banner-box fade-up" style="margin:5px 0 20px;animation-delay:${(index+0.5)*0.1}s">
                    <div class="tape"></div>
                    <img src="${dayData.mapImage}" alt="Day ${dayData.day} 작전 지도" class="banner-img">
                    <div style="background:var(--card-bg);padding:6px 8px;font-size:0.7rem;font-weight:900;text-align:center;border-top:2px dashed #94a3b8;">📌 Day ${dayData.day} 작전 이동 루트</div>
                </div>`;
            }
            return block;
        }).join('');
    }

    editScheduleBtn.addEventListener('click', () => {
        if (!isScheduleEditing) {
            isScheduleEditing = true;
            editScheduleBtn.innerHTML = '<i class="fa-solid fa-check"></i> 완료';
            editScheduleBtn.classList.add('editing');
            renderDay(currentScheduleDay);
        } else {
            const items = timelineContainer.querySelectorAll('.timeline-item');
            const dayData = tripData.schedule.find(d => d.day === currentScheduleDay);
            items.forEach(item => {
                const id = item.getAttribute('data-id');
                const ev = dayData.events.find(e => e.id === id);
                if (!ev) return;
                ev.time = item.querySelector('[data-field="time"]').value;
                ev.title = item.querySelector('[data-field="title"]').value;
                ev.desc = item.querySelector('[data-field="desc"]').value;
            });
            saveLocalData();
            isScheduleEditing = false;
            editScheduleBtn.innerHTML = '<i class="fa-solid fa-pen"></i> 수정';
            editScheduleBtn.classList.remove('editing');
            renderDay(currentScheduleDay);
        }
    });

    // ─── Missions ────────────────────────────────────────────────────────────
    function triggerStampAnimation() {
        const stamp = document.getElementById('stamp-overlay');
        stamp.classList.remove('active');
        void stamp.offsetWidth;
        stamp.classList.add('active');
        setTimeout(() => stamp.classList.remove('active'), 1500);
    }

    function getMissionState(mId) {
        return serverState.missions?.[mId] || { completedBy: [], currentCount: 0, done: false };
    }

    function renderMissions() {
        const container = document.getElementById('mission-list');
        container.innerHTML = tripData.missions.map(m => {
            const sm = getMissionState(m.id);
            const isDone = m.targetCount ? sm.currentCount >= m.targetCount : sm.completedBy.length > 0;
            const completors = (sm.completedBy || []).map(cid => {
                const ch = defaultTripData.familyCharacters.find(c => c.id === cid);
                if (!ch) return '';
                return `<div title="${ch.name}" style="width:22px;height:22px;border:2px solid var(--border-color);overflow:hidden;background:var(--bg-color);flex-shrink:0;">
                    <img src="${ch.img}" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;"
                         onerror="this.outerHTML='<span style=\\'font-size:0.9rem;\\'>${ch.icon}</span>'">
                </div>`;
            }).join('');
            const progressHTML = m.targetCount ? `<div style="font-size:0.75rem;margin-top:5px;color:var(--text-secondary);font-weight:800;">진행: ${sm.currentCount}/${m.targetCount}</div>` : '';
            return `<div class="list-item ${isDone?'completed':''}" data-id="${m.id}" onclick="toggleMission('${m.id}')">
                <div class="list-icon">${m.icon}</div>
                <div class="list-info">
                    <h4>${m.title}</h4>
                    <p>${m.desc}</p>
                    ${progressHTML}
                    ${completors ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px;">${completors}</div>` : ''}
                </div>
                <div class="list-status"><i class="fa-solid fa-square-check"></i></div>
                <i class="fa-solid fa-stamp mission-stamp-badge"></i>
            </div>`;
        }).join('');
    }

    window.toggleMission = async (id) => {
        const m = tripData.missions.find(x => x.id === id);
        const char = getSelectedChar();
        if (!char) { showCharSelect(); return; }
        const sm = getMissionState(id);

        let action;
        if (m.targetCount) {
            if (sm.currentCount >= m.targetCount) {
                action = 'reset';
            } else {
                action = 'increment';
            }
        } else {
            action = 'toggle';
        }

        const result = await postMissionComplete(id, char.id, action);
        if (!result) {
            // Offline fallback
            if (!serverState.missions) serverState.missions = {};
            if (!serverState.missions[id]) serverState.missions[id] = { completedBy: [], currentCount: 0, done: false };
            const ssm = serverState.missions[id];
            if (action === 'reset') { ssm.completedBy = ssm.completedBy.filter(c=>c!==char.id); ssm.currentCount = Math.max(0,ssm.currentCount-1); ssm.done = false; }
            else if (action === 'increment') { ssm.currentCount++; if (!ssm.completedBy.includes(char.id)) ssm.completedBy.push(char.id); }
            else { if (ssm.completedBy.includes(char.id)) { ssm.completedBy = ssm.completedBy.filter(c=>c!==char.id); ssm.done = false; } else { ssm.completedBy.push(char.id); ssm.done = true; } }
        }

        const finalState = getMissionState(id);
        const isDone = m.targetCount ? finalState.currentCount >= m.targetCount : finalState.completedBy.length > 0;
        if (isDone) triggerStampAnimation();
        renderMissions();
    };

    // ─── 3. Gallery / Photo Upload ────────────────────────────────────────────
    function renderGallery() {
        const grid = document.getElementById('gallery-grid');
        const photos = serverState.photos || [];
        if (photos.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:30px 0;color:var(--text-secondary);font-weight:800;font-size:0.9rem;">📷 아직 증거 사진이 없습니다<br><span style="font-size:0.75rem;">수집 버튼으로 사진을 올려주세요</span></div>`;
            return;
        }
        grid.innerHTML = photos.map(p => {
            const ch = defaultTripData.familyCharacters.find(c => c.id === p.charId);
            return `<div class="polaroid-frame" style="position:relative;">
                <div class="polaroid-tape"></div>
                <img src="${p.url}" style="width:100%;display:block;object-fit:cover;aspect-ratio:1/1;border:2px solid var(--border-color);">
                <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 2px 0;">
                    ${ch ? `<div title="${ch.name}" style="width:20px;height:20px;overflow:hidden;border:1px solid var(--border-color);flex-shrink:0;"><img src="${ch.img}" style="width:100%;height:100%;object-fit:cover;" onerror="this.outerHTML='${ch.icon}'"></div>` : '<div></div>'}
                    <button onclick="deletePhoto('${p.id}')" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:0.75rem;" title="삭제"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    }

    window.deletePhoto = async (photoId) => {
        if (!confirm('이 사진을 삭제할까요?')) return;
        try {
            await fetch(`${API_BASE}/api/photo/${photoId}`, { method: 'DELETE' });
            serverState.photos = (serverState.photos || []).filter(p => p.id !== photoId);
            renderGallery();
        } catch(e) { alert('삭제 실패: 서버 연결을 확인하세요.'); }
    };

    // Upload trigger
    document.getElementById('upload-trigger').addEventListener('change', async (e) => {
        const char = getSelectedChar();
        if (!char) { showCharSelect(); return; }
        const files = e.target.files;
        if (!files.length) return;

        const fd = new FormData();
        for (const f of files) fd.append('photos', f);
        fd.append('charId', char.id);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: fd });
            const data = await res.json();
            serverState.photos = [...(serverState.photos || []), ...data.photos];
            renderGallery();
        } catch(e) { alert('업로드 실패: 서버 연결을 확인하세요.'); }
        e.target.value = '';
    });

    // ─── Checklist ───────────────────────────────────────────────────────────
    function renderChecklist() {
        const container = document.getElementById('info-checklist');
        container.innerHTML = tripData.checklist.map(c => `
            <div class="list-item ${c.done?'completed':''}" data-id="${c.id}" onclick="toggleChecklist('${c.id}')" style="padding:12px 15px;">
                <div class="list-status" style="margin-right:15px;"><i class="fa-${c.done?'solid fa-square-check':'regular fa-square'}"></i></div>
                <div class="list-info"><h4 style="margin:0;">${c.title}</h4></div>
            </div>`).join('');
    }

    window.toggleChecklist = (id) => {
        const c = tripData.checklist.find(x => x.id === id);
        c.done = !c.done;
        saveLocalData();
        renderChecklist();
    };
});
