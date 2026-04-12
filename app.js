// 모바일 디버그: JS 에러 화면에 표시
window.onerror = function(msg, src, line, col, err) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#c00;color:#fff;padding:10px;z-index:99999;font-size:11px;word-break:break-all;';
    div.textContent = 'JS ERROR: ' + msg + ' (line ' + line + ')';
    document.body.appendChild(div);
};

document.addEventListener('DOMContentLoaded', async () => {
    // ─── Nav (최우선 — 이후 코드에서 에러가 나도 nav는 동작해야 함) ────────────
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
    let scheduleUnlocked = false;

    window.toggleScheduleLock = () => {
        scheduleUnlocked = !scheduleUnlocked;
        const lockBtn = document.getElementById('schedule-lock-btn');
        lockBtn.innerHTML = scheduleUnlocked
            ? '<i class="fa-solid fa-lock-open"></i>'
            : '<i class="fa-solid fa-lock"></i>';
        editScheduleBtn.style.display = scheduleUnlocked ? '' : 'none';
        if (!scheduleUnlocked && isScheduleEditing) {
            isScheduleEditing = false;
            editScheduleBtn.innerHTML = '<i class="fa-solid fa-pen"></i> 수정';
            editScheduleBtn.classList.remove('editing');
            renderDay(currentScheduleDay);
        }
    };

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

    // 서버 상태 수신 후 갱신
    fetchServerState().then(() => {
        renderMissions();
        renderGallery();
        renderScheduleTabs();
        renderDay(currentScheduleDay);
        renderChecklist();
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

        const avatarCard = char => `
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
            </div>`;
        const humans = defaultTripData.familyCharacters.filter(c => c.type === 'human');
        const allies = defaultTripData.familyCharacters.filter(c => c.type !== 'human');
        document.getElementById('home-avatars').innerHTML =
            `<div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;">${humans.map(avatarCard).join('')}</div>` +
            `<div style="display:flex;gap:10px;overflow-x:auto;padding-top:4px;scrollbar-width:none;">${allies.map(avatarCard).join('')}</div>`;

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
                const tipsVal = (ev.tips || []).join('\n');
                block = `<div class="timeline-item" data-id="${ev.id}">
                    <input type="text" class="edit-input" style="width:55px;" value="${ev.time}" data-field="time">
                    <div class="timeline-content" style="padding:10px;">
                        <input type="text" class="edit-input" value="${ev.title}" data-field="title">
                        <input type="text" class="edit-input" value="${ev.desc}" data-field="desc">
                        <textarea class="edit-input" data-field="tips" rows="3" placeholder="꿀팁 (한 줄에 하나씩)" style="resize:vertical;min-height:50px;">${tipsVal}</textarea>
                    </div></div>`;
            } else {
                // 5. Map link button on each event
                const mapBtn = ev.mapUrl ? `<a href="${ev.mapUrl}" target="_blank" rel="noopener" class="map-link-btn" title="구글 지도로 보기"><i class="fa-solid fa-map-location-dot"></i></a>` : '';
                const tipsHTML = (ev.tips && ev.tips.length)
                    ? `<div class="tips-toggle" onclick="var s=document.getElementById('tips-sec-${ev.id}');var open=s.style.display==='block';s.style.display=open?'none':'block';this.querySelector('.tips-arrow').style.transform=open?'':'rotate(180deg)';">
                           <i class="fa-solid fa-lightbulb"></i> 꿀팁 ${ev.tips.length}개
                           <i class="fa-solid fa-chevron-down tips-arrow"></i>
                       </div>
                       <div class="tips-section" id="tips-sec-${ev.id}" style="display:none;">
                           <ul class="tips-list" id="tips-list-${ev.id}" style="display:block;">${ev.tips.map(t => `<li>${t}</li>`).join('')}</ul>
                           <button class="tips-edit-btn" onclick="toggleTipsEdit('${ev.id}')">✏️</button>
                           <textarea class="tips-edit-area" id="tips-edit-${ev.id}" style="display:none;">${ev.tips.join('\n')}</textarea>
                           <button class="tips-save-btn" id="tips-save-${ev.id}" style="display:none;" onclick="saveTips('${ev.id}', ${currentScheduleDay})">저장</button>
                       </div>`
                    : '';
                const optionsHTML = (ev.options && ev.options.length)
                    ? ev.compare
                        ? `<div class="compare-cards">
                               ${ev.options.map((o, ci) => `
                               <a href="${o.mapUrl}" target="_blank" rel="noopener" class="compare-card ${ci === 0 ? 'compare-card--pick' : ''}">
                                   ${o.tag ? `<div class="compare-tag">${o.tag}</div>` : ''}
                                   <div class="compare-name">${o.name}</div>
                                   <div class="compare-desc">${o.desc || ''}</div>
                                   ${o.highlights ? `<ul class="compare-highlights">${o.highlights.map(h => `<li>${h}</li>`).join('')}</ul>` : ''}
                                   <div class="compare-map-btn"><i class="fa-solid fa-map-location-dot"></i> 지도 보기</div>
                               </a>`).join('')}
                           </div>`
                        : `<div class="options-toggle" onclick="var p=document.getElementById('opts-${ev.id}');var open=p.style.display==='block';p.style.display=open?'none':'block';this.querySelector('.opts-arrow').style.transform=open?'':'rotate(180deg)';">
                               <i class="fa-solid fa-utensils"></i> 식당 선택지 ${ev.options.length}곳
                               <i class="fa-solid fa-chevron-down opts-arrow"></i>
                           </div>
                           <div class="options-panel" id="opts-${ev.id}" style="display:none;">
                               ${ev.options.map(o => `<a href="${o.mapUrl}" target="_blank" rel="noopener" class="option-item">
                                   <div class="option-info"><div class="option-name">${o.name}</div><div class="option-desc">${o.desc || ''}</div></div>
                                   <i class="fa-solid fa-map-location-dot" style="color:var(--accent-color);flex-shrink:0;"></i>
                               </a>`).join('')}
                           </div>`
                    : '';
                block = `<div class="timeline-item fade-up" style="animation-delay:${index*0.1}s">
                    <div class="time">${ev.time}</div>
                    <div class="timeline-content">
                        <div class="timeline-icon"><i class="fa-solid ${ev.icon}"></i></div>
                        <h4>${ev.title} ${mapBtn}</h4>
                        <p>${ev.desc}</p>
                        ${optionsHTML}
                        ${tipsHTML}
                    </div></div>`;
            }
            if (!isScheduleEditing && index === imageInsertAfter && dayData.mapImage) {
                block += `<div class="banner-box fade-up" style="margin:5px 0 20px;animation-delay:${(index+0.5)*0.1}s">
                    <div class="tape"></div>
                    <div class="route-map-toggle" onclick="var img=this.nextElementSibling;var open=img.style.display!=='none';img.style.display=open?'none':'block';this.querySelector('.route-map-arrow').style.transform=open?'rotate(-90deg)':'';">
                        📌 Day ${dayData.day} 작전 이동 루트
                        <i class="fa-solid fa-chevron-down route-map-arrow"></i>
                    </div>
                    <img src="${dayData.mapImage}" alt="Day ${dayData.day} 작전 지도" class="banner-img" style="display:block;">
                </div>`;
            }
            return block;
        }).join('');
    }

    window.toggleTipsEdit = (evId) => {
        const list = document.getElementById(`tips-list-${evId}`);
        const area = document.getElementById(`tips-edit-${evId}`);
        const saveBtn = document.getElementById(`tips-save-${evId}`);
        const editing = area.style.display === 'block';
        list.style.display = editing ? 'block' : 'none';
        area.style.display = editing ? 'none' : 'block';
        saveBtn.style.display = editing ? 'none' : 'block';
    };

    window.saveTips = (evId, day) => {
        const area = document.getElementById(`tips-edit-${evId}`);
        const dayData = tripData.schedule.find(d => d.day === day);
        const ev = dayData.events.find(e => e.id === evId);
        ev.tips = area.value.split('\n').map(s => s.trim()).filter(Boolean);
        saveLocalData();
        saveScheduleToServer(tripData.schedule);
        renderDay(day);
    };

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
                const tipsRaw = item.querySelector('[data-field="tips"]')?.value || '';
                ev.tips = tipsRaw.split('\n').map(s => s.trim()).filter(Boolean);
            });
            saveLocalData();
            saveScheduleToServer(tripData.schedule);
            isScheduleEditing = false;
            scheduleUnlocked = false;
            document.getElementById('schedule-lock-btn').innerHTML = '<i class="fa-solid fa-lock"></i>';
            editScheduleBtn.style.display = 'none';
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
        const myChar = getSelectedChar();
        const myId = myChar?.id;
        const container = document.getElementById('mission-list');
        container.innerHTML = defaultTripData.missions.map(m => {
            const sm = getMissionState(m.id);
            // 내 캐릭터 기준 상태
            const myCount = m.targetCount ? (sm.counts?.[myId] || 0) : 0;
            const isDone = m.targetCount ? myCount >= m.targetCount : (sm.completedBy || []).includes(myId);
            const completors = (sm.completedBy || []).map(cid => {
                const ch = defaultTripData.familyCharacters.find(c => c.id === cid);
                if (!ch) return '';
                return `<div title="${ch.name}" style="width:22px;height:22px;border:2px solid var(--border-color);overflow:hidden;background:var(--bg-color);flex-shrink:0;">
                    <img src="${ch.img}" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated;"
                         onerror="this.outerHTML='<span style=\\'font-size:0.9rem;\\'>${ch.icon}</span>'">
                </div>`;
            }).join('');
            const progressHTML = m.targetCount ? `<div style="font-size:0.75rem;margin-top:5px;color:var(--text-secondary);font-weight:800;">내 진행: ${myCount}/${m.targetCount}</div>` : '';
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
        const m = defaultTripData.missions.find(x => x.id === id);
        const char = getSelectedChar();
        if (!char) { showCharSelect(); return; }
        const sm = getMissionState(id);

        let action;
        if (m.targetCount) {
            const myCount = sm.counts?.[char.id] || 0;
            action = myCount >= m.targetCount ? 'reset' : 'increment';
        } else {
            action = 'toggle';
        }

        const result = await postMissionComplete(id, char.id, action);
        if (!result) {
            // Offline fallback
            if (!serverState.missions) serverState.missions = {};
            if (!serverState.missions[id]) serverState.missions[id] = { completedBy: [], counts: {}, done: false };
            const ssm = serverState.missions[id];
            if (!ssm.counts) ssm.counts = {};
            if (action === 'reset') { ssm.completedBy = ssm.completedBy.filter(c=>c!==char.id); ssm.counts[char.id] = 0; }
            else if (action === 'increment') { ssm.counts[char.id] = (ssm.counts[char.id]||0)+1; if (!ssm.completedBy.includes(char.id)) ssm.completedBy.push(char.id); }
            else { if (ssm.completedBy.includes(char.id)) ssm.completedBy = ssm.completedBy.filter(c=>c!==char.id); else ssm.completedBy.push(char.id); }
            ssm.done = ssm.completedBy.length > 0;
        }

        const finalState = getMissionState(id);
        const myCount = m.targetCount ? (finalState.counts?.[char.id] || 0) : 0;
        const isDone = m.targetCount ? myCount >= m.targetCount : (finalState.completedBy || []).includes(char.id);
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
        grid.innerHTML = photos.map((p, i) => {
            const ch = defaultTripData.familyCharacters.find(c => c.id === p.charId);
            return `<div class="polaroid-frame" style="position:relative;">
                <div class="polaroid-tape"></div>
                <img src="${p.url}" onclick="openLightbox(${i})" style="width:100%;display:block;object-fit:cover;aspect-ratio:1/1;border:2px solid var(--border-color);cursor:pointer;">
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
        // category별 그룹화
        const groups = {};
        const catOrder = [];
        tripData.checklist.forEach(c => {
            const cat = c.category || '기타';
            if (!groups[cat]) { groups[cat] = []; catOrder.push(cat); }
            groups[cat].push(c);
        });
        container.innerHTML = catOrder.map(cat => {
            const items = groups[cat];
            const doneCount = items.filter(c => c.done).length;
            const allDone = doneCount === items.length;
            const catId = 'cg-' + cat.replace(/[\s·]/g, '-');
            return `<div class="checklist-group">
                <div class="checklist-group-header ${allDone ? 'all-done' : ''}" onclick="toggleChecklistGroup('${catId}')">
                    <span><i class="fa-solid fa-box-open" style="margin-right:6px;font-size:0.8rem;"></i>${cat}</span>
                    <span style="display:flex;align-items:center;gap:8px;">
                        <span class="cg-progress">${doneCount}/${items.length}</span>
                        <i class="fa-solid fa-chevron-down cg-arrow"></i>
                    </span>
                </div>
                <div class="checklist-group-items" id="${catId}">
                    ${items.map(c => `
                    <div class="list-item ${c.done?'completed':''}" data-id="${c.id}" style="padding:10px 15px;display:flex;align-items:center;gap:8px;">
                        <div onclick="toggleChecklist('${c.id}')" style="display:flex;align-items:center;flex:1;min-width:0;cursor:pointer;gap:12px;">
                            <div class="list-status"><i class="fa-${c.done?'solid fa-square-check':'regular fa-square'}"></i></div>
                            <div class="list-info" style="flex:1;min-width:0;"><h4 style="margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.title}</h4></div>
                        </div>
                        <div style="display:flex;gap:4px;flex-shrink:0;">
                            <button onclick="editChecklistItem('${c.id}')" style="background:none;border:1px solid var(--border-color);padding:4px 7px;cursor:pointer;font-size:0.75rem;color:var(--text-secondary);"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="deleteChecklistItem('${c.id}')" style="background:none;border:1px solid var(--border-color);padding:4px 7px;cursor:pointer;font-size:0.75rem;color:#94a3b8;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>`).join('')}
                </div>
            </div>`;
        }).join('');
    }

    window.toggleChecklistGroup = (catId) => {
        const el = document.getElementById(catId);
        const header = el.previousElementSibling;
        const arrow = header.querySelector('.cg-arrow');
        const isOpen = el.style.display !== 'none';
        el.style.display = isOpen ? 'none' : '';
        if (arrow) arrow.style.transform = isOpen ? 'rotate(-90deg)' : '';
    };

    window.toggleChecklist = (id) => {
        const c = tripData.checklist.find(x => x.id === id);
        c.done = !c.done;
        saveLocalData();
        saveChecklistToServer(tripData.checklist);
        renderChecklist();
    };

    window.addChecklistItem = () => {
        // 기존 카테고리 목록 수집
        const cats = [...new Set(tripData.checklist.map(c => c.category || '기타'))];
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9000;display:flex;align-items:flex-end;';
        overlay.innerHTML = `
            <div style="width:100%;background:var(--card-bg);border-top:3px solid var(--border-color);padding:16px;max-height:70vh;overflow-y:auto;">
                <div style="font-size:0.85rem;font-weight:900;margin-bottom:12px;">📦 카테고리 선택</div>
                ${cats.map(cat => `
                    <div class="cat-pick-item" onclick="window._pickCat('${cat.replace(/'/g,"\\'")}',this.parentElement.parentElement)"
                         style="padding:11px 14px;border:1.5px solid var(--border-color);margin-bottom:6px;cursor:pointer;font-size:0.82rem;font-weight:800;">
                        ${cat}
                    </div>`).join('')}
                <div class="cat-pick-item" onclick="window._pickCat('기타',this.parentElement.parentElement)"
                     style="padding:11px 14px;border:1.5px dashed var(--border-color);margin-bottom:6px;cursor:pointer;font-size:0.82rem;font-weight:800;color:var(--text-secondary);">
                    + 기타
                </div>
                <button onclick="this.closest('[style*=fixed]').remove()" style="width:100%;margin-top:4px;padding:10px;background:none;border:1.5px solid var(--border-color);font-size:0.8rem;font-weight:900;cursor:pointer;">취소</button>
            </div>`;
        document.body.appendChild(overlay);
    };

    window._pickCat = (category, overlay) => {
        overlay.remove();
        const newId = 'c' + Date.now();
        tripData.checklist.push({ id: newId, title: '새 항목', done: false, category });
        saveLocalData();
        saveChecklistToServer(tripData.checklist);
        renderChecklist();
        editChecklistItem(newId);
    };

    window.editChecklistItem = (id) => {
        const itemEl = document.querySelector(`[data-id="${id}"] h4`);
        if (!itemEl) return;
        const c = tripData.checklist.find(x => x.id === id);
        const input = document.createElement('input');
        input.type = 'text';
        input.value = c.title;
        input.style.cssText = 'width:100%;border:1px solid var(--border-color);padding:2px 6px;background:var(--bg-color);color:var(--text-primary);font-size:0.9rem;font-weight:700;font-family:inherit;outline:none;';
        const save = () => { c.title = input.value.trim() || c.title; saveLocalData(); saveChecklistToServer(tripData.checklist); renderChecklist(); };
        input.addEventListener('blur', save);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
        itemEl.replaceWith(input);
        input.focus();
        input.select();
    };

    window.deleteChecklistItem = (id) => {
        if (!confirm('항목을 삭제할까요?')) return;
        tripData.checklist = tripData.checklist.filter(x => x.id !== id);
        saveLocalData();
        saveChecklistToServer(tripData.checklist);
        renderChecklist();
    };

    // ─── 라이트박스 ──────────────────────────────────────────────────────────
    let lbIndex = 0;
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const lbCaption = document.getElementById('lb-caption');

    window.openLightbox = (index) => {
        const photos = serverState.photos || [];
        lbIndex = index;
        lbImg.src = photos[lbIndex].url;
        const ch = defaultTripData.familyCharacters.find(c => c.id === photos[lbIndex].charId);
        lbCaption.innerHTML = ch ? `<img src="${ch.img}" style="width:26px;height:26px;object-fit:cover;border:2px solid #fff;border-radius:50%;vertical-align:middle;margin-right:6px;" onerror="this.outerHTML='${ch.icon}'"><span style="vertical-align:middle;">${ch.name}</span>` : '';
        lb.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = () => {
        lb.style.display = 'none';
        document.body.style.overflow = '';
        lbImg.src = '';
    };

    window.lbNav = (dir) => {
        const photos = serverState.photos || [];
        lbIndex = (lbIndex + dir + photos.length) % photos.length;
        lbImg.src = photos[lbIndex].url;
        const ch = defaultTripData.familyCharacters.find(c => c.id === photos[lbIndex].charId);
        lbCaption.innerHTML = ch ? `<img src="${ch.img}" style="width:26px;height:26px;object-fit:cover;border:2px solid #fff;border-radius:50%;vertical-align:middle;margin-right:6px;" onerror="this.outerHTML='${ch.icon}'"><span style="vertical-align:middle;">${ch.name}</span>` : '';
    };

    // 스와이프 감지
    let lbTouchX = 0;
    lb.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - lbTouchX;
        if (Math.abs(dx) > 40) lbNav(dx < 0 ? 1 : -1);
    });

    document.addEventListener('keydown', e => {
        if (lb.style.display !== 'flex') return;
        if (e.key === 'ArrowRight') lbNav(1);
        if (e.key === 'ArrowLeft') lbNav(-1);
        if (e.key === 'Escape') closeLightbox();
    });

    // ─── 환율 계산기 ─────────────────────────────────────────────────────────
    let twdToKrw = null;

    async function fetchExchangeRate() {
        try {
            const res = await fetch('https://open.er-api.com/v6/latest/TWD');
            const data = await res.json();
            twdToKrw = data.rates.KRW;
            const updated = data.time_last_update_utc
                ? new Date(data.time_last_update_utc).toLocaleDateString('ko-KR')
                : '';
            document.getElementById('exchange-rate-info').textContent =
                `1 TWD ≈ ${twdToKrw.toFixed(1)} KRW  (${updated} 기준)`;
        } catch (e) {
            document.getElementById('exchange-rate-info').textContent = '환율 로딩 실패 (오프라인 상태)';
        }
    }

    const fmt = n => n.toLocaleString('ko-KR');
    const unformat = s => parseFloat(String(s).replace(/,/g, ''));

    window.calcFromTWD = () => {
        if (!twdToKrw) return;
        const twd = unformat(document.getElementById('twd-input').value);
        document.getElementById('krw-input').value = isNaN(twd) ? '' : fmt(Math.round(twd * twdToKrw));
    };
    window.calcFromKRW = () => {
        if (!twdToKrw) return;
        const krw = unformat(document.getElementById('krw-input').value);
        document.getElementById('twd-input').value = isNaN(krw) ? '' : fmt(Math.round(krw / twdToKrw));
    };

    document.getElementById('twd-input').addEventListener('input', window.calcFromTWD);
    document.getElementById('krw-input').addEventListener('input', window.calcFromKRW);
    fetchExchangeRate();

    // ─── 갤러리 서브탭 ────────────────────────────────────────────────────────
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.gtab;
            document.getElementById('gtab-photos').style.display = tab === 'photos' ? '' : 'none';
            document.getElementById('gtab-bulletin').style.display = tab === 'bulletin' ? '' : 'none';
            if (tab === 'bulletin') initBulletinTab();
        });
    });

    // ─── 불레틴 보드 ──────────────────────────────────────────────────────────
    let bulletinMap = null;
    let bulletinMarkers = [];
    let bulletins = [];
    let pendingGPS = null;
    let bulletinTabInited = false;

    async function initBulletinTab() {
        if (!bulletinTabInited) {
            bulletinTabInited = true;
            bulletinMap = L.map('bulletin-map').setView([25.0330, 121.5654], 11);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            }).addTo(bulletinMap);
        }
        await loadBulletins();
    }

    async function loadBulletins() {
        try {
            const res = await fetch(`${API_BASE}/api/bulletins`);
            bulletins = await res.json();
            renderBulletins();
            updateMapMarkers();
        } catch (e) {
            console.warn('불레틴 로딩 실패:', e.message);
        }
    }

    function updateMapMarkers() {
        bulletinMarkers.forEach(m => bulletinMap.removeLayer(m));
        bulletinMarkers = [];
        const withGPS = bulletins.filter(b => b.lat && b.lng);
        withGPS.forEach(b => {
            const char = defaultTripData.familyCharacters.find(c => c.id === b.charId);
            const markerHtml = char?.img
                ? `<img src="${char.img}" style="width:32px;height:32px;object-fit:cover;border:2px solid #334155;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4);">`
                : `<div style="font-size:22px;line-height:1;">${char?.icon || '📍'}</div>`;
            const icon = L.divIcon({
                html: markerHtml,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -16]
            });
            const preview = b.text.length > 50 ? b.text.slice(0, 50) + '…' : b.text;
            const marker = L.marker([b.lat, b.lng], { icon })
                .bindPopup(`<b>${char?.icon || ''} ${b.charName}</b><br><span style="font-size:0.8em;">${preview}</span>`)
                .addTo(bulletinMap);
            bulletinMarkers.push(marker);
        });
        if (bulletinMarkers.length > 0) {
            bulletinMap.fitBounds(L.featureGroup(bulletinMarkers).getBounds().pad(0.3));
        }
    }

    function renderBulletins() {
        const container = document.getElementById('bulletin-list');
        if (bulletins.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:30px 0;color:var(--text-secondary);font-weight:700;font-size:0.85rem;">📝 아직 후기가 없습니다<br><span style="font-size:0.75rem;">첫 번째 여행 후기를 남겨보세요!</span></div>`;
            return;
        }
        container.innerHTML = bulletins.map(b => {
            const char = defaultTripData.familyCharacters.find(c => c.id === b.charId);
            const date = new Date(b.timestamp).toLocaleDateString('ko-KR', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
            const locBadge = b.lat
                ? `<span class="bulletin-loc"><i class="fa-solid fa-location-dot"></i> ${b.locationLabel || '위치 첨부됨'}</span>`
                : '';
            const isMe = getSelectedChar()?.id === b.charId;
            return `<div class="bulletin-card">
                <div class="bulletin-header">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div class="bulletin-avatar">${char?.img ? `<img src="${char.img}" onerror="this.outerHTML='${char?.icon||'👤'}'">` : (char?.icon || '👤')}</div>
                        <div>
                            <div style="font-size:0.82rem;font-weight:800;">${b.charName}</div>
                            <div style="font-size:0.68rem;color:var(--text-secondary);">${date} ${locBadge}</div>
                        </div>
                    </div>
                    ${isMe ? `<button onclick="deleteBulletin('${b.id}')" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:0.8rem;"><i class="fa-solid fa-trash"></i></button>` : ''}
                </div>
                <p class="bulletin-text">${b.text.replace(/\n/g, '<br>')}</p>
            </div>`;
        }).join('');
    }

    window.attachGPS = async () => {
        const btn = document.getElementById('gps-btn');
        const status = document.getElementById('gps-status');
        btn.disabled = true;
        status.textContent = '위치 확인 중...';
        try {
            const pos = await new Promise((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
            );
            pendingGPS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            // 역지오코딩 (OpenStreetMap Nominatim)
            try {
                const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pendingGPS.lat}&lon=${pendingGPS.lng}&format=json`);
                const geo = await r.json();
                pendingGPS.locationLabel = geo.address?.city || geo.address?.town || geo.address?.county || '현재 위치';
            } catch { pendingGPS.locationLabel = '현재 위치'; }
            status.textContent = `📍 ${pendingGPS.locationLabel}`;
        } catch (e) {
            status.textContent = '위치 접근 실패';
            pendingGPS = null;
        }
        btn.disabled = false;
    };

    window.submitBulletin = async () => {
        const char = getSelectedChar();
        if (!char) { alert('요원을 먼저 선택하세요.'); return; }
        const text = document.getElementById('bulletin-text').value.trim();
        if (!text) { alert('내용을 입력하세요.'); return; }
        try {
            const body = { charId: char.id, charName: char.name, charIcon: char.icon, text, ...pendingGPS };
            const res = await fetch(`${API_BASE}/api/bulletin`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
            const saved = await res.json();
            bulletins.unshift(saved);
            document.getElementById('bulletin-text').value = '';
            pendingGPS = null;
            document.getElementById('gps-status').textContent = '';
            renderBulletins();
            updateMapMarkers();
        } catch (e) { alert('게시 실패: 서버 연결을 확인하세요.'); }
    };

    window.deleteBulletin = async (id) => {
        if (!confirm('이 후기를 삭제할까요?')) return;
        try {
            await fetch(`${API_BASE}/api/bulletin/${id}`, { method: 'DELETE' });
            bulletins = bulletins.filter(b => b.id !== id);
            renderBulletins();
            updateMapMarkers();
        } catch (e) { alert('삭제 실패.'); }
    };

    window.toggleGuideChapter = (id) => {
        const chapter = document.getElementById(id);
        const body = chapter.querySelector('.guide-chapter-body');
        const arrow = chapter.querySelector('.gc-arrow');
        const isOpen = body.style.display === 'block';
        body.style.display = isOpen ? 'none' : 'block';
        if (arrow) arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
    };
});
