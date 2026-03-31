// API base — automatically detect server origin
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '' // same origin (Express serves frontend)
    : ''; // when deployed, same origin too

const defaultTripData = {
    startDate: '2026-04-29T00:00:00',
    familyCharacters: [
        { id: 'char1', name: '재룡', icon: '👨🏻‍💼', img: 'avatar_jaeryong.png', hp: 100, mp: 80, type: 'human' },
        { id: 'char2', name: '월숙', icon: '👩🏻‍🦱', img: 'avatar_wolsuk.png', hp: 100, mp: 90, type: 'human' },
        { id: 'char3', name: '형석', icon: '👦🏻', img: 'avatar_hyeongseok.png', hp: 100, mp: 100, type: 'human' },
        { id: 'char4', name: '다솔', icon: '👧🏻', img: 'avatar_dasol.png', hp: 100, mp: 100, type: 'human' },
        { id: 'char5', name: '종찬', icon: '🕵🏻‍♂️', img: 'avatar_jongchan.png', hp: 100, mp: 100, type: 'human' },
        { id: 'char6', name: '애솔', icon: '👓', img: 'avatar_aesol.png', hp: 100, mp: 100, type: 'human' },
        { id: 'cat1', name: '아띠', icon: '🐈', img: 'avatar_addi.png', hp: 100, mp: 100, type: 'cat' },
        { id: 'cat2', name: '아망', icon: '🐈‍⬛', img: 'avatar_amang.png', hp: 100, mp: 100, type: 'cat' },
        { id: 'cat3', name: '아키', icon: '🐅', img: 'avatar_aki.png', hp: 100, mp: 100, type: 'cat' },
        { id: 'cat4', name: '아로', icon: '🐆', img: 'avatar_aro.png', hp: 100, mp: 100, type: 'cat' }
    ],
    schedule: [
        {
            day: 1, date: '4/29 (수)', mapImage: 'map_day1.jpg', events: [
                { id: 'e1-1', time: '06:00', title: '인천공항 모임', desc: '1터미널 출국장, 여권 필수 지참!', icon: 'fa-plane-departure', mapUrl: 'https://maps.google.com/?q=인천국제공항+1터미널' },
                { id: 'e1-2', time: '08:35', title: '대만으로 출발 ✈️', desc: '아시아나 OZ 0711', icon: 'fa-plane' },
                { id: 'e1-3', time: '10:10', title: '타이베이 타오위안 입국', desc: '도착 및 짐 찾기, 유심 세팅', icon: 'fa-passport', mapUrl: 'https://maps.google.com/?q=Taiwan+Taoyuan+International+Airport' },
                { id: 'e1-4', time: '12:00', title: '숙소 체크인', desc: 'Datong District 제임스 에어비앤비', icon: 'fa-bed', mapUrl: 'https://maps.google.com/?q=No.101,+Section+1,+Changan+W+Rd,+Datong+District,+Taipei' },
                { id: 'e1-5', time: '15:00', title: '국립고궁박물원', desc: '취옥백채(배추), 육형석(동파육) 구경', icon: 'fa-building-columns', mapUrl: 'https://maps.google.com/?q=National+Palace+Museum+Taipei' },
                { id: 'e1-6', time: '18:00', title: '융캉제 탐방', desc: '망고 빙수 & 저녁 식사', icon: 'fa-bowl-food', mapUrl: 'https://maps.google.com/?q=Yongkang+Street+Taipei' },
                { id: 'e1-7', time: '20:00', title: '타이베이 101 전망대', desc: '대만 야경 감상', icon: 'fa-city', mapUrl: 'https://maps.google.com/?q=Taipei+101' },
                { id: 'e1-8', time: '21:30', title: '린장제 야시장', desc: '야식 파티 및 발마사지', icon: 'fa-moon', mapUrl: 'https://maps.google.com/?q=Linjiang+Street+Night+Market+Taipei' }
            ]
        },
        {
            day: 2, date: '4/30 (목)', events: [
                { id: 'e2-1', time: '10:00', title: '예스진지 투어 시작', desc: '8시간 택시 프라이빗 투어', icon: 'fa-taxi' },
                { id: 'e2-2', time: '11:00', title: '예류지질공원', desc: '여왕머리 바위 인증샷', icon: 'fa-camera', mapUrl: 'https://maps.google.com/?q=Yehliu+Geopark+Taiwan' },
                { id: 'e2-3', time: '13:00', title: '스펀 (천등 날리기)', desc: '가족 소원 적고 천등 띄우기', icon: 'fa-fire', mapUrl: 'https://maps.google.com/?q=Shifen+Old+Street+Taiwan' },
                { id: 'e2-4', time: '15:00', title: '진과스 황금박물관', desc: '광부 도시락 식사', icon: 'fa-gem', mapUrl: 'https://maps.google.com/?q=Jinguashi+Gold+Museum+Taiwan' },
                { id: 'e2-5', time: '17:00', title: '지우펀', desc: '홍등거리 배경으로 인생샷', icon: 'fa-dungeon', mapUrl: 'https://maps.google.com/?q=Jiufen+Old+Street+Taiwan' },
                { id: 'e2-6', time: '19:00', title: '타이베이 복귀', desc: '휴식 및 자유일정', icon: 'fa-house' }
            ]
        },
        {
            day: 3, date: '5/1 (금)', events: [
                { id: 'e3-1', time: '10:00', title: '중정기념당', desc: '근위병 교대식 관람', icon: 'fa-users-line', mapUrl: 'https://maps.google.com/?q=Chiang+Kai-shek+Memorial+Hall+Taipei' },
                { id: 'e3-2', time: '12:00', title: '타이베이 식물원', desc: '여유로운 산책', icon: 'fa-leaf', mapUrl: 'https://maps.google.com/?q=Taipei+Botanical+Garden' },
                { id: 'e3-3', time: '13:30', title: '시먼딩 거리', desc: '점심식사 및 쇼핑 (대만의 명동)', icon: 'fa-bag-shopping', mapUrl: 'https://maps.google.com/?q=Ximending+Taipei' },
                { id: 'e3-4', time: '15:00', title: '마사지', desc: '여행 피로 싹 풀기', icon: 'fa-spa' },
                { id: 'e3-5', time: '17:00', title: '보피랴오 역사거리', desc: '옛 대만 거리 걷기', icon: 'fa-yin-yang', mapUrl: 'https://maps.google.com/?q=Bopiliao+Historic+Block+Taipei' },
                { id: 'e3-6', time: '18:30', title: '용산사', desc: '화려한 사원 구경 및 점괘 뽑기', icon: 'fa-gopuram', mapUrl: 'https://maps.google.com/?q=Longshan+Temple+Taipei' },
                { id: 'e3-7', time: '20:00', title: '까르푸 (Carrefour)', desc: '기념품 폭풍 쇼핑', icon: 'fa-cart-shopping', mapUrl: 'https://maps.google.com/?q=Carrefour+Zhonghe+Taipei' }
            ]
        },
        {
            day: 4, date: '5/2 (토)', events: [
                { id: 'e4-1', time: '08:00', title: '기상 및 체크아웃', desc: '짐 싸기 꼼꼼하게', icon: 'fa-suitcase' },
                { id: 'e4-2', time: '09:00', title: '공항으로 이동', desc: 'MRT 탑승', icon: 'fa-train-subway' },
                { id: 'e4-3', time: '10:00', title: '타오위안 공항 도착', desc: '수속 밟기', icon: 'fa-ticket', mapUrl: 'https://maps.google.com/?q=Taiwan+Taoyuan+International+Airport' },
                { id: 'e4-4', time: '12:25', title: '인천으로 비행기 탑승', desc: '아시아나 OZ 0712', icon: 'fa-plane' },
                { id: 'e4-5', time: '16:00', title: '인천 도착', desc: '무사 복귀 👏', icon: 'fa-house-chimney', mapUrl: 'https://maps.google.com/?q=인천국제공항' }
            ]
        }
    ],
    missions: [
        { id: 'm1', title: '🍧 1일 1빙수', desc: '매일 한 번씩 대만 빙수 먹기', icon: '😎', done: false, targetCount: 3, currentCount: 0 },
        { id: 'm2', title: '🧋 1일 1버블티', desc: '매일 쩐주나이차 마시기', icon: '😋', done: false, targetCount: 3, currentCount: 0 },
        { id: 'm3', title: '🍜 우육면 먹방', desc: '현지 우육면 먹고 사진 찍기', icon: '📸', done: false },
        { id: 'm4', title: '🥟 샤오롱바오', desc: '육즙 가득 샤오롱바오 사진 찰칵', icon: '📸', done: false },
        { id: 'm5', title: '🛵 타이베이 출근길', desc: '오토바이 출근 부대 사진 포착', icon: '📸', done: false },
        { id: 'm6', title: '🚌 로컬 버스 탑승', desc: '대만 버스와 함께 사진 남기기', icon: '📸', done: false },
        { id: 'm7', title: '👑 예류 여왕머리', desc: '단독 가족 사진 성공하기', icon: '📸', done: false },
        { id: 'm8', title: '🔥 소원 천등', desc: '스펀에서 천등 훨훨 날리기', icon: '📸', done: false },
        { id: 'm9', title: '⛩️ 최고의 점괘', desc: '용산사에서 대길(大吉) 뽑기', icon: '📸', done: false }
    ],
    checklist: [
        { id: 'c1', title: '여권 (유효기간 6개월 이상 필수)', done: false },
        { id: 'c2', title: '항공권 E-ticket', done: false },
        { id: 'c3', title: '에어비앤비 예약 폰 바탕화면 저장', done: false },
        { id: 'c4', title: '상비약 (멀미약/소화제/진통제)', done: false },
        { id: 'c5', title: '110v 돼지코 어댑터 2~3개', done: false },
        { id: 'c6', title: '보조배터리 (기내 반입 필수)', done: false },
        { id: 'c7', title: '가벼운 우산 겸 양산', done: false },
        { id: 'c8', title: '환전 봉투 (TWD)', done: false }
    ]
};

