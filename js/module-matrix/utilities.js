/**
 * @file utilities.js
 * Utility functions for Module Matrix
 */

window.ModuleMatrix = window.ModuleMatrix || {};

window.ModuleMatrix.Utils = {

  /**
   * Get current filter query from input
   */
  getFilterQuery(filterInput) {
    return filterInput?.value.toLowerCase().trim() || '';
  },

  /**
   * Get selected values from checkbox group
   */
  getSelectedCheckboxValues(checkboxes) {
    return Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);
  },

  /**
   * Sort modules alphabetically by name
   */
  sortModulesByName(modules) {
    return modules.sort((a, b) => {
      const nameA = a.querySelector('.name-package')?.dataset.name?.toLowerCase() || '';
      const nameB = b.querySelector('.name-package')?.dataset.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  },

  /**
   * Sort module data objects alphabetically
   */
  sortModuleDataByName(moduleDataArray) {
    return moduleDataArray.sort((a, b) => {
      const nameA = a.element.querySelector('.name-package')?.dataset.name?.toLowerCase() || '';
      const nameB = b.element.querySelector('.name-package')?.dataset.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  },

  /**
   * Create DOM element with class and text content
   */
  createElement(tag, className, textContent = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  },

  /**
   * Create document fragment and append elements
   */
  createFragment(elements) {
    const fragment = document.createDocumentFragment();
    elements.forEach((element) => fragment.appendChild(element));
    return fragment;
  },

  /**
   * Clear container and append new elements
   */
  clearAndAppend(container, elements) {
    container.innerHTML = '';
    const fragment = this.createFragment(elements);
    container.appendChild(fragment);
  },

  /**
   * Merge elements from source to target based on selector
   */
  mergeElements(source, target, selector) {
    if (!source || !target) return;

    Array.from(source.querySelectorAll(selector)).forEach((element) => {
      if (!target.querySelector(`[data-package="${element.dataset.package}"]`)) {
        target.appendChild(element);
      }
    });
  },

  /**
   * Attach event listeners to multiple elements
   */
  attachEventListeners(elements, eventType, callback) {
    elements.forEach((element) => {
      element.addEventListener(eventType, callback);
    });
  },

  /**
   * Check if element matches multiple filter criteria
   */
  matchesAllFilters(tests) {
    return tests.every(test => test === true);
  },

  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Get module details from DOM element
   */
  getModuleDetails(moduleElement) {
    const namePackage = moduleElement.querySelector('.name-package');
    if (!namePackage) return null;

    return {
      name: namePackage.dataset.name?.toLowerCase() || '',
      description: namePackage.dataset.description?.toLowerCase() || '',
      package: namePackage.dataset.package || '',
      status: namePackage.dataset.status || '',
      lifecycle: namePackage.dataset.lifecycle || '',
      stability: namePackage.dataset.stability || '',
      date: namePackage.dataset.date || ''
    };
  },

  /**
   * Calculate total from object values
   */
  calculateTotal(obj) {
    return Object.values(obj).reduce((a, b) => a + b, 0);
  },

  /**
   * Toggle element visibility
   */
  toggleVisibility(element, show) {
    const { CLASSES } = window.ModuleMatrix.Constants;
    element.classList.toggle(CLASSES.hidden, !show);
  },

  /**
   * Update element active state
   */
  updateActiveState(element, isActive) {
    const { CLASSES } = window.ModuleMatrix.Constants;
    element.classList.toggle(CLASSES.active, isActive);
  }
};
