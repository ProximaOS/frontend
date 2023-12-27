(function (exports) {
  'use strict';

  const Slideshow = {
    slides: [
      {
        title: 'Try OrchidOS!',
        detail: 'Check out OrchidOS beta',
        links: [
          {
            href: '#',
            recommend: true,
            label: 'Get'
          },
          {
            href: '#',
            label: 'Learn More'
          }
        ]
      },
      {
        title: 'Get OrchidOS!',
        detail: 'Check out OrchidOS beta'
      },
      {
        title: 'Code for OrchidOS!',
        detail: 'Check out OrchidOS beta'
      }
    ],

    slideshowElement: document.getElementById('slideshow'),
    slideshowDots: document.getElementById('slideshow-dots'),
    previousButton: document.getElementById('slideshow-previous-button'),
    nextButton: document.getElementById('slideshow-next-button'),

    timeoutID: null,
    slideIndex: 0,

    init: function () {
      this.createSlides();
      this.showSlides(this.slideIndex);

      this.previousButton.addEventListener('click', () => this.plusSlides(-1));
      this.nextButton.addEventListener('click', () => this.plusSlides(1));
    },

    createSlides: function () {
      this.slides.forEach((slide, index) => {
        const element = document.createElement('div');
        element.classList.add('slideshow');

        const artwork = document.createElement('div');
        artwork.classList.add('artwork');
        element.appendChild(artwork);

        const textHolder = document.createElement('div');
        textHolder.classList.add('text-holder');
        element.appendChild(textHolder);

        const title = document.createElement('h1');
        title.classList.add('title');
        title.textContent = slide.title;
        textHolder.appendChild(title);

        const detail = document.createElement('p');
        detail.classList.add('detail');
        detail.textContent = slide.detail;
        textHolder.appendChild(detail);

        const nav = document.createElement('nav');
        textHolder.appendChild(nav);

        if (slide.links) {
          for (let index = 0, length = slide.links.length; index < length; index++) {
            const link = slide.links[index];

            const linkElement = document.createElement('a');
            linkElement.href = link.href;
            linkElement.textContent = link.label;
            if (link.recommend) {
              linkElement.classList.add('recommend');
            }
            nav.appendChild(linkElement);
          }
        }

        const dot = document.createElement('button');
        dot.classList.add('dot');
        dot.addEventListener('click', () => this.currentSlide(index));

        this.slideshowElement.appendChild(element);
        this.slideshowDots.appendChild(dot);
      });
    },

    plusSlides: function (n) {
      this.showSlides(this.slideIndex + n);
    },

    currentSlide: function (n) {
      this.showSlides(n);
    },

    showSlides: function (n) {
      const slides = document.getElementsByClassName('slideshow');
      const dots = document.getElementsByClassName('dot');

      slides[this.slideIndex].classList.remove('active');
      dots[this.slideIndex].classList.remove('active');

      this.slideIndex = (n + slides.length) % slides.length;

      slides[this.slideIndex].classList.remove('previous', 'next');
      slides[this.slideIndex].classList.add('active');
      dots[this.slideIndex].classList.add('active');

      const previousIndex = (this.slideIndex - 1 + slides.length) % slides.length;
      slides[previousIndex].classList.remove('next', 'previous');
      slides[previousIndex].classList.add('previous');

      const nextIndex = (this.slideIndex + 1) % slides.length;
      slides[nextIndex].classList.remove('previous', 'next');
      slides[nextIndex].classList.add('next');

      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(() => this.showSlides(this.slideIndex + 1), 4000);
    }
  };

  Slideshow.init();
})(window);