function loadLocalData() {
    const saved = localStorage.getItem('tripData');
    if (saved) return JSON.parse(saved);
    return JSON.parse(JSON.stringify(defaultTripData));
}

function saveLocalData() {
    localStorage.setItem('tripData', JSON.stringify(tripData));
}

// Character session
function getSelectedChar() {
    const id = localStorage.getItem('selectedCharId');
    if (!id) return null;
    return defaultTripData.familyCharacters.find(c => c.id === id) || null;
}

function setSelectedChar(charId) {
    localStorage.setItem('selectedCharId', charId);
}

let tripData = loadLocalData();
let serverState = { missions: {}, photos: [] };

async function fetchServerState() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${API_BASE}/api/state`, { signal: controller.signal });
        clearTimeout(timeout);
        serverState = await res.json();
        if (serverState.schedule) {
            tripData.schedule = serverState.schedule;
        } else {
            saveScheduleToServer(tripData.schedule);
        }
        if (serverState.checklist) {
            tripData.checklist = serverState.checklist;
        } else {
            saveChecklistToServer(tripData.checklist);
        }
    } catch (e) {
        console.warn('서버 연결 안됨, 로컬 상태만 사용:', e.message);
    }
}

async function saveScheduleToServer(schedule) {
    try {
        await fetch(`${API_BASE}/api/schedule`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schedule })
        });
    } catch (e) {
        console.warn('일정 서버 저장 실패:', e.message);
    }
}

async function saveChecklistToServer(checklist) {
    try {
        await fetch(`${API_BASE}/api/checklist`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checklist })
        });
    } catch (e) {
        console.warn('체크리스트 서버 저장 실패:', e.message);
    }
}

async function postMissionComplete(missionId, charId, action) {
    try {
        const res = await fetch(`${API_BASE}/api/mission/${missionId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ charId, action })
        });
        const data = await res.json();
        // Merge into serverState
        if (!serverState.missions) serverState.missions = {};
        serverState.missions[missionId] = data.mission;
        return data.mission;
    } catch (e) {
        console.warn('미션 서버 저장 실패:', e.message);
        return null;
    }
}
