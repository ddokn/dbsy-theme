/**
 * SwiperCarousel - Swiper 라이브러리를 활용한 캐러셀 컴포넌트
 * 
 * @property {Object} carouselConfig - data-config 속성을 통해 전달되는 Swiper 설정
 * @property {Swiper} carouselInstance - 생성된 Swiper 인스턴스
 */
class SwiperCarousel extends HTMLElement {
  constructor() {
    super();
    this.style.display = 'block';
    this.swiper = null;
    this._createCarousel();
  }

  get carouselConfig() {
    return this.dataset.config ? JSON.parse(this.dataset.config) : {};
  }

  get carouselInstance() {
    return this.swiper;
  }

  _createCarousel(config = null) {
    const currentConfig = this.carouselConfig;
    const defaultConfig = {
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: (index, className) => 
          `<span class="${className}" data-index="${index}">${(Array(2).join('0') + (index + 1)).slice(-2)}</span>`
      }
    };

    const _config = {
      ...defaultConfig,
      ...config,
      ...currentConfig
    };

    const swiperElement = this.querySelector('.swiper');
    if (swiperElement) {
      this.swiper = new Swiper(swiperElement, _config);
    } else {
      console.error('Swiper element not found!');
    }
  }
}
customElements.define("swiper-carousel", SwiperCarousel);

/**
 * MainSlider - 메인 페이지의 슬라이더 컴포넌트
 * 무한 루프와 자동 재생 기능이 포함된 확장된 SwiperCarousel
 * 
 * @extends SwiperCarousel
 */
class MainSlider extends SwiperCarousel {
  _createCarousel(config = null) {
    const swiperWrapper = this.querySelector('.swiper-wrapper');
    const originalSlides = Array.from(this.querySelectorAll('.swiper-slide'));
    
    // 원본 슬라이드를 복제하여 앞뒤로 추가
    originalSlides.forEach(slide => {
      const cloneBefore = slide.cloneNode(true);
      const cloneAfter = slide.cloneNode(true);
      swiperWrapper.insertBefore(cloneBefore, swiperWrapper.firstChild);
      swiperWrapper.appendChild(cloneAfter);
    });

    const slideCount = originalSlides.length; // 실제 슬라이드 개수

    const mainConfig = {
      spaceBetween: 10,
      loop: true,
      speed: 500,
      centeredSlides: true,
      slidesPerView: "auto",
      loopedSlides: slideCount, // 총 슬라이드 개수
      lazy: {
        loadPrevNext: true,
        loadOnTransitionStart: true
      },
      breakpoints: {
        767: {
          slidesPerView: 1.2,
        },
        990: {
          slidesPerView: 1.2,
        },
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
          // 실제 슬라이드 개수만 반영
          if (index < slideCount) {
            return '<span class="' + className + '"></span>';
          }
          return ''; // 복제된 슬라이드에 대한 bullet은 생성하지 않음
        }
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      on: {
        init: function(swiper) {
          // 초기화 시 realIndex에 따라 active 상태 설정
          swiper.pagination.bullets.forEach((bullet, index) => {
            if (index === swiper.realIndex) {
              bullet.classList.add('swiper-pagination-bullet-active');
            } else {
              bullet.classList.remove('swiper-pagination-bullet-active');
            }
          });
        },
        slideChange: function(swiper) {
          // 슬라이드 변경 시 realIndex에 따라 active 상태 설정
          swiper.pagination.bullets.forEach((bullet, index) => {
            // realIndex를 사용하여 active 상태를 업데이트
            if (index === swiper.realIndex % slideCount) {
              bullet.classList.add('swiper-pagination-bullet-active');
            } else {
              bullet.classList.remove('swiper-pagination-bullet-active');
            }
          });
        }
      }
    };
    super._createCarousel({ ...mainConfig, ...config });
  }

  swiperSchema() {
    const schemaElement = this.querySelector('.swiperSchema');
    return schemaElement ? JSON.parse(schemaElement.textContent) : {};
  }

  bannerEvent() {
    const schema = this.swiperSchema();
    return {
      on: {
        realIndexChange: (swiper) => {
          const control = swiper.el.querySelector('.swiper-controls');
          control?.style.setProperty('--color', schema[swiper.realIndex]?.color || 'defaultColor');
        },
        slideChangeTransitionStart: (swiper) => {
          swiper.el.querySelectorAll('video').forEach(video => video.pause());
        },
        slideChangeTransitionEnd: (swiper) => {
          const video = swiper.slides[swiper.activeIndex].querySelector('video');
          video?.play();
        }
      }
    };
  }
}
customElements.define("main-slider", MainSlider);

