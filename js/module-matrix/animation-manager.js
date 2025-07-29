/**
 * @file animation-manager.js
 * Animation and transition management
 */

window.ModuleMatrix = window.ModuleMatrix || {};

window.ModuleMatrix.AnimationManager = {

  /**
   * Animate visible modules in the list
   */
  animateVisibleModules(mainList) {
    const { SELECTORS, CLASSES } = window.ModuleMatrix.Constants;
    const visibleModules = mainList.querySelectorAll(`${SELECTORS.moduleItem}:not(.${CLASSES.hidden})`);

    visibleModules.forEach(module => {
      this.animateModule(module);
    });
  },

  /**
   * Animate individual module
   */
  animateModule(module) {
    const { CLASSES } = window.ModuleMatrix.Constants;

    module.classList.add(CLASSES.animate);

    module.addEventListener('animationend', () => {
      module.classList.remove(CLASSES.animate);
    }, { once: true });
  },

  /**
   * Initialize expandable details animation
   */
  initializeDetailsAnimation() {
    const { SELECTORS } = window.ModuleMatrix.Constants;
    const detailsElements = document.querySelectorAll(SELECTORS.moduleDetails);

    detailsElements.forEach(details => {
      this.setupDetailsElement(details);
    });
  },

  /**
   * Setup individual details element for animation
   */
  setupDetailsElement(details) {
    const { SELECTORS } = window.ModuleMatrix.Constants;
    const header = details.querySelector(SELECTORS.detailsHeader);
    const content = details.querySelector(SELECTORS.detailsContent);

    if (!header || !content) return;

    header.addEventListener('click', () => {
      this.toggleDetailsElement(details, header, content);
    });
  },

  /**
   * Toggle details element open/closed with animation
   */
  toggleDetailsElement(details, header, content) {
    const { CLASSES } = window.ModuleMatrix.Constants;
    const isOpen = details.classList.toggle(CLASSES.open);

    header.setAttribute('aria-expanded', isOpen.toString());

    if (isOpen) {
      this.expandDetails(content);
    } else {
      this.collapseDetails(content);
    }
  },

  /**
   * Expand details content with smooth animation
   */
  expandDetails(content) {
    content.style.height = content.scrollHeight + 'px';

    content.addEventListener('transitionend', function onExpand() {
      content.style.height = 'auto';
      content.removeEventListener('transitionend', onExpand);
    });
  },

  /**
   * Collapse details content with smooth animation
   */
  collapseDetails(content) {
    content.style.height = content.scrollHeight + 'px';

    requestAnimationFrame(() => {
      content.style.height = '0px';
    });
  },

  /**
   * Animate module list transitions
   */
  animateListTransition(mainList, callback) {
    const { SELECTORS } = window.ModuleMatrix.Constants;
    const modules = mainList.querySelectorAll(SELECTORS.moduleItem);

    // Add transition class to all modules
    modules.forEach(module => {
      module.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';
    });

    // Execute callback after brief delay
    setTimeout(() => {
      if (callback) callback();

      // Remove transition after animation
      setTimeout(() => {
        modules.forEach(module => {
          module.style.transition = '';
        });
      }, 200);
    }, 50);
  },

  /**
   * Fade in elements
   */
  fadeIn(elements, duration = 300) {
    const elementsArray = Array.isArray(elements) ? elements : [elements];

    elementsArray.forEach(element => {
      element.style.opacity = '0';
      element.style.transition = `opacity ${duration}ms ease-in-out`;

      requestAnimationFrame(() => {
        element.style.opacity = '1';
      });

      setTimeout(() => {
        element.style.transition = '';
      }, duration);
    });
  },

  /**
   * Fade out elements
   */
  fadeOut(elements, duration = 300) {
    const elementsArray = Array.isArray(elements) ? elements : [elements];

    return new Promise(resolve => {
      elementsArray.forEach((element, index) => {
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';

        if (index === elementsArray.length - 1) {
          setTimeout(() => {
            element.style.transition = '';
            resolve();
          }, duration);
        }
      });
    });
  },

  /**
   * Slide down animation
   */
  slideDown(element, duration = 300) {
    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease-in-out`;

    requestAnimationFrame(() => {
      element.style.height = element.scrollHeight + 'px';
    });

    setTimeout(() => {
      element.style.height = 'auto';
      element.style.overflow = '';
      element.style.transition = '';
    }, duration);
  },

  /**
   * Slide up animation
   */
  slideUp(element, duration = 300) {
    element.style.height = element.offsetHeight + 'px';
    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease-in-out`;

    requestAnimationFrame(() => {
      element.style.height = '0px';
    });

    setTimeout(() => {
      element.style.overflow = '';
      element.style.transition = '';
    }, duration);
  },

  /**
   * Staggered animation for multiple elements
   */
  staggerAnimation(elements, animationClass, staggerDelay = 50) {
    const elementsArray = Array.from(elements);

    elementsArray.forEach((element, index) => {
      setTimeout(() => {
        this.animateModule(element);
      }, index * staggerDelay);
    });
  },

  /**
   * Check if animations are supported
   */
  supportsAnimations() {
    const testElement = document.createElement('div');
    return 'animationName' in testElement.style || 'webkitAnimationName' in testElement.style;
  },

  /**
   * Disable animations (for accessibility)
   */
  disableAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }
};
