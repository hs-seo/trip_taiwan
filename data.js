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
                { id: 'e1-1', time: '04:30', title: '수원 출발 🚗', desc: '수원 → 인천공항 (약 1시간 30분)', icon: 'fa-car',
                  tips: ['공항 샌딩 서비스 이용 (55,000원)', '아시아나 체크인: 제2터미널 국제선 F 카운터', '탑승수속 마감 6시 20분 — 3시간 전 도착 권장'] },
                { id: 'e1-2', time: '06:00', title: '인천공항 도착 · 아침식사', desc: '제2터미널 식사 후 수속 준비', icon: 'fa-utensils',
                  mapUrl: 'https://maps.google.com/?q=인천국제공항+제2터미널',
                  tips: ['여권·항공권 미리 준비', '체크인 카운터 오픈 시간 확인 후 식사'] },
                { id: 'e1-3', time: '07:00', title: '체크인 · 수속', desc: '아시아나 OZ 0711 탑승 수속', icon: 'fa-ticket',
                  mapUrl: 'https://maps.google.com/?q=인천국제공항+제2터미널',
                  tips: ['수하물: 기내 10kg + 위탁 23kg (1개)', '보조배터리는 기내 반입 필수 (위탁 불가)', '탑승구: 출발 50분 전 마감'] },
                { id: 'e1-4', time: '08:35', title: '대만으로 출발 ✈️', desc: '아시아나 OZ 0711 · 예약번호 EOCJMS', icon: 'fa-plane',
                  tips: ['비행시간 약 2시간 50분', '대만 시차: 한국보다 1시간 느림 (KST-1)', '기내식 제공'] },
                { id: 'e1-5', time: '10:25', title: '타오위안 도착 (현지시간)', desc: '입국 심사 · 짐 찾기 · 유심 세팅', icon: 'fa-passport',
                  mapUrl: 'https://maps.google.com/?q=Taiwan+Taoyuan+International+Airport',
                  tips: ['입국 심사 후 수하물 찾기', '도착장 나오기 전 유심 구매 (공항 부스)', '공항 동선: https://blog.naver.com/sm11ej/223825758432'] },
                { id: 'e1-6', time: '11:30', title: '숙소로 이동', desc: '타오위안 공항 → 숙소 (약 45분)', icon: 'fa-car',
                  mapUrl: 'https://maps.google.com/?q=25.049583,121.518444',
                  tips: ['체크인은 오후 5시 — 도착 후 짐 먼저 맡기기', '주소: No.63, Huayin St, Datong District, Taipei 103', '예약금: 120,000원'] },
                { id: 'e1-8', time: '14:00', title: '국립고궁박물원', desc: '도슨트 투어 약 2시간 (13:45 사전 미팅)', icon: 'fa-building-columns',
                  mapUrl: 'https://maps.google.com/?q=National+Palace+Museum+Taipei',
                  tips: ['택시 이동 (8.8km)', '입장료: 성인 NT$350 + 수신기 별도 구매', '사전 예약 필요 (114,000원)', '취옥백채·육형석은 1층 전시실', '관내 일부 구역 사진 촬영 금지'] },
                { id: 'e1-9', time: '16:30', title: '융캉제 탐방', desc: '망고빙수 · 에그타르트 · 버블티 탐방', icon: 'fa-ice-cream',
                  mapUrl: 'https://maps.google.com/?q=Yongkang+Street+Taipei',
                  tips: ['택시 이동 (10.8km)', '스무시하우스(망고빙수), 썬메리베이커리(에그타르트/찹쌀떡), 50란(버블티)'],
                  options: [
                    { name: '스무시하우스 (思慕昔)', desc: '망고빙수 명소 · 줄 서서 먹기', mapUrl: 'https://www.google.com/maps/search/思慕昔+永康街+台北' },
                    { name: '썬메리베이커리 (Sunny Mary)', desc: '에그타르트, 찹쌀떡', mapUrl: 'https://www.google.com/maps/search/Sunny+Mary+Bakery+永康街' },
                    { name: '50嵐 (오십람)', desc: '버블티 인기 체인', mapUrl: 'https://www.google.com/maps/search/50嵐+永康街+台北' }
                  ] },
                { id: 'e1-10', time: '18:30', title: '타이베이 101 전망대', desc: '89층 + 101층 전망대 야경', icon: 'fa-city',
                  mapUrl: 'https://maps.google.com/?q=Taipei+101',
                  tips: ['택시 이동 (5.0km)', '입장료: 성인 NT$600 (245,400원)', '매일 10:00~21:00 운영', '89층 실내 + 91층 야외 전망대'] },
                { id: 'e1-11', time: '20:30', title: '야시장 선택', desc: '두 야시장 중 그날 컨디션에 맞게 선택!', icon: 'fa-moon',
                  compare: true,
                  options: [
                    { name: '닝샤 야시장 🏆', desc: '현지인 추천 숨은 맛집 · 대만 전통 길거리 음식 집중', tag: '현지인 픽', mapUrl: 'https://maps.google.com/?q=Ningxia+Night+Market+Taipei',
                      highlights: ['굴전(蚵仔煎) 원조 맛집', '루러우판(滷肉飯) · 훠궈꼬치', '현금만 가능, 가격 저렴', '규모 아담 — 줄 짧고 쾌적'] },
                    { name: '린장제 야시장', desc: '101에서 도보 1.3km · 현지인 동네 야시장', tag: '접근성', mapUrl: 'https://maps.google.com/?q=Linjiang+Street+Night+Market+Taipei',
                      highlights: ['타이베이 101에서 도보 15분', '닭꼬치 · 굴전 · 타피오카', '규모 작고 덜 관광지스러움', '현금 위주 결제'] }
                  ] },
                { id: 'e1-12', time: '22:00', title: '숙소 복귀', desc: '1일차 임무 완료! 🎉', icon: 'fa-house' }
            ]
        },
        {
            day: 2, date: '4/30 (목)', events: [
                { id: 'e2-0', time: '10:00', title: '아침 · 점심 자유', desc: '투어 전 자유롭게 아점 & 카페', icon: 'fa-coffee',
                  tips: ['숙소 근처에서 가볍게 아점 해결', '투어 출발 전 화장실, 간식 준비'],
                  options: [
                    { name: '용허또우장 (永和豆漿)', desc: '두유·유조·김밥류 · 대만식 조식', mapUrl: 'https://www.google.com/maps/search/永和豆漿+台北' },
                    { name: '딘타이펑 (Din Tai Fung)', desc: '샤오롱바오 · 딤섬', mapUrl: 'https://www.google.com/maps/search/Din+Tai+Fung+Taipei' },
                    { name: 'Chia Te Bakery (佳德糕餅)', desc: '베이커리 · 펑리수', mapUrl: 'https://www.google.com/maps/search/Chia+Te+Bakery+台北' }
                  ] },
                { id: 'e2-1', time: '13:00', title: '예스폭지 투어 출발', desc: '한국어 가능 기사 · 택시 8시간 일일투어', icon: 'fa-taxi',
                  tips: ['예류 지질공원 → 스펀 → 황금 폭포 → 지우펀 코스', '예약: 332,900원 (입장료·식비 별도)', '주차비·기사 식비 포함', '가능하면 지우펀 야경 코스로 진행'] },
                { id: 'e2-2', time: '14:00', title: '예류지질공원', desc: '여왕머리 바위 인증샷', icon: 'fa-camera',
                  mapUrl: 'https://maps.google.com/?q=Yehliu+Geopark+Taiwan',
                  tips: ['입장료: 성인 NT$80', '여왕머리 바위 대기줄 — 이른 시간이 짧음', '바닥 미끄럽고 요철 많음 — 운동화 필수', '바람 강하고 햇빛 강렬 — 모자·선크림 필수'] },
                { id: 'e2-3', time: '15:30', title: '스펀 (천등 날리기)', desc: '가족 소원 적고 천등 띄우기', icon: 'fa-fire',
                  mapUrl: 'https://maps.google.com/?q=Shifen+Old+Street+Taiwan',
                  tips: ['천등: 1색 NT$150, 4색 NT$200 — 4색 추천', '철도 위에서 날리므로 기차 올 때 점원 지시 따르기', '황금 폭포(황금폭포) 근처 위치'] },
                { id: 'e2-4', time: '17:30', title: '지우펀 야경', desc: '홍등거리 · 인생샷 명소', icon: 'fa-dungeon',
                  mapUrl: 'https://maps.google.com/?q=Jiufen+Old+Street+Taiwan',
                  tips: ['홍등 켜지는 일몰 전후 (17~18시)가 포토 타이밍', '아메이 찻집(阿妹茶樓) 앞 계단 — 인증샷 명소', '좁은 골목 소지품 주의, 아이들 손 꼭 잡기', '타로(芋圓), 어묵, 생강탕 등 먹거리'] },
                { id: 'e2-5', time: '21:00', title: '숙소 복귀', desc: '2일차 임무 완료! 🕵️', icon: 'fa-house' }
            ]
        },
        {
            day: 3, date: '5/1 (금)', events: [
                { id: 'e3-0', time: '08:00', title: '아침식사 · 이동 준비', desc: '가볍게 준비 후 출발', icon: 'fa-sun' },
                { id: 'e3-1', time: '10:00', title: '중정기념당', desc: '근위병 교대식 관람 (매시 정각)', icon: 'fa-users-line',
                  mapUrl: 'https://maps.google.com/?q=Chiang+Kai-shek+Memorial+Hall+Taipei',
                  tips: ['주소: 21 Chung-Shan S Rd, Zhongzheng District', '입장 무료 · 매일 09:00~18:00', '근위병 교대식: 매 정시, 10분 전 도착 권장', '광장 햇빛 강함 — 모자·선크림 필수'] },
                { id: 'e3-2', time: '11:50', title: '타이베이 식물원', desc: '도보 이동 1.1km · 여유로운 산책', icon: 'fa-leaf',
                  mapUrl: 'https://maps.google.com/?q=Taipei+Botanical+Garden',
                  tips: ['주소: 53 Nanhai Rd, Zhongzheng District', '입장 무료 · 매일 05:30~20:00', '연꽃 연못(荷花池) — 5월에도 피어있을 수 있음', '그늘 많아 산책하기 좋음'] },
                { id: 'e3-3', time: '13:00', title: '점심 · 임가건면', desc: '건면국수 · 어환탕', icon: 'fa-bowl-food',
                  mapUrl: 'https://www.google.com/maps/search/林家乾麵+泉州街+台北',
                  tips: ['주소: No.11, Quanzhou St, Zhongzheng District', '영업: 06:00~14:00 / 16:30~19:30', '건면국수(乾麵)·어환탕(魚丸湯) 인기', '참고: https://blog.naver.com/pcy8501/224232720521'] },
                { id: 'e3-4', time: '14:30', title: '카페 자유', desc: '여유로운 카페 타임', icon: 'fa-coffee',
                  tips: ['우육면 블로그: https://blog.naver.com/waitme84/224228359705', '근처 카페에서 디저트 즐기기'] },
                { id: 'e3-5', time: '16:00', title: '발마사지 · 족체양생관', desc: '여행 피로 풀기 · 1시간', icon: 'fa-spa',
                  tips: ['발 반사 마사지 1시간 NT$500~800', '한국어 안내 가능한 곳도 있음 — 구글 리뷰 확인'] },
                { id: 'e3-6', time: '17:00', title: '시먼딩 탐방 · 저녁식사', desc: '쇼핑 · 먹거리 · 대만의 명동', icon: 'fa-bag-shopping',
                  mapUrl: 'https://maps.google.com/?q=Ximending+Taipei',
                  tips: ['MRT 시먼역(西門站) 6번 출구 바로 연결', '신발·옷·K-pop 굿즈 가게 많음', '카드 결제 안 되는 식당 많으니 현금 필수'],
                  options: [
                    { name: '아종면선 (阿宗麵線)', desc: '곱창국수 · 줄서서 먹는 명물 · NT$60~70', mapUrl: 'https://www.google.com/maps/search/阿宗麵線+西門' },
                    { name: '스위엔 옌수지 (帥哥鹹酥雞)', desc: '시먼딩 인기 튀김 맛집', mapUrl: 'https://www.google.com/maps/search/帥哥鹹酥雞+西門' },
                    { name: '진천미 (進千味)', desc: '한국인이 좋아하는 식당', mapUrl: 'https://www.google.com/maps/search/進千味+台北' },
                    { name: '삼미식당', desc: '대왕연어초밥', mapUrl: 'https://www.google.com/maps/search/삼미식당+台北+Taipei' }
                  ] },
                { id: 'e3-7', time: '19:00', title: '보피랴오 역사거리', desc: '청나라~일제강점기 건물 · 인생샷', icon: 'fa-yin-yang',
                  mapUrl: 'https://maps.google.com/?q=Bopiliao+Historic+Block+Taipei',
                  tips: ['입장 무료 · 09:00~21:00', '용산사에서 도보 5분', '카페·소품샵 구경하기 좋음'] },
                { id: 'e3-8', time: '19:30', title: '용산사', desc: '화려한 야간 사원 · 점괘 뽑기', icon: 'fa-gopuram',
                  mapUrl: 'https://maps.google.com/?q=Longshan+Temple+Taipei',
                  tips: ['입장 무료 · 24시간 개방 (저녁이 더 화려)', '점괘 뽑기(擲筊): 반달 나무 던지기 → 번호 → 해석지', '향 제공됨 — 기도 예절 지키기'] },
                { id: 'e3-9', time: '20:30', title: '까르푸 (Carrefour)', desc: '기념품 폭풍 쇼핑', icon: 'fa-cart-shopping',
                  mapUrl: 'https://maps.google.com/?q=Carrefour+Zhonghe+Taipei',
                  tips: ['파인애플 케이크(鳳梨酥) 대량 구매 추천 — NT$20~30/개', '누가 크래커 2~3봉 추천', '롤리팝(수탉사탕), 태양병(太陽餅) 등도 인기'] },
                { id: 'e3-10', time: '21:30', title: '숙소 복귀', desc: '3일차 임무 완료! 수고했어요 💪', icon: 'fa-house' }
            ]
        },
        {
            day: 4, date: '5/2 (토)', events: [
                { id: 'e4-1', time: '07:00', title: '기상 · 아침식사 · 체크아웃', desc: '편의점 or 야시장 음식으로 아침 해결', icon: 'fa-suitcase',
                  tips: ['전압 어댑터·충전기·욕실 용품 빠트리지 않도록 체크', '남은 TWD — 공항 면세점에서 쓰거나 환전 가능', '에어비앤비 후기 미리 작성 권장'] },
                { id: 'e4-2', time: '09:00', title: '공항으로 이동 (40km)', desc: '숙소 → 타오위안 공항', icon: 'fa-car',
                  tips: ['택시 이동 약 40~50분', '캐리어 있으면 넉넉히 시간 확보'] },
                { id: 'e4-3', time: '10:00', title: '타오위안 공항 도착', desc: '아시아나 OZ 0712 탑승 수속', icon: 'fa-ticket',
                  mapUrl: 'https://maps.google.com/?q=Taiwan+Taoyuan+International+Airport',
                  tips: ['수하물: 기내 10kg + 위탁 23kg (1개)', '이지카드 잔액 공항 MRT 자판기에서 환불 가능', '면세 구역 내 마지막 쇼핑'] },
                { id: 'e4-4', time: '12:25', title: '인천으로 비행기 탑승', desc: '아시아나 OZ 0712 · 예약번호 EOCJMS', icon: 'fa-plane',
                  tips: ['비행시간 약 2시간 35분', '대만 → 한국: +1시간 시차'] },
                { id: 'e4-5', time: '16:00', title: '인천 도착', desc: '무사 귀환! 대만 작전 완료 🎉', icon: 'fa-house-chimney',
                  mapUrl: 'https://maps.google.com/?q=인천국제공항' }
            ]
        }
    ],
    missions: [
        // ── 카운트 미션 ──────────────────────────────
        { id: 'm1',  title: '🍧 1일 1빙수',    desc: '3일 동안 매일 대만 빙수 1개씩 격파',            icon: '🍧', done: false, targetCount: 3, currentCount: 0 },
        { id: 'm2',  title: '🧋 1일 1버블티',  desc: '3일 동안 매일 쩐주나이차 1잔씩 섭취',          icon: '🧋', done: false, targetCount: 3, currentCount: 0 },
        { id: 'm10', title: '🏪 편의점 습격',  desc: '대만 편의점에서 현지 음식 3종 이상 구매',       icon: '🏪', done: false, targetCount: 3, currentCount: 0 },
        // ── 1일차 작전 ───────────────────────────────
        { id: 'm3',  title: '💎 취옥백채를 찾아라',   desc: '고궁박물원에서 옥 배추(翠玉白菜) 앞 인증샷 완료',          icon: '📷', done: false },
        { id: 'm11', title: '🗼 구름 위의 작전',      desc: 'Taipei 101 89층 전망대 정복 & 야경 인증',                   icon: '🌃', done: false },
        { id: 'm12', title: '🛵 스쿠터 군단 포착',    desc: '대만 출근길 오토바이 부대 사진 포착 성공',                  icon: '📷', done: false },
        // ── 2일차 작전 ───────────────────────────────
        { id: 'm7',  title: '👑 여왕 폐하께 경배',    desc: '예류 여왕머리 앞 가족 단체 사진 완성',                     icon: '📷', done: false },
        { id: 'm8',  title: '🔥 소원 천등 발사',      desc: '스펀 철길 위에서 소원 적은 천등 하늘로 날리기',            icon: '🏮', done: false },
        { id: 'm13', title: '🏮 지우펀 홍등 아래서',  desc: '지우펀 홍등거리 야경 배경으로 인생샷 촬영',                icon: '📷', done: false },
        // ── 3일차 작전 ───────────────────────────────
        { id: 'm14', title: '💂 교대식 목격 완료',    desc: '중정기념당 근위병 교대식 현장 영상 확보',                  icon: '📹', done: false },
        { id: 'm15', title: '🍜 선 채로 먹방 도전',   desc: '시먼딩 아종면선 서서 한 그릇 완식',                        icon: '🥢', done: false },
        { id: 'm16', title: '💆 다리야 수고했어',     desc: '족체양생관에서 발마사지 1시간 완료',                       icon: '🦶', done: false },
        { id: 'm9',  title: '🎋 점괘 대길 달성',      desc: '용산사에서 점괘 뽑기 도전, 대길(大吉) 번호 획득',          icon: '🔮', done: false },
        { id: 'm17', title: '🛍️ 까르푸 폭탄 쇼핑',   desc: '까르푸에서 기념품 5종 이상 장바구니에 담기',               icon: '🛒', done: false },
        // ── 보너스 작전 ──────────────────────────────
        { id: 'm18', title: '🌺 식물원 힐링 타임',    desc: '타이베이 식물원 연꽃 연못에서 인증샷',                     icon: '📷', done: false },
        { id: 'm19', title: '🍺 18일 맥주 작전',      desc: '대만 명물 18일 생맥주 한 잔 마시기',                       icon: '🥂', done: false },
        { id: 'm20', title: '🤝 현지인과 소통',        desc: '영어·중국어로 현지인과 대화 성공 (길 묻기, 주문 등)',      icon: '💬', done: false },
        // ── 추가 작전 ────────────────────────────────
        { id: 'm21', title: '✈️ 기내 잠입 성공',      desc: '비행기 안에서 잠든 가족 몰래 인증샷 확보',                 icon: '🤫', done: false },
        { id: 'm22', title: '🥐 에그타르트 정복',     desc: '융캉제 썬메리베이커리 에그타르트 먹방 인증',               icon: '🍽️', done: false },
        { id: 'm23', title: '🪨 암호 바위 해독',      desc: '예류에서 여왕머리 외 특이한 바위 3종 이상 사진 수집',      icon: '📷', done: false },
        { id: 'm24', title: '🏛️ 역사 현장 확보',     desc: '보피랴오 청나라 건물 배경으로 인증샷 촬영',                icon: '📷', done: false },
        { id: 'm25', title: '👟 시먼딩 잠입 쇼핑',    desc: '시먼딩에서 현지 아이템 1개 이상 구매 성공',                icon: '🛍️', done: false },
        { id: 'm26', title: '🤸 작전팀 점프샷',       desc: '관광지에서 전원 동시 점프 단체샷 성공',                    icon: '📸', done: false },
        { id: 'm27', title: '🥟 젓가락 특수훈련',     desc: '젓가락으로 샤오롱바오 터트리지 않고 먹기 성공',            icon: '🥢', done: false },
        { id: 'm28', title: '🗣️ 현지어 침투',         desc: '중국어로 謝謝(씨에씨에) 또는 好吃(하오츠) 현지인에게 말하기', icon: '💬', done: false },
        { id: 'm29', title: '☕ 비밀 아지트 확보',    desc: '대만 감성 카페 발견 & 음료 + 인증샷 완료',                 icon: '📍', done: false },
        { id: 'm30', title: '📋 현장 보고서 제출',    desc: '앱 증거 게시판(후기 탭)에 현장 보고서 1건 이상 등록',      icon: '✍️', done: false },
        { id: 'm31', title: '💰 환율 계산 달인',      desc: '쇼핑 전 앱 환율 계산기로 가격 직접 계산하기',              icon: '🧮', done: false },
        { id: 'm32', title: '🌊 황금 폭포 목격',      desc: '스펀 근처 황금 폭포(黃金瀑布) 현장 확인 & 사진 인증',      icon: '📷', done: false },
        { id: 'm33', title: '🏁 작전 완수 증명',      desc: '귀국 당일 인천공항에서 전원 단체 사진 & 소감 한마디',      icon: '🎉', done: false },
        // ── 특수 작전 ────────────────────────────────
        { id: 'm34', title: '🫰 가족 합체',            desc: '대만 랜드마크 앞에서 온 가족 손가락 하트 셀카 찍기',        icon: '🤳', done: false },
        { id: 'm35', title: '🎬 영상 편지',            desc: '여행 중 가장 행복한 순간, 부모님 인터뷰 영상 10초 남기기', icon: '📹', done: false },
        { id: 'm36', title: '🌶️ 야시장 마스터',       desc: '야시장에서 처음 보는 낯선 음식에 용감하게 도전해보기',     icon: '🍢', done: false },
        { id: 'm37', title: '🫙 조식의 제왕',          desc: '대만식 아침식사 또우장(豆漿)과 요우티아오(油條)로 배 채우기', icon: '🥣', done: false },
        { id: 'm38', title: '🚇 지하철 탐험대',        desc: 'MRT 노선도 보고 부모님이 직접 다음 목적지 찾아 앞장서기', icon: '🗺️', done: false },
        { id: 'm39', title: '💕 칭찬 릴레이',          desc: '하루에 한 번 이상 서로 고생했다며 진심으로 칭찬하기',      icon: '🌟', done: false },
        { id: 'm40', title: '👣 도보 탐험대장',        desc: '구글 지도 보고 부모님이 앞장서서 편의점·지하철역 찾아가기', icon: '🗺️', done: false },
        { id: 'm41', title: '🍑 미식가 인증',          desc: '석가·스타프루트·왁스애플 등 낯선 과일 3종 이상 맛보고 순위 정하기', icon: '🏆', done: false },
        { id: 'm42', title: '😤 취두부 정면 돌파',     desc: '야시장 취두부 가게 앞에서 가장 평온한 표정 유지 & 사진 인증', icon: '🧘', done: false }
    ],
    checklist: [
        // 기내용
        { id: 'cc1', title: '여권', done: false, category: '기내용' },
        { id: 'cc2', title: '지갑', done: false, category: '기내용' },
        { id: 'cc3', title: '유심/로밍', done: false, category: '기내용' },
        { id: 'cc4', title: '신분증', done: false, category: '기내용' },
        { id: 'cc5', title: '현지화폐 (TWD)', done: false, category: '기내용' },
        { id: 'cc6', title: '신용카드', done: false, category: '기내용' },
        { id: 'cc7', title: '보조배터리 (지퍼백에 담기)', done: false, category: '기내용' },
        { id: 'cc8', title: '카메라', done: false, category: '기내용' },
        { id: 'cc9', title: '카메라 배터리', done: false, category: '기내용' },
        { id: 'cc10', title: '휴대용 선풍기', done: false, category: '기내용' },
        { id: 'cc11', title: '목베개', done: false, category: '기내용' },
        // 수화물 - 전자기기
        { id: 'ce1', title: '충전기', done: false, category: '수화물 · 전자기기' },
        { id: 'ce2', title: '삼각대', done: false, category: '수화물 · 전자기기' },
        { id: 'ce3', title: '메모리카드', done: false, category: '수화물 · 전자기기' },
        { id: 'ce4', title: '에어랩/고데기', done: false, category: '수화물 · 전자기기' },
        // 수화물 - 옷
        { id: 'cw1', title: '겉옷', done: false, category: '수화물 · 의류' },
        { id: 'cw2', title: '상의', done: false, category: '수화물 · 의류' },
        { id: 'cw3', title: '하의', done: false, category: '수화물 · 의류' },
        { id: 'cw4', title: '속옷', done: false, category: '수화물 · 의류' },
        { id: 'cw5', title: '양말', done: false, category: '수화물 · 의류' },
        { id: 'cw6', title: '모자', done: false, category: '수화물 · 의류' },
        { id: 'cw7', title: '신발', done: false, category: '수화물 · 의류' },
        { id: 'cw8', title: '슬리퍼', done: false, category: '수화물 · 의류' },
        { id: 'cw9', title: '잠옷', done: false, category: '수화물 · 의류' },
        { id: 'cw10', title: '선글라스', done: false, category: '수화물 · 의류' },
        { id: 'cw11', title: '팔토시', done: false, category: '수화물 · 의류' },
        { id: 'cw12', title: '작은가방', done: false, category: '수화물 · 의류' },
        // 수화물 - 세면도구
        { id: 'ct1', title: '수건', done: false, category: '수화물 · 세면도구' },
        { id: 'ct2', title: '면도기', done: false, category: '수화물 · 세면도구' },
        { id: 'ct3', title: '스킨/로션', done: false, category: '수화물 · 세면도구' },
        { id: 'ct4', title: '화장품', done: false, category: '수화물 · 세면도구' },
        { id: 'ct5', title: '알로에', done: false, category: '수화물 · 세면도구' },
        { id: 'ct6', title: '개인약 (나잘 등)', done: false, category: '수화물 · 세면도구' },
        // 수화물 - 기타
        { id: 'co1', title: '양우산', done: false, category: '수화물 · 기타' },
        { id: 'co2', title: '폴딩백 (보조 가방)', done: false, category: '수화물 · 기타' },
        { id: 'co3', title: '인공눈물', done: false, category: '수화물 · 기타' },
        { id: 'co4', title: '영양제', done: false, category: '수화물 · 기타' },
        { id: 'co5', title: '나무젓가락 12개', done: false, category: '수화물 · 기타' },
        { id: 'co6', title: '일회용 숟가락 12개', done: false, category: '수화물 · 기타' },
        { id: 'co7', title: '휴지', done: false, category: '수화물 · 기타' },
        { id: 'co8', title: '물티슈', done: false, category: '수화물 · 기타' },
        { id: 'co9', title: '위생백', done: false, category: '수화물 · 기타' },
        { id: 'co10', title: '손톱깎이', done: false, category: '수화물 · 기타' },
        { id: 'co11', title: '플라스틱 칼', done: false, category: '수화물 · 기타' },
        { id: 'co12', title: '지퍼백', done: false, category: '수화물 · 기타' },
        // 공용 - 바우처/서류
        { id: 'cv1', title: '여권 사본', done: false, category: '공용 · 서류' },
        { id: 'cv2', title: '항공티켓', done: false, category: '공용 · 서류' },
        { id: 'cv3', title: '숙소 예약 확인서', done: false, category: '공용 · 서류' },
        { id: 'cv4', title: '여행자보험 서류', done: false, category: '공용 · 서류' },
        { id: 'cv5', title: '각종 바우처 (박물관·투어 등)', done: false, category: '공용 · 서류' },
        // 공용 - 전자기기
        { id: 'cge1', title: '멀티어댑터 3개 (110V 돼지코)', done: false, category: '공용 · 전자기기' },
        { id: 'cge2', title: '멀티탭 4구 3개', done: false, category: '공용 · 전자기기' },
        { id: 'cge3', title: '여분 케이블', done: false, category: '공용 · 전자기기' },
        { id: 'cge4', title: '셀카봉', done: false, category: '공용 · 전자기기' },
        // 공용 - 세면도구
        { id: 'cgs1', title: '클렌징폼', done: false, category: '공용 · 세면도구' },
        { id: 'cgs2', title: '클렌징 티슈', done: false, category: '공용 · 세면도구' },
        { id: 'cgs3', title: '선크림', done: false, category: '공용 · 세면도구' },
        { id: 'cgs4', title: '머리끈', done: false, category: '공용 · 세면도구' },
        { id: 'cgs5', title: '샴푸·바디워시', done: false, category: '공용 · 세면도구' },
        { id: 'cgs6', title: '린스', done: false, category: '공용 · 세면도구' },
        { id: 'cgs7', title: '바디로션', done: false, category: '공용 · 세면도구' },
        { id: 'cgs8', title: '샤워타올', done: false, category: '공용 · 세면도구' },
        { id: 'cgs9', title: '칫솔·치약', done: false, category: '공용 · 세면도구' },
        { id: 'cgs10', title: '화장솜/면봉', done: false, category: '공용 · 세면도구' },
        { id: 'cgs11', title: '빗', done: false, category: '공용 · 세면도구' },
        { id: 'cgs12', title: '휴대용 핸드워시', done: false, category: '공용 · 세면도구' },
        { id: 'cgs13', title: '마스크', done: false, category: '공용 · 세면도구' },
        { id: 'cgs14', title: '데오도란트', done: false, category: '공용 · 세면도구' },
        // 공용 - 상비약
        { id: 'cgm1', title: '진통제', done: false, category: '공용 · 상비약' },
        { id: 'cgm2', title: '소화제', done: false, category: '공용 · 상비약' },
        { id: 'cgm3', title: '밴드', done: false, category: '공용 · 상비약' },
        { id: 'cgm4', title: '알러지약', done: false, category: '공용 · 상비약' },
        { id: 'cgm5', title: '모기기피제', done: false, category: '공용 · 상비약' },
        { id: 'cgm6', title: '지사제', done: false, category: '공용 · 상비약' },
        { id: 'cgm7', title: '연고', done: false, category: '공용 · 상비약' },
        { id: 'cgm8', title: '종합감기약', done: false, category: '공용 · 상비약' },
        { id: 'cgm9', title: '파스', done: false, category: '공용 · 상비약' },
        { id: 'cgm10', title: '휴족시간', done: false, category: '공용 · 상비약' },
        { id: 'cgm11', title: '베드버그 약 (비오킬)', done: false, category: '공용 · 상비약' },
        { id: 'cgm12', title: '여성용품', done: false, category: '공용 · 상비약' }
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
