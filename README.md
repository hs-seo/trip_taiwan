# 극비 수사: 대만 작전 🕵️

가족 대만 여행(2026.04.29–05.02)을 위한 모바일 웹 앱.
수사 컨셉의 인터페이스로 일정, 미션, 사진 공유, 체크리스트를 제공합니다.

---

## 주요 기능

- **요원 선택** — 가족 구성원별 캐릭터 선택 (로컬스토리지 유지)
- **일정표** — Day별 타임라인 + 구글 지도 연동, 인라인 수정 가능
- **미션 수첩** — 공유 미션 완료 현황 (서버 동기화, 오프라인 폴백)
- **증거 사진** — 사진 업로드/삭제/전체 ZIP 다운로드
- **정보** — 숙소 정보, 준비물 체크리스트
- **D-Day 카운터 + 타이베이 실시간 날씨**

---

## 아키텍처

```
[사용자 폰/브라우저]
        │ HTTPS
        ▼
[Cloudflare Tunnel]
        │
        ▼
[Self-hosted Server - nginx 역방향 프록시]
        │
        ▼
[Docker Container: taiwan-trip]
  Node.js + Express
        │
        ├── 정적 파일 서빙 (index.html, style.css, app.js, data.js, 이미지)
        ├── /api/state              — 미션/사진 상태 조회
        ├── /api/mission/:id/complete — 미션 완료 토글
        ├── /api/upload             — 사진 업로드 (multer)
        ├── /api/photo/:id          — 사진 삭제
        └── /api/download-all       — 전체 사진 ZIP 다운로드
        │
        ├── state.json  (미션 완료 현황, 사진 메타데이터 — 볼륨 마운트)
        └── uploads/    (업로드 사진 원본 — 볼륨 마운트)
```

### 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Vanilla JS, HTML5, CSS3 (프레임워크 없음) |
| Backend | Node.js + Express |
| 파일 처리 | multer (로컬 디스크), archiver (ZIP) |
| 인프라 | Docker, Self-hosted NAS, Cloudflare Tunnel |
| DNS/SSL | Cloudflare (자동 HTTPS) |

---

## 로컬 실행

```bash
npm install
node server.js
# → http://localhost:3000 (PORT 환경변수로 변경 가능)
```

## Docker 실행

```bash
# .env 파일 생성
echo "PORT=3000" > .env

docker compose up -d --build
```

### 볼륨 구조

```
./state.json   → 앱 상태 영속화 (없으면 자동 생성)
./uploads/     → 업로드 사진 저장
./style.css    → 컨테이너 재빌드 없이 즉시 반영
./index.html   → 동일
./app.js       → 동일
./data.js      → 동일
```

---

## GCP 마이그레이션 계획

현재 로컬 파일 기반 스토리지를 GCP 서비스로 교체 예정:

| 현재 | 변경 후 |
|------|---------|
| `state.json` (로컬) | Firestore |
| `uploads/` (로컬 디스크) | Cloud Storage |
| Self-hosted NAS | Cloud Run |

예상 비용: 소규모 트래픽 기준 **월 $0~3** (GCP 무료 한도 내)