/**
 * HeaderDropdownMenu - 헤더의 드롭다운 메뉴를 관리하는 컴포넌트
 * 마우스 호버 시 서브메뉴 표시/숨김 처리
 */
class HeaderDropdownMenu extends HTMLElement {
  constructor() {
    super();
    this.menuItems = [];
    this.subMenus = [];
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  connectedCallback() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }

    this.observer = new MutationObserver(() => this.init());
    this.observer.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    // 컴포넌트 제거 시 옵저버 해제
    this.observer?.disconnect();
    
    // 이벤트 리스너 정리
    this.menuItems?.forEach(item => {
      item.removeEventListener('mouseenter', () => this.toggleMenu(item, true));
      item.removeEventListener('mouseleave', () => this.toggleMenu(item, false));
    });
  }

  init() {
    this.menuItems = Array.from(this.getElementsByClassName('menu__item'));
    this.subMenus = Array.from(this.getElementsByClassName('menu__submenu'));

    this.menuItems.forEach(item => {
      item.addEventListener('mouseenter', () => this.toggleMenu(item, true));
      item.addEventListener('mouseleave', () => this.toggleMenu(item, false));
    });
  }

  toggleMenu(item, shouldShow) {
    this.subMenus.forEach(menu => menu.classList.remove('menu__submenu--show'));
    this.menuItems.forEach(menuItem => {
      menuItem.querySelector('.menu__link')?.classList.remove('menu__link--active');
    });

    if (shouldShow) {
      const subMenu = item.querySelector('.menu__submenu');
      const menuLink = item.querySelector('.menu__link');
      subMenu?.classList.add('menu__submenu--show');
      menuLink?.classList.add('menu__link--active');
    }
  }
}
customElements.define('header-dropdown-menu', HeaderDropdownMenu);

/**
 * MobileMenu - 모바일 환경의 메뉴를 관리하는 컴포넌트
 * 햄버거 메뉴 클릭 시 사이드 메뉴 표시/숨김 및 서브메뉴 토글 처리
 */
class MobileMenu extends HTMLElement {
  constructor() {
    super();
    this.init = this.initializeMenu.bind(this);
    this.observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) this.init();
      });
    });
  }

  initializeMenu() {
    this.menuList = document.querySelector('.menu__list');
    this.menuItems = Array.from(document.querySelectorAll('.menu__item--has-submenu'));

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.addEventListener('click', this.handleMenuButtonClick.bind(this));

    this.menuItems.forEach(item => {
      const link = item.querySelector('.menu__link');
      link?.addEventListener('click', this.handleSubmenuClick.bind(this, item));
    });

    this.menuList?.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  handleMenuButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.toggleMobileMenu();
  }

  handleSubmenuClick(item, e) {
    if (window.innerWidth < 990) {
      e.preventDefault();
      e.stopPropagation();
      this.toggleSubMenu(item);
    }
  }

  handleDocumentClick(e) {
    const isClickInsideButton = this.contains(e.target);
    const isClickInsideMenu = this.menuList?.contains(e.target);
    
    if (!isClickInsideButton && !isClickInsideMenu && this.menuList?.classList.contains('menu__list--visible')) {
      this.closeAllMenus();
    }
  }

  connectedCallback() {
    const snippetContainer = this.querySelector('[data-snippet="header-menu"]');
    snippetContainer && this.observer.observe(snippetContainer, {
      childList: true,
      subtree: true
    });
  }

  toggleMobileMenu() {
    const isVisible = this.menuList?.classList.contains('menu__list--visible');
    isVisible ? this.closeAllMenus() : this.openMenu();
  }

  openMenu() {
    this.menuList?.classList.add('menu__list--visible');
    this.classList.add('header__mobile-menu--active');
  }

  toggleSubMenu(item) {
    const subMenu = item.querySelector('.menu__submenu');
    const link = item.querySelector('.menu__link');

    this.menuItems.forEach(menuItem => {
      if (menuItem !== item) {
        menuItem.querySelector('.menu__submenu')?.classList.remove('menu__submenu--show');
        menuItem.querySelector('.menu__link')?.classList.remove('menu__link--active');
      }
    });

    subMenu?.classList.toggle('menu__submenu--show');
    link?.classList.toggle('menu__link--active');
  }

  closeAllMenus() {
    this.menuList?.classList.remove('menu__list--visible');
    this.classList.remove('header__mobile-menu--active');
    document.querySelectorAll('.menu__submenu').forEach(menu => {
      menu.classList.remove('menu__submenu--show');
    });
    document.querySelectorAll('.menu__link').forEach(link => {
      link.classList.remove('menu__link--active');
    });
  }
}
customElements.define('mobile-menu-button', MobileMenu);

