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
        { id: 'dog1', name: '영미', icon: '🐕', img: 'avatar_youngmi.png', hp: 100, mp: 100, type: 'dog' },
        { id: 'cat1', name: '아띠', icon: '🐈', img: 'avatar_addi.png', hp: 100, mp: 100, type: 'cat' },
        { id: 'cat2', name: '아망', icon: '🐈‍⬛', img: 'avatar_amang.png', hp: 100, mp: 100, type: 'cat' },
        { id: 'cat3', name: '아키', icon: '🐅', img: 'avatar_aki.png', hp: 100, mp: 100, type: 'cat' },
        { id: 'cat4', name: '아로', icon: '🐆', img: 'avatar_aro.png', hp: 100, mp: 100, type: 'cat' }
    ],
    schedule: [
        {
            day: 1, date: '4/29 (수)', mapImage: 'map_day1.jpg', events: [
                { id: 'e1-1', time: '06:00', title: '인천공항 모임', desc: '1터미널 출국장, 여권 필수 지참!', icon: 'fa-plane-departure', mapUrl: 'https://maps.google.com/?q=인천국제공항+1터미널',
                    tips: ['체크인 카운터는 3시간 전 오픈, 최소 2시간 전 도착 권장', '수하물 제한: 기내 7kg + 위탁 23kg (초과 시 현장 비용 발생)', '보조배터리는 반드시 기내 반입 (위탁 불가)'] },
                { id: 'e1-2', time: '08:35', title: '대만으로 출발 ✈️', desc: '아시아나 OZ 0711', icon: 'fa-plane',
                    tips: ['비행시간 약 2시간 30분', '대만 시차: 한국보다 1시간 느림 (KST-1)'] },
                { id: 'e1-3', time: '10:10', title: '타이베이 타오위안 입국', desc: '도착 및 짐 찾기, 유심 세팅', icon: 'fa-passport', mapUrl: 'https://maps.google.com/?q=Taiwan+Taoyuan+International+Airport',
                    tips: ['입국 심사 후 수하물 찾고, 도착장 나오기 전에 유심 구매 (공항 내 편의점/통신사 부스)', '이지카드(Easy Card)는 MRT역 개찰구 옆 자판기에서 구매 (NT$100, 보증금 NT$50 포함)', 'MRT 타오위안 → 타이베이 메인역: 약 35분, NT$160'] },
                { id: 'e1-4', time: '12:00', title: '숙소 체크인', desc: 'Datong District 제임스 에어비앤비', icon: 'fa-bed', mapUrl: 'https://maps.google.com/?q=No.101,+Section+1,+Changan+W+Rd,+Datong+District,+Taipei',
                    tips: ['체크인 전 짐을 맡길 수 있는지 사전 확인', '근처 편의점(7-11, 全家)에서 생필품 구매 가능', '전압 110V — 한국 기기는 돼지코 어댑터 필요'] },
                { id: 'e1-5', time: '15:00', title: '국립고궁박물원', desc: '취옥백채(배추), 육형석(동파육) 구경', icon: 'fa-building-columns', mapUrl: 'https://maps.google.com/?q=National+Palace+Museum+Taipei',
                    tips: ['입장료: 성인 NT$350 (한국어 오디오가이드 별도 NT$150)', '오전이 가장 한산 — 오후 2시 이후 혼잡', '취옥백채·육형석은 1층 전시실, 한국어 안내 팻말 따라가기', '관내 일부 구역 사진 촬영 금지 (플래시 절대 안 됨)', '기념품샵에서 취옥백채 미니어처 굿즈 인기'] },
                { id: 'e1-6', time: '18:00', title: '융캉제 탐방', desc: '망고 빙수 & 저녁 식사', icon: 'fa-bowl-food', mapUrl: 'https://maps.google.com/?q=Yongkang+Street+Taipei',
                    tips: ['아이스몬스터(Ice Monster) 망고빙수 NT$200 내외 — 줄 길면 근처 Ice Land도 추천', '딘타이펑(Din Tai Fung) 본점 근처 있음 — 대기 1~2시간 각오, 1호점 대신 지점도 OK', '거리 양쪽으로 카페·빵집 많으니 천천히 둘러보기', '현금 결제만 받는 곳 있으니 TWD 준비'] },
                { id: 'e1-7', time: '20:00', title: '타이베이 101 전망대', desc: '대만 야경 감상', icon: 'fa-city', mapUrl: 'https://maps.google.com/?q=Taipei+101',
                    tips: ['전망대 입장료: 성인 NT$600 (온라인 예매 시 할인 있음)', '89층 실내 + 91층 야외 전망대 — 날씨 맑은 날 야외 추천', '엘리베이터 속도 세계 최고 수준 (37초에 89층)', '기념품샵 지하에 딘타이펑 지점 있음'] },
                { id: 'e1-8', time: '21:30', title: '린장제 야시장', desc: '야식 파티 및 발마사지', icon: 'fa-moon', mapUrl: 'https://maps.google.com/?q=Linjiang+Street+Night+Market+Taipei',
                    tips: ['규모 작고 현지인 위주 — 덜 관광지스럽고 가격 저렴', '닭꼬치, 굴전(蚵仔煎), 타피오카 등 야시장 먹거리', '발마사지는 1시간 NT$500~700 내외, 흥정 가능', '현금 위주 결제'] }
            ]
        },
        {
            day: 2, date: '4/30 (목)', events: [
                { id: 'e2-1', time: '10:00', title: '예스진지 투어 시작', desc: '8시간 택시 프라이빗 투어', icon: 'fa-taxi',
                    tips: ['기사님이 각 명소 앞에서 기다려줌 — 시간 배분 조율 가능', '예류→스펀→진과스→지우펀 순서 추천 (교통 최적)', '이동 중 간식 챙겨두면 좋음 (스펀 구간 식사 시간 부족할 수 있음)'] },
                { id: 'e2-2', time: '11:00', title: '예류지질공원', desc: '여왕머리 바위 인증샷', icon: 'fa-camera', mapUrl: 'https://maps.google.com/?q=Yehliu+Geopark+Taiwan',
                    tips: ['입장료: 성인 NT$80', '여왕머리 바위 사진: 대기줄 있음, 이른 오전이 짧음', '바닥이 미끄럽고 요철 많음 — 운동화 필수, 슬리퍼 위험', '바람 강하고 햇빛 강렬 — 모자/선크림 필수', '반시계 방향으로 돌면 동선 효율적'] },
                { id: 'e2-3', time: '13:00', title: '스펀 (천등 날리기)', desc: '가족 소원 적고 천등 띄우기', icon: 'fa-fire', mapUrl: 'https://maps.google.com/?q=Shifen+Old+Street+Taiwan',
                    tips: ['천등 가격: 1색 NT$150, 4색 NT$200 — 4색 추천 (각 면에 소원 적을 수 있음)', '붓펜 제공됨 — 한국어로 써도 OK', '철도 위에서 날리므로 기차 올 때 점원 지시에 따라 비켜야 함', '날리는 사진/영상은 점원이 찍어줌 (팁 주면 더 친절)', '스펀 폭포(十分瀑布) — 도보 20분, 여유 있으면 들를 것'] },
                { id: 'e2-4', time: '15:00', title: '진과스 황금박물관', desc: '광부 도시락 식사', icon: 'fa-gem', mapUrl: 'https://maps.google.com/?q=Jinguashi+Gold+Museum+Taiwan',
                    tips: ['입장료: 성인 NT$80', '광부 도시락 세트 (NT$100 내외) — 고구마밥·된장국·채소 반찬, 맛보다 체험에 의미', '황금 금괴 만져보기 체험 (전시관 내부, 무료)', '언덕 경사 있으니 편한 신발 필수'] },
                { id: 'e2-5', time: '17:00', title: '지우펀', desc: '홍등거리 배경으로 인생샷', icon: 'fa-dungeon', mapUrl: 'https://maps.google.com/?q=Jiufen+Old+Street+Taiwan',
                    tips: ['홍등 켜지는 일몰 전후 (17~18시)가 가장 예쁜 사진 타이밍', '아메이 찻집(阿妹茶樓) 앞 계단 — 인증샷 명소, 대기 있음', '좁은 골목길에 사람 많음 — 소지품 주의, 아이들 손 꼭 잡기', '길 중간중간 타로(芋圓), 어묵, 생강탕 등 먹거리', '계단 많음 — 무릎 불편한 분은 위쪽 입구에서 하산 방향 추천'] },
                { id: 'e2-6', time: '19:00', title: '타이베이 복귀', desc: '휴식 및 자유일정', icon: 'fa-house' }
            ]
        },
        {
            day: 3, date: '5/1 (금)', events: [
                { id: 'e3-1', time: '10:00', title: '중정기념당', desc: '근위병 교대식 관람', icon: 'fa-users-line', mapUrl: 'https://maps.google.com/?q=Chiang+Kai-shek+Memorial+Hall+Taipei',
                    tips: ['근위병 교대식: 매 정시 (10시, 11시…), 10분 전에 도착해야 좋은 자리', '입장 무료, 내부 전시관도 무료', '광장이 넓고 햇빛 강함 — 모자·선크림 필수', '양쪽 자유광장 문(自由廣場門) 사진도 놓치지 말 것'] },
                { id: 'e3-2', time: '12:00', title: '타이베이 식물원', desc: '여유로운 산책', icon: 'fa-leaf', mapUrl: 'https://maps.google.com/?q=Taipei+Botanical+Garden',
                    tips: ['입장 무료, 연중 개방', '연꽃 연못(荷花池) — 여름엔 만개, 5월에도 피어있을 수 있음', '그늘 많아서 산책하기 좋음, 벤치에서 잠시 쉬기 OK'] },
                { id: 'e3-3', time: '13:30', title: '시먼딩 거리', desc: '점심식사 및 쇼핑 (대만의 명동)', icon: 'fa-bag-shopping', mapUrl: 'https://maps.google.com/?q=Ximending+Taipei',
                    tips: ['MRT 시먼역(西門站) 6번 출구 바로 연결', '아종면선(阿宗麵線): 줄 서서 먹는 굴면 국수, NT$60~70, 서서 먹는 게 정통', '정위차이(鄭記蔥花捲): 파전병, NT$25', '신발·옷·K-pop 굿즈 가게 많음, 흥정 가능한 곳 있음', '카드 결제 안 되는 식당 많으니 현금 필수'] },
                { id: 'e3-4', time: '15:00', title: '마사지', desc: '여행 피로 싹 풀기', icon: 'fa-spa',
                    tips: ['발 반사 마사지 1시간 NT$500~800 내외', '시먼딩 주변 또는 용산사 주변에 마사지 샵 많음', '한국어 안내 가능한 곳도 있음 — 구글 리뷰 확인 추천'] },
                { id: 'e3-5', time: '17:00', title: '보피랴오 역사거리', desc: '옛 대만 거리 걷기', icon: 'fa-yin-yang', mapUrl: 'https://maps.google.com/?q=Bopiliao+Historic+Block+Taipei',
                    tips: ['입장 무료', '용산사에서 도보 5분 거리', '청나라~일제강점기 건물 보존 구역, 인생샷 배경으로 인기', '카페·소품샵 들어서 있어 구경하기 좋음'] },
                { id: 'e3-6', time: '18:30', title: '용산사', desc: '화려한 사원 구경 및 점괘 뽑기', icon: 'fa-gopuram', mapUrl: 'https://maps.google.com/?q=Longshan+Temple+Taipei',
                    tips: ['입장 무료, 24시간 개방 (저녁 시간대가 더 화려함)', '점괘 뽑기(擲筊): 반달 모양 나무 2개 던져 신의 허락 받고 → 번호 뽑기 → 해석지 찾기', '향 제공됨 (무료), 기도 예절 지켜 조용히 참여', '사원 정문 사진 — 삼각대 없어도 야경 잘 나옴'] },
                { id: 'e3-7', time: '20:00', title: '까르푸 (Carrefour)', desc: '기념품 폭풍 쇼핑', icon: 'fa-cart-shopping', mapUrl: 'https://maps.google.com/?q=Carrefour+Zhonghe+Taipei',
                    tips: ['봉지 과자·파인애플 케이크·펑리수·누가 크래커 대량 구매 추천', '파인애플 케이크(鳳梨酥): 낱개 NT$20~30 (낱개 구매가 가성비)', '누가 크래커: 봉지 단위로 저렴, 2~3봉 추천', '롤리팝(수탉사탕), 태양병(太陽餅) 등도 인기', '계산 전 영수증 확인, 멤버십 카드 없어도 일반 결제 OK'] }
            ]
        },
        {
            day: 4, date: '5/2 (토)', events: [
                { id: 'e4-1', time: '08:00', title: '기상 및 체크아웃', desc: '짐 싸기 꼼꼼하게', icon: 'fa-suitcase',
                    tips: ['전압 어댑터, 충전기, 욕실 용품 빠트리지 않도록 체크', '에어비앤비 후기 미리 작성해두면 좋음', '남은 TWD — 공항 면세점에서 쓰거나, 환전 가능'] },
                { id: 'e4-2', time: '09:00', title: '공항으로 이동', desc: 'MRT 탑승', icon: 'fa-train-subway',
                    tips: ['타이베이 메인역(台北車站) → 타오위안 공항: MRT 공항선 약 35분, NT$160', '캐리어 있으면 엘리베이터 이용 (에스컬레이터 협소)', '공항 도착 후 체크인까지 최소 2시간 여유'] },
                { id: 'e4-3', time: '10:00', title: '타오위안 공항 도착', desc: '수속 밟기', icon: 'fa-ticket', mapUrl: 'https://maps.google.com/?q=Taiwan+Taoyuan+International+Airport',
                    tips: ['아시아나 체크인 카운터 위치 확인 후 이동', '이지카드 잔액은 공항 MRT 자판기에서 환불 가능 (보증금 NT$50 포함)', '면세 구역 내 마지막 쇼핑 & 환전 가능'] },
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
