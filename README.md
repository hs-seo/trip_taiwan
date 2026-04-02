# 극비 수사: 대만 작전 🕵️

가족 대만 여행(2026.04.29–05.02)을 위한 모바일 웹 앱.
스파이/수사 컨셉의 인터페이스로 일정·미션·사진·후기·체크리스트를 실시간 공유합니다.

---

## 주요 기능

| 탭 | 기능 |
|---|---|
| **본부** | D-Day 카운터, 타이베이 실시간 날씨(AccuWeather 연동), 수사팀·조력팀 캐릭터 현황 |
| **일정** | Day별 타임라인, 구글 지도 연동, 자물쇠 보호 인라인 수정, 꿀팁 아코디언 |
| **임무** | 캐릭터별 독립 미션 완료 추적 (일반/카운팅 미션), 완료 스탬프 애니메이션 |
| **증거** | 사진 업로드·삭제·라이트박스(스와이프), 여행 후기 게시판(GPS 위치+지도) |
| **정보** | 실시간 환율 계산기(TWD↔KRW), 숙소 정보, 준비물 체크리스트(CRUD) |

---

## 아키텍처

```
[사용자 폰/브라우저]
        │ HTTPS
        ▼
[Cloudflare Tunnel]
        │ HTTP
        ▼
[NAS nginx — Host 헤더 재작성]
        │ HTTPS
        ▼
[Google Cloud Run — taiwan-trip]
  Node.js + Express
        │
        ├── /api/state                   GET  — 전체 상태 조회
        ├── /api/schedule                PUT  — 일정 업데이트
        ├── /api/checklist               PUT  — 체크리스트 업데이트
        ├── /api/mission/:id/complete    POST — 미션 완료 토글/카운트
        ├── /api/upload                  POST — 사진 업로드 (멀티파일)
        ├── /api/photo/:id               DELETE — 사진 삭제
        ├── /api/download-all            GET  — 전체 사진 ZIP
        ├── /api/bulletins               GET  — 후기 목록
        ├── /api/bulletin                POST — 후기 등록
        └── /api/bulletin/:id            DELETE — 후기 삭제
        │
        ├── Firestore (app/state)        — 미션·일정·체크리스트·후기 메타
        └── Cloud Storage                — 사진 바이너리
```

### 스택

| 레이어 | 기술 |
|---|---|
| Frontend | Vanilla JS · HTML5 · CSS3 (프레임워크 없음) |
| Backend | Node.js + Express |
| DB | Google Firestore (Native mode, asia-northeast3) |
| 파일 저장 | Google Cloud Storage (Uniform Bucket-Level Access) |
| 인프라 | Google Cloud Run (asia-northeast3) |
| 도메인 | Cloudflare Tunnel → NAS nginx 역방향 프록시 |
| 지도 | Leaflet.js + OpenStreetMap (후기 GPS 마커) |
| 환율 | open.er-api.com (무료, 무인증) |

### NAS nginx 역방향 프록시가 필요한 이유

Cloud Run에 커스텀 도메인 직접 연결 시 Google 도메인 소유권 인증 필요.
NAS nginx가 Host 헤더를 Cloud Run URL로 재작성해 우회.

```nginx
proxy_set_header Host taiwan-trip-HASH.asia-northeast3.run.app;
proxy_pass https://taiwan-trip-HASH.asia-northeast3.run.app;
```

---

## GCP 리소스

| 리소스 | 이름 | 리전 |
|---|---|---|
| Cloud Run | taiwan-trip | asia-northeast3 |
| Firestore | (default) | asia-northeast3 |
| Cloud Storage | trip-taiwan-2026-uploads | asia-northeast3 |
| GCP 프로젝트 | trip-taiwan-2026 | — |

### 환경변수 (Cloud Run)

| 키 | 값 |
|---|---|
| `GCP_PROJECT_ID` | trip-taiwan-2026 |
| `GCS_BUCKET_NAME` | trip-taiwan-2026-uploads |
| `NODE_ENV` | production |

---

## 데이터 구조 (Firestore `app/state`)

```js
{
  schedule: [ { day, date, events: [{ id, time, title, desc, icon, mapUrl, tips[] }] } ],
  checklist: [ { id, title, done } ],
  missions: {
    "m1": { completedBy: ["char1"], counts: { "char1": 2 }, done: true }
  },
  photos: [ { id, filename, url, charId, uploadedAt } ],
  bulletins: [ { id, charId, charName, text, timestamp, lat, lng, locationLabel } ]
}
```

---

## 캐릭터 구조

| type | 설명 | 탐정 선택 |
|---|---|---|
| `human` | 재룡·월숙·형석·다솔·종찬·애솔 | ✅ |
| `dog` | 영미 | ❌ (조력팀) |
| `cat` | 아띠·아망·아키·아로 | ❌ (조력팀) |

---

## 로컬 개발

```bash
npm install

# .env 생성
cp .env.example .env
# GCP_PROJECT_ID, GCS_BUCKET_NAME 채우기

node server.js
# → http://localhost:3000
```

## 배포

```bash
gcloud run deploy taiwan-trip \
  --source . \
  --region asia-northeast3 \
  --project trip-taiwan-2026 \
  --quiet
```

JS/CSS 변경 시 `index.html`의 버전 쿼리스트링 올리기:
```html
<script src="app.js?v=N"></script>  <!-- N 증가 -->
```

---

## 비용 (예상)

소규모 가족 앱 기준 GCP 무료 한도 내 운영 가능.

| 서비스 | 무료 한도 |
|---|---|
| Cloud Run | 월 200만 요청, 360,000 vCPU-초 |
| Firestore | 50,000 읽기·쓰기/일 |
| Cloud Storage | 5GB 저장, 1GB 전송/월 |
