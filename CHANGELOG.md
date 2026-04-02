# CHANGELOG

## 2026-04-02 (현재)

### 추가
- **캐릭터 영미 추가** — 조력팀(type: dog), 탐정 선택 불가
- **수사팀·조력팀 2줄 분리** — 본부 화면에서 수평 스크롤 두 줄로 표시
- **후기 게시판** (증거 탭 내 서브탭)
  - GPS 위치 첨부 (navigator.geolocation + Nominatim 역지오코딩)
  - Leaflet.js + OpenStreetMap 지도에 캐릭터 이미지 마커 표시
  - 본인 글만 삭제 가능
- **환율 계산기** (정보 탭) — TWD↔KRW 양방향, 실시간 환율(open.er-api.com), 3자리 콤마 포맷
- **사진 라이트박스** — 탭으로 확대, 좌우 스와이프/버튼으로 이전·다음
- **일정 꿀팁 아코디언** — 이벤트별 tips[] 배열, 탭으로 펼치기/접기, 인라인 수정
- **일정 서버 공유** — Firestore에 schedule 저장, 전 기기 실시간 동기화
- **일정 자물쇠** — 기본 잠금, 잠금 해제 후에만 수정 가능
- **체크리스트 CRUD** — 항목 추가·인라인 수정·삭제, Firestore 동기화
- **날씨 카드 링크** — AccuWeather 타이베이 시간별 예보로 연결
- **증거 탭 서브탭** — 사진 / 후기 탭 분리

### 수정
- **미션 캐릭터별 독립 추적** — `counts[charId]` 구조로 인원별 카운트 분리
- **캐릭터 이미지 통일** — 라이트박스 캡션, 지도 마커, 후기 아바타 모두 실제 픽셀아트 이미지 사용
- **GCS Uniform Bucket-Level Access 대응** — `file.makePublic()` 제거, 버킷 IAM으로 공개 설정
- **Cloudflare 캐시 우회** — JS/CSS 버전 쿼리스트링 적용
- **Cold start 대응** — fetchServerState non-blocking 처리
- **TDZ 버그 수정** — scheduleTabs 등 const 선언을 init() 호출 전으로 이동
- **Cache-Control: no-cache** — 모든 정적 파일에 적용

### 아키텍처 변경
- Docker + 로컬 파일 → **GCP Cloud Run + Firestore + Cloud Storage** 마이그레이션 완료
- state.json → Firestore `app/state` 문서
- uploads/ → Cloud Storage `trip-taiwan-2026-uploads` 버킷
- NAS nginx Host 헤더 재작성으로 커스텀 도메인 연결

---

## 2026-03-31 (초기)

### 추가
- 프로젝트 초기 생성 (Docker + 로컬 파일 기반)
- 요원 선택, 일정표, 미션 수첩, 증거 사진, 정보 탭 기본 구현
- D-Day 카운터, 타이베이 날씨
- GCP 마이그레이션 (Cloud Run + Firestore + GCS)
