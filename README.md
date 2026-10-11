# 2026 부산대학교 직무연수 카탈로그 (PNU Job Training Catalog)

부산대학교 교직원 역량 강화를 위한 **2026년도 직무연수 안내 웹사이트**입니다.  
구글 스프레드시트와의 실시간 연동을 통해 데이터가 업데이트되면 새로고침 시 사이트에 즉시 반영됩니다.

---

## 🌟 주요 기능

1. **실시간 데이터 연동 (Google Sheets GViz & PapaParse)**
   - 구글 시트 GViz CSV API를 통해 32개 직무연수 과정 정보를 실시간으로 파싱합니다.
   - 네트워크 지연 또는 권한 이슈 대비 로컬 백업(`data_backup.csv`) 캐스케이드 지원.

2. **메인 페이지 (`index.html`)**
   - **반응형 헤더 & 로고**: PNU 시그니처 블루(`#004098`) & 에메랄드 그린(`#00873D`) 디자인 시스템 적용.
   - **실시간 통계 카드 (KPI)**: 총 연수 건수, 법정의무연수, 온라인 전용 연수 실시간 카운트.
   - **스마트 검색 & 다중 필터**: 연수명·목표·내용 실시간 디바운스 검색 및 10개 직무 분야, 이수 구분, 교육 방식, 대상자 필터링.
   - **3열 반응형 연수 카드 그리드**: 태그 뱃지, 핵심 요약, 교육 시간, 신청 기간, 정원 정보 제공.

3. **상세 페이지 (`detail.html`)**
   - `?code=PNU-2026-XXX` 쿼리 파라미터를 통한 단일 페이지 동적 렌더링.
   - 연수 개요, 교육 목표 체크리스트, 커리큘럼 모듈, 수료 기준 및 유의사항 안내.
   - 우측 플로팅 사이드바(신청 바로가기, URL 공유, 인쇄, 문의처 안내).

---

## 🛠️ 기술 스택

- **HTML5 / CSS3 / Modern JavaScript (ES6+)**
- **PapaParse v5.4.1** (CSV Parsing)
- **Lucide Icons** (SVG Icon System)
- **Google Sheets GViz API** (Live Data Source)
- **GitHub Pages** (Hosting & Continuous Deployment)

---

## 📂 디렉터리 구조

```
├── index.html                  # 메인 페이지 (연수 카탈로그 & 필터)
├── detail.html                 # 상세 페이지 (연수별 세부 정보 & 신청)
├── css/
│   ├── header.css             # 반응형 헤더 & PNU 브랜딩 스타일
│   ├── main.css               # 메인 카탈로그 & 필터 그리드 스타일
│   └── detail.css             # 상세 페이지 2열 레이아웃 스타일
├── js/
│   ├── sheet-api.js           # 구글 시트 GViz 파싱 & 데이터 정규화 모듈
│   ├── main.js                # 메인 페이지 필터링/검색/렌더링 로직
│   └── detail.js              # 상세 페이지 쿼리 파라미터 매핑 & UI 로직
├── assets/
│   └── logo.png               # 부산대학교 심볼 & 로고 에셋
├── data_backup.csv            # 32개 직무연수 로컬 백업 데이터
└── PLAN_2026_PNU_TRAINING_SITE.md # 작업 기획서
```
