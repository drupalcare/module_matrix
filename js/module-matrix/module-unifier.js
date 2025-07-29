/**
 * @file module-unifier.js
 * Module container unification logic
 */

window.ModuleMatrix = window.ModuleMatrix || {};

window.ModuleMatrix.ModuleUnifier = {

  /**
   * Unify multiple module matrix wrappers into single interface
   */
  unifyModuleMatrix(wrapperSelector) {
    const { SELECTORS } = window.ModuleMatrix.Constants;

    const systemModules = document.querySelector('form.system-modules');
    if (!systemModules) return null;

    const wrappers = Array.from(document.querySelectorAll(wrapperSelector));
    if (wrappers.length === 0) return null;

    const allModuleWrappers = this.extractModuleWrappers(wrappers, systemModules);
    const mainWrapper = allModuleWrappers[0];

    if (!mainWrapper) return null;

    // Remove original wrappers
    wrappers.forEach(wrapper => wrapper.remove());

    const mainSidebar = mainWrapper.querySelector(SELECTORS.sidebarSelector);
    const mainList = mainWrapper.querySelector(SELECTORS.listSelector);

    if (!mainSidebar || !mainList) return null;

    // Merge additional wrappers into main wrapper
    this.mergeAdditionalWrappers(allModuleWrappers.slice(1), mainSidebar, mainList);

    return mainWrapper;
  },

  /**
   * Extract module wrappers from package wrappers
   */
  extractModuleWrappers(wrappers, systemModules) {
    const { SELECTORS } = window.ModuleMatrix.Constants;
    const moduleWrappers = [];

    wrappers.forEach(wrapper => {
      const moduleWrapper = wrapper.querySelector(SELECTORS.moduleWrapper);
      if (moduleWrapper) {
        systemModules.appendChild(moduleWrapper);
        moduleWrappers.push(moduleWrapper);
      }
    });

    return moduleWrappers;
  },

  /**
   * Merge additional wrappers into main wrapper
   */
  mergeAdditionalWrappers(additionalWrappers, mainSidebar, mainList) {
    additionalWrappers.forEach(wrapper => {
      this.mergeWrapperElements(wrapper, mainSidebar, mainList);
      wrapper.remove();
    });
  },

  /**
   * Merge elements from source wrapper into target elements
   */
  mergeWrapperElements(sourceWrapper, targetSidebar, targetList) {
    const { SELECTORS } = window.ModuleMatrix.Constants;
    const { Utils } = window.ModuleMatrix;

    const sourceSidebar = sourceWrapper.querySelector(SELECTORS.sidebarSelector);
    const sourceList = sourceWrapper.querySelector(SELECTORS.listSelector);

    if (sourceSidebar) {
      Utils.mergeElements(sourceSidebar, targetSidebar, 'a');
    }

    if (sourceList) {
      Utils.mergeElements(sourceList, targetList, SELECTORS.moduleItem);
    }
  },

  /**
   * Validate unified wrapper structure
   */
  validateUnifiedWrapper(wrapper) {
    const { SELECTORS } = window.ModuleMatrix.Constants;

    const requiredElements = [
      SELECTORS.sidebarSelector,
      SELECTORS.listSelector
    ];

    return requiredElements.every(selector =>
      wrapper.querySelector(selector) !== null
    );
  },

  /**
   * Count total modules in unified wrapper
   */
  countModulesInWrapper(wrapper) {
    const { SELECTORS } = window.ModuleMatrix.Constants;
    return wrapper.querySelectorAll(SELECTORS.moduleItem).length;
  },

  /**
   * Get all package names from unified wrapper
   */
  getPackageNamesFromWrapper(wrapper) {
    const { SELECTORS } = window.ModuleMatrix.Constants;
    const packageSet = new Set();

    wrapper.querySelectorAll(SELECTORS.namePackage).forEach(element => {
      if (element.dataset.package) {
        packageSet.add(element.dataset.package);
      }
    });

    return Array.from(packageSet).sort();
  },

  /**
   * Check if wrapper contains modules
   */
  hasModules(wrapper) {
    const { SELECTORS } = window.ModuleMatrix.Constants;
    return wrapper.querySelectorAll(SELECTORS.moduleItem).length > 0;
  }
};
