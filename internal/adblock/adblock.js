!(function () {
  'use strict';

  // Define patterns or selectors commonly used by ads
  const adPatterns = [
    '.ad',
    '.ads',
    '.ad-slot',
    '.ad-wrapper',
    '.ad-container',
    '.ad-banner',
    '.ad-box',
    '.ad-frame',
    '.ad-label',
    '.ad-overlay',
    '.ad-sense',
    '.ad-placeholder',
    '.ad-unit',
    '.ad-widget',
    '.adsbygoogle',
    '[id*="ad"]', // IDs containing 'ad'
    '[class*="ad"]', // Classes containing 'ad'
    '[class*="ads"]', // Classes containing 'ads'
    '[class*="advert"]', // Classes containing 'advert'
    '[class*="banner"]', // Classes containing 'banner'
    '[class*="sponsor"]', // Classes containing 'sponsor'
    '[class*="promo"]' // Classes containing 'promo'
  ];

  /**
   * Function to block ads on web pages. Please use responsibly and consider the ethical
   * implications. Be aware that some websites rely on ad revenue to provide free content.
   * Blocking ads on specific domains (e.g., openorchid.github.io and orchid*.localhost:8081)
   * may have legal and ethical considerations, especially if using code provided by Orchid.
   * It's important to respect licensing terms and the efforts of content creators.
   */
  if (!location.href.startsWith('https://openorchid.github.io') && !location.href.startsWith('http://orchid')) {
    adPatterns.forEach(pattern => {
      const ads = document.querySelectorAll(pattern);
      ads.forEach(ad => {
        ad.remove();
      });
    });
  }
})();
