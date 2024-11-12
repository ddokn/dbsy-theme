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
  
    _createCarousel(config = null, event = null) {
      const currentConfig = this.carouselConfig;
      const _config = {
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="${className}" data-index="${index}">${(Array(2).join('0') + (index + 1)).slice(-2)}</span>`;
          },
        },
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
  
  // mainSlider 클래스를 SwiperCarousel로 상속받아 추가 기능을 구현
  class mainSlider extends SwiperCarousel {
    constructor() {
      super();
    }
  
    _createCarousel(config = null, event = null) {
      const currentConfig = this.carouselConfig;
      const _config = {
        spaceBetween: 0,
        loop: false,
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        speed: 1000,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="${className}" data-index="${index}">${(Array(2).join('0') + (index + 1)).slice(-2)}</span>`;
          },
        },
        ...config,
        ...currentConfig,
      };
      super._createCarousel(_config);
    }
  
    swiperSchema() {
      const schemaElement = this.querySelector('.swiperSchema');
      if (schemaElement) {
        return JSON.parse(schemaElement.textContent);
      }
      return {};
    }
  
    bannerEvent() {
      const schema = this.swiperSchema();
      return {
        on: {
          init: (swiper) => {
            // 초기화 시 이벤트
          },
          realIndexChange: (swiper) => {
            const idx = swiper.realIndex;
            const control = swiper.el.querySelector('.swiper-controls');
            if (control) control.style.setProperty('--color', schema[idx]?.color || 'defaultColor');
          },
          slideChangeTransitionStart: (swiper) => {
            const videos = swiper.el.querySelectorAll('video');
            videos.forEach(video => {
              video.pause();
            });
          },
          slideChangeTransitionEnd: (swiper) => {
            const activeIndex = swiper.activeIndex;
            const activeSlide = swiper.slides[activeIndex];
            if (activeSlide.querySelector('video')) {
              activeSlide.querySelector('video').play();
            }
          },
          resize: (swiper) => {
            // 리사이즈 이벤트 처리
          },
        },
      };
    }
  }
  customElements.define("main-slider", mainSlider);
  