/**
 * 2026 PNU Job Training - Detail Page Interactive Controller
 */
(function () {
  'use strict';

  // DOM Elements
  const detailContainer = document.getElementById('detailContainer');
  const errorContainer = document.getElementById('errorContainer');
  const loadingContainer = document.getElementById('loadingContainer');

  async function init() {
    initHeaderInteractions();

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      showError('과정 코드가 지정되지 않았습니다.');
      return;
    }

    try {
      showLoading(true);
      const course = await window.getCourseByCode(code);
      if (!course) {
        showError(`과정 코드 [${escapeHtml(code)}]에 해당하는 연수 정보를 찾을 수 없습니다.`);
        return;
      }

      renderCourseDetail(course);
      bindDetailEvents(course);
    } catch (err) {
      console.error('Failed to load course details:', err);
      showError('상세 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      showLoading(false);
    }
  }

  // Header Interactions
  function initHeaderInteractions() {
    const header = document.querySelector('.pnu-header');
    const hamburgerBtn = document.querySelector('.pnu-hamburger-btn');
    const mobileDrawer = document.querySelector('.pnu-mobile-drawer');

    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }, { passive: true });
    }

    if (hamburgerBtn && mobileDrawer) {
      const toggle = (force) => {
        const isOpen = typeof force === 'boolean' ? force : !mobileDrawer.classList.contains('open');
        mobileDrawer.classList.toggle('open', isOpen);
        hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      };

      hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle();
      });

      mobileDrawer.addEventListener('click', (e) => {
        if (e.target === mobileDrawer) toggle(false);
      });
    }
  }

  // Render Full Course Detail
  function renderCourseDetail(course) {
    const code = escapeHtml(course['과정코드'] || '');
    const title = escapeHtml(course['과정명'] || '');
    const category = escapeHtml(course['분야'] || '직무공통');
    const completion = escapeHtml(course['이수구분'] || '선택');
    const method = escapeHtml(course['교육방식'] || '온라인');
    const hours = escapeHtml(course['교육시간'] || '-');
    const capacity = escapeHtml(course['정원'] || '무제한');
    const period = escapeHtml(course['교육기간'] || '상시');
    const applyPeriod = escapeHtml(course['신청기간'] || '상시');
    const target = escapeHtml(course['대상'] || '전 직원');
    const dept = escapeHtml(course['담당부서'] || '인재개발원');
    const oneLine = escapeHtml(course['한줄소개'] || '');
    const fullDesc = escapeHtml(course['상세소개'] || '');
    const objectivesRaw = course['학습목표'] || '';
    const curriculumRaw = course['주요내용'] || '';
    const applyUrl = course['신청링크'] || '#';
    const contact = escapeHtml(course['문의'] || '');

    // Update document title
    document.title = `${course['과정명']} - 2026 부산대학교 직무연수 카탈로그`;

    // Completion badge style
    let badgeCompClass = 'badge-optional';
    if (completion.includes('필수')) badgeCompClass = 'badge-required';
    else if (completion.includes('권장')) badgeCompClass = 'badge-recommended';

    // Parse Objectives (split by ' · ' or '\n')
    const objectiveItems = objectivesRaw
      .split(/[·\n•]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Parse Curriculum (split by ' · ' or '\n')
    const curriculumItems = curriculumRaw
      .split(/[·\n•]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Parse Phone number
    const phoneMatch = contact.match(/[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/);
    const phoneNumber = phoneMatch ? phoneMatch[0] : '';

    if (!detailContainer) return;

    detailContainer.innerHTML = `
      <!-- Breadcrumb Bar -->
      <nav class="breadcrumb-bar" aria-label="경로 탐색">
        <div class="container">
          <ol class="breadcrumb-list">
            <li><a href="index.html">홈</a></li>
            <li class="sep">/</li>
            <li><a href="index.html">직무연수 카탈로그</a></li>
            <li class="sep">/</li>
            <li><a href="index.html">${category}</a></li>
            <li class="sep">/</li>
            <li class="current" aria-current="page">${code}</li>
          </ol>
        </div>
      </nav>

      <!-- Course Hero Header -->
      <header class="detail-hero-section">
        <div class="container">
          <div class="detail-hero-top">
            <div class="detail-badges-group">
              <span class="detail-category-tag">${category}</span>
              <span class="badge ${badgeCompClass}">${completion}</span>
              <span class="badge badge-mode">${method}</span>
            </div>
            <span class="detail-code-label">과정코드: ${code}</span>
          </div>

          <h1 class="detail-title">${title}</h1>

          ${oneLine ? `<p class="detail-summary-lead">${oneLine}</p>` : ''}
        </div>
      </header>

      <!-- 2-Column Main Content Layout -->
      <div class="container">
        <div class="detail-main-layout">
          
          <!-- LEFT CONTENT COLUMN (65%) -->
          <div class="detail-content-col">
            
            <!-- 1. 상세 소개 -->
            <section class="content-block">
              <h2 class="block-heading">
                <span class="icon">📖</span>
                <span>연수 과정 상세 소개</span>
              </h2>
              <p class="prose-text">${fullDesc || '등록된 상세 소개가 없습니다.'}</p>
            </section>

            <!-- 2. 학습 목표 -->
            <section class="content-block">
              <h2 class="block-heading">
                <span class="icon">🎯</span>
                <span>핵심 학습 목표</span>
              </h2>
              <ul class="objective-list">
                ${objectiveItems.length > 0 ? objectiveItems.map(obj => `
                  <li class="objective-item">
                    <span class="objective-check-icon">✓</span>
                    <span>${escapeHtml(obj)}</span>
                  </li>
                `).join('') : `
                  <li class="objective-item">
                    <span class="objective-check-icon">✓</span>
                    <span>직무 전문성 향상 및 실무 적용 역량 체득</span>
                  </li>
                `}
              </ul>
            </section>

            <!-- 3. 주요 커리큘럼 / 교육 내용 -->
            <section class="content-block">
              <h2 class="block-heading">
                <span class="icon">📑</span>
                <span>주요 교육 내용 및 모듈</span>
              </h2>
              <div class="curriculum-flow">
                ${curriculumItems.length > 0 ? curriculumItems.map((curr, idx) => `
                  <div class="curriculum-module-card">
                    <span class="module-step-num">모듈 0${idx + 1}</span>
                    <p class="module-content-text">${escapeHtml(curr)}</p>
                  </div>
                `).join('') : `
                  <div class="curriculum-module-card">
                    <span class="module-step-num">모듈 01</span>
                    <p class="module-content-text">과정 상세 내용 편성 진행 중</p>
                  </div>
                `}
              </div>
            </section>

            <!-- 4. 유의사항 및 이수 기준 -->
            <section class="content-block">
              <h2 class="block-heading">
                <span class="icon">ℹ️</span>
                <span>이수 기준 및 안내 사항</span>
              </h2>
              <div class="notice-box">
                <span class="icon">⚠️</span>
                <p>
                  본 과정의 출석률 및 진도율이 <strong>80% 이상</strong>(온라인의 경우 학습 완료율 100%) 충족되어야 상시학습 시간이 공식 인정됩니다.
                  법정의무교육 미이수자는 관계 법령 및 학내 지침에 따라 별도 통보되오니 정해진 기한 내에 수강을 완료하여 주시기 바랍니다.
                </p>
              </div>
            </section>

            <!-- 하단 연수 목록 이동 -->
            <div class="detail-bottom-actions">
              <a href="index.html" class="btn-back-catalog">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                <span>전체 연수 목록으로 돌아가기</span>
              </a>
            </div>

          </div>

          <!-- RIGHT STICKY SIDEBAR (35%) -->
          <aside class="detail-sidebar-col">
            
            <!-- 수강신청 핵심 명세 카드 -->
            <div class="apply-card-sticky">
              <h3 class="apply-card-header">
                <span>교육 신청 정보</span>
                <span style="font-size: 0.8rem; color: #00873d; font-weight: 700;">● 접수 중</span>
              </h3>

              <ul class="apply-specs-table">
                <li class="apply-spec-row">
                  <span class="spec-name">⏱ 교육시간</span>
                  <span class="spec-val">${hours}</span>
                </li>
                <li class="apply-spec-row">
                  <span class="spec-name">👥 교육대상</span>
                  <span class="spec-val">${target}</span>
                </li>
                <li class="apply-spec-row">
                  <span class="spec-name">💻 교육방식</span>
                  <span class="spec-val">${method}</span>
                </li>
                <li class="apply-spec-row">
                  <span class="spec-name">🔢 모집정원</span>
                  <span class="spec-val">${capacity}</span>
                </li>
                <li class="apply-spec-row">
                  <span class="spec-name">📅 교육기간</span>
                  <span class="spec-val">${period}</span>
                </li>
                <li class="apply-spec-row">
                  <span class="spec-name">📝 신청기간</span>
                  <span class="spec-val">${applyPeriod}</span>
                </li>
                <li class="apply-spec-row">
                  <span class="spec-name">🏛 담당부서</span>
                  <span class="spec-val">${dept}</span>
                </li>
              </ul>

              <!-- 수강신청 바로가기 CTA -->
              <a href="${applyUrl}" target="_blank" rel="noopener noreferrer" class="btn-apply-main" id="btnApply">
                <span>수강신청 바로가기</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>

              <!-- 공유 및 인쇄 버튼 -->
              <div class="sidebar-utility-row">
                <button type="button" class="btn-utility" id="btnShare">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  <span>링크 복사</span>
                </button>
                <button type="button" class="btn-utility" id="btnPrint">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  <span>인쇄하기</span>
                </button>
              </div>
            </div>

            <!-- 문의처 안내 카드 -->
            <div class="inquire-card">
              <h4 class="inquire-title">
                <span>📞 과정 문의</span>
              </h4>
              <p class="inquire-dept">${contact || dept}</p>
              ${phoneNumber ? `
                <a href="tel:${phoneNumber}" class="inquire-phone">
                  <span>전화 문의: ${phoneNumber}</span>
                </a>
              ` : ''}
            </div>

          </aside>

        </div>
      </div>
    `;

    detailContainer.style.display = 'block';
  }

  // Bind Events on Detail Page
  function bindDetailEvents() {
    const btnShare = document.getElementById('btnShare');
    const btnPrint = document.getElementById('btnPrint');

    if (btnShare) {
      btnShare.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast('연수 링크가 클립보드에 복사되었습니다.');
        } catch (e) {
          showToast('주소창의 URL을 복사하여 공유해주세요.');
        }
      });
    }

    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // Toast Notification
  function showToast(msg) {
    let toast = document.querySelector('.toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Loading & Error Handlers
  function showLoading(isLoading) {
    if (loadingContainer) {
      loadingContainer.style.display = isLoading ? 'block' : 'none';
    }
  }

  function showError(msg) {
    if (detailContainer) detailContainer.style.display = 'none';
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="container" style="padding: 6rem 1.5rem; text-align: center;">
          <div class="empty-state">
            <h2 class="empty-title" style="color: #dc2626;">연수 과정을 찾을 수 없습니다</h2>
            <p class="empty-desc">${escapeHtml(msg)}</p>
            <a href="index.html" class="btn-primary" style="display: inline-flex; margin-top: 1rem;">
              <span>전체 직무연수 카탈로그로 이동</span>
            </a>
          </div>
        </div>
      `;
      errorContainer.style.display = 'block';
    }
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
