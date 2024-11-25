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
    const mainConfig = {
      spaceBetween: 0,
      loop: false,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 1000,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
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
        init: () => {},
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
        },
        resize: () => {}
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