/**
 * MainTab - 탭 기반의 콘텐츠 전환을 관리하는 컴포넌트
 * 
 * @fires tab:changed - 탭이 변경될 때 발생하는 이벤트
 * @property {number} detail.tabIndex - 선택된 탭의 인덱스
 */
class MainTab extends HTMLElement {
  constructor() {
      super();
      this.tabButton = this.querySelectorAll('.tab-item a');
      this.tabBody = this.querySelectorAll('.tab-body');
      this.init();
  }
  init() {
      this.tabButton.forEach(item => {
          item.addEventListener('click', this.setTab.bind(this));
      });
      this.tabBody.forEach((item, index) => {
          item.classList.toggle('hidden', index !== 0);
      })
  }
  setTab(event) {
      event.preventDefault();
      const index = parseInt(event.currentTarget.dataset.index);
      console.log(index)
      this.tabButton.forEach((item, idx) => {
          item.classList.toggle('active', idx === index);
      })
      this.tabBody.forEach((item, idx) => {
          item.classList.toggle('hidden', idx !== index);
      });
      const changeEvent = new CustomEvent('tab:changed', { detail: { tabIndex: index } });
      this.dispatchEvent(changeEvent);
  }
}
customElements.define('main-tab', MainTab);

const warnedTargets = new Set();
const setModal = () => {
  try {
    const processedElements = new Set();

    const open = document.querySelectorAll('[data-modal-open]');
    open.forEach(item => {
        if (processedElements.has(item)) return;
        
        const targetId = item.dataset.modalOpen;
        const target = document.getElementById(targetId);
        
        if (target) {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                target.open();
            });
            processedElements.add(item);
        } else if (targetId && !warnedTargets.has(targetId)) {
            console.warn(`Modal target not found: ${targetId}`);
            warnedTargets.add(targetId);
        }
    });

    const close = document.querySelectorAll('[data-modal-close]');
    close.forEach(item => {
        if (processedElements.has(item)) return;
        
        const targetId = item.dataset.modalClose;
        const target = document.getElementById(targetId);
        
        if (target) {
            item.addEventListener('click', (event) => {
                event.preventDefault();
                target.close();
            });
            processedElements.add(item);
        } else if (targetId && !warnedTargets.has(targetId)) {
            console.warn(`Modal target not found: ${targetId}`);
            warnedTargets.add(targetId);
        }
    });
  } catch (error) {
    console.error('모달 설정 중 오류 발생:', error);
  }
}

const observeDOM = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        setModal();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

/**
 * MainModal - 모달 다이얼로그를 관리하는 컴포넌트
 * 백드롭 처리 및 모달 표시/숨김 기능 포함
 */
class MainModal extends HTMLElement {
    constructor() {
        super();
        this.setAttribute('role', 'dialog');
        this.setAttribute('aria-modal', 'true');
        this.backdrop = null;
        this.querySelectorAll('.modal-close').forEach(item => {
            item.addEventListener('click', this.close.bind(this));
        });
    }

    connectedCallback() {
        const modalId = this.id;
        const openButtons = document.querySelectorAll(`[data-modal-open="${modalId}"]`);
        
        openButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.open(this);
            });
        });

        if (this.dataset.forceOpen && this.dataset.forceOpen.toLowerCase() === 'true') {
            this.open();
        }
    }

    toggleBackdrop(show = true) {
        const existingBackdrop = document.querySelector('.toast-backdrop');
        if (existingBackdrop) {
            existingBackdrop.remove();
        }

        if (show) {
            const backdrop = document.createElement('div');
            backdrop.className = 'toast-backdrop';
            document.body.appendChild(backdrop);
            this.backdrop = backdrop;
            backdrop.addEventListener('click', this.close.bind(this));
        } else if (this.backdrop) {
            this.backdrop.remove();
            this.backdrop = null;
        }
    }
    
    open() {
        if ( this.id != 'modalSearch') {
          this.toggleBackdrop(true);
        } 
        this.classList.remove('hidden');
        this.setAttribute('aria-hidden', 'false');
        // 포커스 트랩 추가
        this.querySelector('.modal-close')?.focus();
    }

    close() {
        if ( this.id != 'modalSearch') {
          this.toggleBackdrop(false);
        }
        this.classList.add('hidden');
        this.setAttribute('aria-hidden', 'true');
    }
}

