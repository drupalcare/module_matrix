/**
 * @file data-manager.js
 * Module data initialization and management
 */

window.ModuleMatrix = window.ModuleMatrix || {};

window.ModuleMatrix.DataManager = {

  /**
   * Initialize module data from unified wrapper
   */
  initializeModuleData(wrapper) {
    const { SELECTORS, DEFAULTS, DATA_STRUCTURE } = window.ModuleMatrix.Constants;
    const data = { ...DATA_STRUCTURE };

    const moduleList = wrapper.querySelector(SELECTORS.listSelector);
    if (!moduleList) return data;

    const moduleItems = Array.from(moduleList.querySelectorAll(SELECTORS.moduleItem));

    moduleItems.forEach((item) => {
      this.processModuleItem(item, data);
    });

    return data;
  },

  /**
   * Process individual module item and update data
   */
  processModuleItem(item, data) {
    const { SELECTORS, DEFAULTS } = window.ModuleMatrix.Constants;
    const namePackage = item.querySelector(SELECTORS.namePackage);

    if (!namePackage) return;

    const moduleInfo = this.extractModuleInfo(namePackage);
    const isEnabled = parseInt(moduleInfo.status) === DEFAULTS.enabledStatus;

    this.updateModuleCounts(data, moduleInfo.packageName, isEnabled);
    this.addModuleToCollection(data, item, moduleInfo);
  },

  /**
   * Extract module information from namePackage element
   */
  extractModuleInfo(namePackage) {
    const { DEFAULTS } = window.ModuleMatrix.Constants;

    return {
      packageName: namePackage.dataset.package || DEFAULTS.unknownPackage,
      name: namePackage.textContent.trim() || '',
      status: namePackage.dataset.status || '',
      date: namePackage.dataset.date || '',
      stability: namePackage.dataset.stability || '',
      lifecycle: namePackage.dataset.lifecycle || ''
    };
  },

  /**
   * Update module counts for packages
   */
  updateModuleCounts(data, packageName, isEnabled) {
    data.totalModules++;
    data.packageCounts[packageName] = (data.packageCounts[packageName] || 0) + 1;

    if (isEnabled) {
      data.totalEnabled++;
      data.packageEnabledCounts[packageName] = (data.packageEnabledCounts[packageName] || 0) + 1;
    } else {
      data.totalDisabled++;
      data.packageDisabledCounts[packageName] = (data.packageDisabledCounts[packageName] || 0) + 1;
    }
  },

  /**
   * Add module to data collection
   */
  addModuleToCollection(data, element, moduleInfo) {
    const moduleData = {
      element,
      packageName: moduleInfo.packageName,
      name: moduleInfo.name,
      date: moduleInfo.date,
      stability: moduleInfo.stability,
      lifecycle: moduleInfo.lifecycle
    };

    data.modules.push(moduleData);
  },

  /**
   * Get package statistics
   */
  getPackageStats(data) {
    const { Utils } = window.ModuleMatrix;

    return {
      totalModules: Utils.calculateTotal(data.packageCounts),
      totalEnabled: Utils.calculateTotal(data.packageEnabledCounts),
      totalDisabled: Utils.calculateTotal(data.packageDisabledCounts)
    };
  },

  /**
   * Get package specific counts
   */
  getPackageCounts(data, packageName) {
    return {
      total: data.packageCounts[packageName] || 0,
      enabled: data.packageEnabledCounts[packageName] || 0,
      disabled: data.packageDisabledCounts[packageName] || 0
    };
  },

  /**
   * Filter modules by package
   */
  getModulesByPackage(data, packageName) {
    const { DEFAULTS } = window.ModuleMatrix.Constants;

    if (packageName === DEFAULTS.activePackage) {
      return data.modules;
    }

    return data.modules.filter(module => module.packageName === packageName);
  },

  /**
   * Get unique package names
   */
  getPackageNames(data) {
    return Object.keys(data.packageCounts).sort();
  },

  /**
   * Validate data structure
   */
  validateData(data) {
    const requiredKeys = ['totalModules', 'packageCounts', 'modules'];
    return requiredKeys.every(key => data.hasOwnProperty(key));
  }
};
