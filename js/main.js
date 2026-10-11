/**
 * 2026 PNU Job Training Catalog - Main Page Interactive Controller
 */
(function () {
  'use strict';

  // DOM Elements
  const statsTotalVal = document.getElementById('statTotalVal');
  const statsRequiredVal = document.getElementById('statRequiredVal');
  const statsOnlineVal = document.getElementById('statOnlineVal');
  const searchInput = document.getElementById('searchInput');
  const filterCategoryChips = document.getElementById('categoryChips');
  const filterCompletion = document.getElementById('filterCompletion');
  const filterMethod = document.getElementById('filterMethod');
  const filterTarget = document.getElementById('filterTarget');
  const btnResetFilters = document.getElementById('btnResetFilters');
  const coursesContainer = document.getElementById('coursesContainer');
  const resultsCount = document.getElementById('resultsCount');

  // State
  let allCourses = [];
  let selectedCategory = 'ALL';
  let searchQuery = '';
  let selectedCompletion = 'ALL';
  let selectedMethod = 'ALL';
  let selectedTarget = 'ALL';
  let searchDebounceTimer = null;

  // Initialize
  async function init() {
    initHeaderInteractions();
    try {
      showLoading(true);
      allCourses = await window.fetchTrainingData();
      renderStats(allCourses);
      renderCategoryChips(allCourses);
      applyFilters();
    } catch (err) {
      console.error('Failed to load courses:', err);
      showError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      showLoading(false);
    }

    bindEvents();
  }

  // 1. Header scroll and mobile menu
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

  // 2. Render Hero KPI Statistics
  function renderStats(courses) {
    if (!courses) return;
    const total = courses.length;
    const required = courses.filter(c => (c['이수구분'] || '').includes('필수')).length;
    const online = courses.filter(c => (c['교육방식'] || '').includes('온라인')).length;

    if (statsTotalVal) statsTotalVal.textContent = total;
    if (statsRequiredVal) statsRequiredVal.textContent = required;
    if (statsOnlineVal) statsOnlineVal.textContent = online;
  }

  // 3. Render Dynamic Category Chips
  function renderCategoryChips(courses) {
    if (!filterCategoryChips) return;
    const categories = Array.from(new Set(courses.map(c => c['분야']).filter(Boolean))).sort();

    filterCategoryChips.innerHTML = `
      <button type="button" class="category-chip active" data-cat="ALL">전체 분야 (${courses.length})</button>
      ${categories.map(cat => {
        const count = courses.filter(c => c['분야'] === cat).length;
        return `<button type="button" class="category-chip" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)} (${count})</button>`;
      }).join('')}
    `;

    filterCategoryChips.querySelectorAll('.category-chip').forEach(btn => {
      btn.addEventListener('click', function () {
        filterCategoryChips.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedCategory = this.getAttribute('data-cat') || 'ALL';
        applyFilters();
      });
    });
  }

  // 4. Bind Input & Filter Events
  function bindEvents() {
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          searchQuery = e.target.value.trim().toLowerCase();
          applyFilters();
        }, 150);
      });
    }

    if (filterCompletion) {
      filterCompletion.addEventListener('change', (e) => {
        selectedCompletion = e.target.value;
        filterCompletion.classList.toggle('active', selectedCompletion !== 'ALL');
        applyFilters();
      });
    }

    if (filterMethod) {
      filterMethod.addEventListener('change', (e) => {
        selectedMethod = e.target.value;
        filterMethod.classList.toggle('active', selectedMethod !== 'ALL');
        applyFilters();
      });
    }

    if (filterTarget) {
      filterTarget.addEventListener('change', (e) => {
        selectedTarget = e.target.value;
        filterTarget.classList.toggle('active', selectedTarget !== 'ALL');
        applyFilters();
      });
    }

    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', resetAllFilters);
    }
  }

  // 5. Reset All Filters
  function resetAllFilters() {
    selectedCategory = 'ALL';
    searchQuery = '';
    selectedCompletion = 'ALL';
    selectedMethod = 'ALL';
    selectedTarget = 'ALL';

    if (searchInput) searchInput.value = '';
    if (filterCompletion) {
      filterCompletion.value = 'ALL';
      filterCompletion.classList.remove('active');
    }
    if (filterMethod) {
      filterMethod.value = 'ALL';
      filterMethod.classList.remove('active');
    }
    if (filterTarget) {
      filterTarget.value = 'ALL';
      filterTarget.classList.remove('active');
    }

    if (filterCategoryChips) {
      filterCategoryChips.querySelectorAll('.category-chip').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-cat') === 'ALL');
      });
    }

    applyFilters();
  }

  // 6. Multi-Filtering Logic
  function applyFilters() {
    if (!coursesContainer) return;

    const filtered = allCourses.filter(course => {
      // 1. Category
      if (selectedCategory !== 'ALL' && course['분야'] !== selectedCategory) {
        return false;
      }

      // 2. Completion (이수구분)
      if (selectedCompletion !== 'ALL') {
        if (selectedCompletion === '필수' && !((course['이수구분'] || '').includes('필수'))) return false;
        if (selectedCompletion === '권장' && course['이수구분'] !== '권장') return false;
        if (selectedCompletion === '선택' && course['이수구분'] !== '선택') return false;
      }

      // 3. Method (교육방식)
      if (selectedMethod !== 'ALL') {
        if (!((course['교육방식'] || '').includes(selectedMethod))) return false;
      }

      // 4. Target (대상)
      if (selectedTarget !== 'ALL') {
        if (!((course['대상'] || '').includes(selectedTarget))) return false;
      }

      // 5. Search Keyword
      if (searchQuery) {
        const title = (course['과정명'] || '').toLowerCase();
        const code = (course['과정코드'] || '').toLowerCase();
        const dept = (course['담당부서'] || '').toLowerCase();
        const summary = (course['한줄소개'] || '').toLowerCase();
        const detail = (course['상세소개'] || '').toLowerCase();

        const matches = title.includes(searchQuery) ||
                        code.includes(searchQuery) ||
                        dept.includes(searchQuery) ||
                        summary.includes(searchQuery) ||
                        detail.includes(searchQuery);
        if (!matches) return false;
      }

      return true;
    });

    renderCourseCards(filtered);
    if (resultsCount) {
      resultsCount.innerHTML = `검색 결과 총 <strong>${filtered.length}</strong>개 과정`;
    }
  }

  // 7. Render Course Cards in Grid
  function renderCourseCards(courses) {
    if (!coursesContainer) return;

    if (courses.length === 0) {
      coursesContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h3 class="empty-title">일치하는 직무연수 과정이 없습니다</h3>
          <p class="empty-desc">검색어 철자를 확인하시거나 적용된 필터 조건을 변경해보세요.</p>
          <button type="button" class="btn-primary" onclick="window.resetFiltersTrigger()">
            <span>전체 과정 다시보기</span>
          </button>
        </div>
      `;
      return;
    }

    coursesContainer.innerHTML = courses.map(course => {
      const code = escapeHtml(course['과정코드'] || '');
      const title = escapeHtml(course['과정명'] || '');
      const category = escapeHtml(course['분야'] || '직무공통');
      const completion = escapeHtml(course['이수구분'] || '선택');
      const method = escapeHtml(course['교육방식'] || '온라인');
      const hours = escapeHtml(course['교육시간'] || '-');
      const target = escapeHtml(course['대상'] || '전 직원');
      const dept = escapeHtml(course['담당부서'] || '인재개발원');
      const summary = escapeHtml(course['한줄소개'] || '');
      const isRequired = completion.includes('필수');

      let badgeCompletionClass = 'badge-optional';
      if (isRequired) badgeCompletionClass = 'badge-required';
      else if (completion.includes('권장')) badgeCompletionClass = 'badge-recommended';

      const detailUrl = `detail.html?code=${encodeURIComponent(course['과정코드'])}`;

      return `
        <article class="course-card ${isRequired ? 'is-required' : ''}">
          <div>
            <div class="card-top-meta">
              <div class="card-badges-wrap">
                <span class="badge ${badgeCompletionClass}">${completion}</span>
                <span class="badge badge-mode">${method}</span>
              </div>
              <span class="card-code">${code}</span>
            </div>

            <div class="card-category-eyebrow">${category}</div>
            
            <h3 class="card-title">
              <a href="${detailUrl}">${title}</a>
            </h3>

            <p class="card-desc">${summary}</p>
          </div>

          <div>
            <div class="card-details-list">
              <div class="card-detail-row">
                <span class="dt">⏱ 교육시간</span>
                <span class="dd">${hours}</span>
              </div>
              <div class="card-detail-row">
                <span class="dt">👥 교육대상</span>
                <span class="dd">${target}</span>
              </div>
              <div class="card-detail-row">
                <span class="dt">🏛 담당부서</span>
                <span class="dd">${dept}</span>
              </div>
            </div>

            <a href="${detailUrl}" class="card-action-btn">
              <span>상세보기 및 신청</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  // 8. Helper UI Functions
  function showLoading(isLoading) {
    if (!coursesContainer) return;
    if (isLoading) {
      coursesContainer.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">구글 시트에서 최신 직무연수 카탈로그를 불러오는 중입니다...</p>
        </div>
      `;
    }
  }

  function showError(msg) {
    if (!coursesContainer) return;
    coursesContainer.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-title" style="color: #dc2626;">연동 오류</h3>
        <p class="empty-desc">${escapeHtml(msg)}</p>
        <button type="button" class="btn-primary" onclick="location.reload()">
          <span>새로고침</span>
        </button>
      </div>
    `;
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

  // Expose reset trigger for inline button
  window.resetFiltersTrigger = resetAllFilters;

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