customElements.define("main-modal", MainModal);

/**
 * ArticleListFilter - 게시글 목록의 그리드/리스트 뷰 전환을 담당하는 컴포넌트
 * 
 * @fires viewChange - 뷰 모드가 변경될 때 발생하는 이벤트
 * @property {string} detail.mode - 'grid' 또는 'list'
 * <article-list-filter>
 *  <div class="filter-group page-width">
 *      <a class="button button--primary active" href="#">그리드</a>
 *      <a class="button button--primary" href="#">리스트</a>
 *  </div>
 * </article-list-filter>
 */
class ArticleListFilter extends HTMLElement {
  constructor() {
      super();
      this.filterGroup = this.querySelector(".filter-group");
      this.filterItems = this.filterGroup?.querySelectorAll("a");
      this.cardWrapper = document.querySelector(".article-list-card");
  }

  connectedCallback() {
      this.initializeFilters();
  }

  initializeFilters() {
      if (!this.filterItems) return;

      this.filterItems.forEach(item => {
          item.addEventListener("click", (e) => {
              e.preventDefault();
              this.handleFilterClick(e.target);
          });
      });
  }

  handleFilterClick(target) {
      this.filterItems.forEach(item => {
          item.classList.remove('active');
      });

      target.classList.add('active');

      if (target.textContent === '그리드') {
          this.cardWrapper.classList.remove('list-view');
      } else if (target.textContent === '리스트') {
          this.cardWrapper.classList.add('list-view');
      }

      this.dispatchEvent(new CustomEvent('viewChange', {
          detail: {
              mode: target.textContent === '그리드' ? 'grid' : 'list'
          },
          bubbles: true
      }));
  }
}
customElements.define('article-list-filter', ArticleListFilter);

/**
 * 댓글 답글 기능 이벤트 핸들러
 * 답글 버튼 클릭 시 해당 댓글의 답글 폼을 토글하는 기능
 * 
 * @listens click - document 레벨에서 이벤트 위임을 통해 처리
 * @param {Event} e - 클릭 이벤트 객체
 * 
 * 사용 예시:
 * <button class="reply-button">답글</button>
 * <form class="form-report hidden">
 *   <!-- 답글 입력 폼 내용 -->
 * </form>
 */
document.addEventListener('click', function(e) {
    const replyButton = e.target.closest('.reply-button');
    if (!replyButton) return;
    
    e.preventDefault();
    const form = replyButton.nextElementSibling;
    if (form?.classList.contains('form-report')) {
        form.classList.toggle('hidden');
    }
});

/**
 * 공유 링크 복사 기능
 * 클립보드에 현재 URL을 복사하고 토스트 메시지를 표시
 * 
 * @listens click - 공유 링크 복사 버튼 클릭 이벤트
 * 
 * 사용 예시:
 * <button class="share-link-copy">
 *   <svg>...</svg>
 *   <span>링크 복사</span>
 * </button>
 * 
 */
document.addEventListener('click', function(e) {
    const copyButton = e.target.closest('.share-link-copy');
    if (!copyButton) return;
    
    e.preventDefault();
    
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
        .then(() => {
            showToast('주소가 복사되었습니다.', 3000);
        })
        .catch(err => {
            console.error('클립보드 복사 실패:', err);
        });
});

/**
 * 날짜 선택기 초기화 함수
 * flatpickr 라이브러리를 ��용하여 날짜와 시간 선택 기능을 구현
 * 
 * @requires flatpickr
 * @fires flatpickr#onReady - 날짜 선택기가 초기화될 때 발생
 * 
 * 사용 예시:
 * <div data-section="article-write">
 *   <input type="text" id="datePicker" />
 * </div>
 */
const initDatePicker = () => {
    const articleWriteSection = document.querySelector('[data-section="article-write"]');
    if (!articleWriteSection) return;

    const startDatePicker = articleWriteSection.querySelector('#startDatePicker');
    if (startDatePicker && !startDatePicker.initialized) {
        flatpickr(startDatePicker, {
            locale: "ko",
            dateFormat: "Y-m-d H:i",
            enableTime: true,
            time_24hr: true,
            minuteIncrement: 30,
            defaultHour: 12,
            disableMobile: true
        });
        startDatePicker.initialized = true;
    }

    const endDatePicker = articleWriteSection.querySelector('#endDatePicker');
    if (endDatePicker && !endDatePicker.initialized) {
        flatpickr(endDatePicker, {
            locale: "ko",
            dateFormat: "Y-m-d H:i",
            enableTime: true,
            time_24hr: true,
            minuteIncrement: 30,
            defaultHour: 12,
            disableMobile: true
        });
        endDatePicker.initialized = true;
    }
};

