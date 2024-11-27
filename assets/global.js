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

class mainSlider extends SwiperCarousel {
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
            return '<span class="' + className + '"></span>'; // 텍스트 없이 기본 bullet 생성
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
customElements.define("main-slider", mainSlider);

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

// 초기 실행
document.addEventListener('DOMContentLoaded', () => {
  setModal();
  observeDOM();
});

class mainModal extends HTMLElement {
  constructor() {
    super();
    this.backdrop = null;
    this.querySelectorAll('.modal-close').forEach(item => {
      item.addEventListener('click', this.close.bind(this));
    });
    if (this.dataset.forceOpen && this.dataset.forceOpen.toLowerCase() === 'true') {
      this.open();
    }
  }
  
  toggleBackdrop(show = true) {
    // 기존 backdrop이 있다면 제거
    const existingBackdrop = document.querySelector('.toast-backdrop');
    if (existingBackdrop) {
      existingBackdrop.remove();
    }

    if (show) {
      const backdrop = document.createElement('div');
      backdrop.className = 'toast-backdrop';
      document.body.appendChild(backdrop); // body에 직접 추가
      this.backdrop = backdrop;
      backdrop.addEventListener('click', this.close.bind(this));
    } else if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }
  }
  
  open() {
    this.toggleBackdrop(true);
    this.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  close() {
    this.toggleBackdrop(false);
    this.classList.add('hidden');
    document.body.style.overflow = '';
  }
}
customElements.define("main-modal", mainModal);