/**
 * TinyMCE 에디터 초기화 함수
 * 게시글 작성을 위한 WYSIWYG 에디터를 구현
 * 
 * @requires TinyMCE
 * @param {string} selector - 에디터를 적용할 텍스트 영역의 선택자 (#mytextarea)
 * 
 * 사용 예시:
 * <div data-section="article-write">
 *   <textarea id="mytextarea"></textarea>
 * </div>
 */
const initTinyMCE = () => {
    const articleWriteSection = document.querySelector('[data-section="article-write"]');
    if (!articleWriteSection) return;

    const textEditor = articleWriteSection.querySelector('#mytextarea');
    if (textEditor && !textEditor.initialized) {
        tinymce.init({
            selector: '#mytextarea',
            height: 500,
            plugins: ['advlist', 'autolink', 'lists', 'link', 'image'],
            toolbar: 'undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | link image | forecolor backcolor | code'
        });
        textEditor.initialized = true;
    }
};

const initEditors = () => {
    // 디바운스 추가
    let debounceTimer;
    const observer = new MutationObserver((mutations) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const startDatePickerElement = document.querySelector('#startDatePicker');
            const endDatePickerElement = document.querySelector('#endDatePicker');
            const textEditorElement = document.querySelector('#mytextarea');

            if (startDatePickerElement && !startDatePickerElement.initialized) {
                initDatePicker();
            }
            if (endDatePickerElement && !endDatePickerElement.initialized) {
                initDatePicker();
            }
            if (textEditorElement && !textEditorElement.initialized) {
                initTinyMCE();
            }
        }, 100);
    });

    // 옵저버 연결 해제 로직 추가
    const cleanup = () => {
        observer.disconnect();
        clearTimeout(debounceTimer);
    };

    // DOM 관찰 시작
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false // 불필요한 속성 변경 감지 제외
    });

    // 초기 로드 확인
    const startDatePickerElement = document.querySelector('#startDatePicker');
    const endDatePickerElement = document.querySelector('#endDatePicker');
    const textEditorElement = document.querySelector('#mytextarea');
    
    if (startDatePickerElement) initDatePicker();
    if (endDatePickerElement) initDatePicker();
    if (textEditorElement) initTinyMCE();

    return cleanup; // 정리 함수 반환
};

// 전역 변수로 저장하여 필요시 정리 가능하도록
window._editorCleanup = initEditors();

/**
 * 툴팁 기능 구현
 * 트리거 요소 클릭 시 툴팁을 토글하는 이벤트 핸들러
 * 
 * @listens click - 툴팁 트리거 요소의 클릭 이벤트
 * 
 * 사용 예시:
 * <button class="tooltip-trigger">도움말</button>
 * <div class="tooltip">툴팁 내용</div>
 */
document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    const tooltip = trigger.nextElementSibling;
    // 툴팁의 가시성 토글
    tooltip.style.visibility = tooltip.style.visibility === 'visible' ? 'hidden' : 'visible';
    // 툴팁의 투명도 토글 (페이드 효과)
    tooltip.style.opacity = tooltip.style.opacity === '1' ? '0' : '1';
  });
});


/**
 * 화면에 토스트 메시지를 표시하는 함수
 * 
 * @param {string} message - 표시할 토스트 메시지 내용
 * @param {number} [duration=3000] - 토스트 메시지가 표시될 시간(밀리초)
 * 
 * @example
 * // 기본 3초 동안 메시지 표시
 * showToast('저장되었습니다');
 * 
 * // 5초 동안 메시지 표시
 * showToast('업로드 완료', 5000);
 * 
 * @description
 * - 새로운 토스트 메시지가 표시될 때 기존 메시지는 자동으로 제거됨
 * - 토스트 메시지는 지정된 시간이 지나면 자동으로 사라짐
 * - .toast-message 클래스를 사용하여 스타일링 가능
 */
function showToast(message, duration = 3000) {
    // 기존 토스트 메시지가 있다면 제거
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }

    // 새로운 토스트 메시지 생성
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 지정된 시간 후 토스트 메시지 제거
    setTimeout(() => {
        toast.remove();
    }, duration);
}
