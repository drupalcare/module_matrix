/**
 * @file filter-manager.js
 * All filtering logic and operations
 */

window.ModuleMatrix = window.ModuleMatrix || {};

window.ModuleMatrix.FilterManager = {

  /**
   * Apply all active filters to modules
   */
  applyFilters(mainList, selectedPackage, filterInput, statusCheckboxes, lifecycleCheckboxes, stabilityCheckboxes) {
    const { Utils } = window.ModuleMatrix;
    const { SELECTORS } = window.ModuleMatrix.Constants;

    const query = Utils.getFilterQuery(filterInput);
    const selectedStatuses = Utils.getSelectedCheckboxValues(statusCheckboxes);
    const selectedLifecycles = Utils.getSelectedCheckboxValues(lifecycleCheckboxes);
    const selectedStability = Utils.getSelectedCheckboxValues(stabilityCheckboxes);

    const allModules = Array.from(mainList.querySelectorAll(SELECTORS.moduleItem));

    // Filter modules
    const visibleModules = allModules.filter(module =>
      this.moduleMatchesFilters(
        module,
        query,
        selectedPackage,
        selectedStatuses,
        selectedLifecycles,
        selectedStability
      )
    );

    // Sort filtered modules alphabetically
    const sortedModules = Utils.sortModulesByName(visibleModules);

    // Update visibility
    this.updateModuleVisibility(allModules, sortedModules);
  },

  /**
   * Check if module matches all active filters
   */
  moduleMatchesFilters(module, query, selectedPackage, selectedStatuses, selectedLifecycles, selectedStability) {
    const moduleDetails = this.getModuleFilterData(module);
    if (!moduleDetails) return false;

    return (
      this.matchesTextFilter(query, moduleDetails.name, moduleDetails.description) &&
      this.matchesPackageFilter(selectedPackage, moduleDetails.package) &&
      this.matchesCheckboxFilter(selectedStatuses, moduleDetails.status) &&
      this.matchesCheckboxFilter(selectedLifecycles, moduleDetails.lifecycle) &&
      this.matchesCheckboxFilter(selectedStability, moduleDetails.stability)
    );
  },

  /**
   * Extract filter-relevant data from module element
   */
  getModuleFilterData(module) {
    const { SELECTORS } = window.ModuleMatrix.Constants;
    const namePackage = module.querySelector(SELECTORS.namePackage);

    if (!namePackage) return null;

    return {
      name: namePackage.dataset.name?.toLowerCase() || '',
      description: namePackage.dataset.description?.toLowerCase() || '',
      package: namePackage.dataset.package || '',
      status: namePackage.dataset.status || '',
      lifecycle: namePackage.dataset.lifecycle || '',
      stability: namePackage.dataset.stability || ''
    };
  },

  /**
   * Check text filter match
   */
  matchesTextFilter(query, name, description) {
    return query === '' || name.includes(query) || description.includes(query);
  },

  /**
   * Check package filter match
   */
  matchesPackageFilter(selectedPackage, modulePackage) {
    const { DEFAULTS } = window.ModuleMatrix.Constants;
    return selectedPackage === DEFAULTS.activePackage || modulePackage === selectedPackage;
  },

  /**
   * Check checkbox filter match
   */
  matchesCheckboxFilter(selectedValues, moduleValue) {
    return selectedValues.length === 0 || selectedValues.includes(moduleValue);
  },

  /**
   * Update module visibility based on filtering
   */
  updateModuleVisibility(allModules, visibleModules) {
    const { CLASSES } = window.ModuleMatrix.Constants;

    // Hide all modules
    allModules.forEach(module => module.classList.add(CLASSES.hidden));

    // Show filtered modules
    visibleModules.forEach(module => module.classList.remove(CLASSES.hidden));
  },

  /**
   * Reset all filter inputs
   */
  resetAllFilters(filterInput, statusCheckboxes, lifecycleCheckboxes, stabilityCheckboxes) {
    if (filterInput) filterInput.value = '';

    const allCheckboxes = [
      ...statusCheckboxes,
      ...lifecycleCheckboxes,
      ...stabilityCheckboxes
    ];

    allCheckboxes.forEach(checkbox => checkbox.checked = false);
  },

  /**
   * Get current filter state
   */
  getCurrentFilterState(filterInput, statusCheckboxes, lifecycleCheckboxes, stabilityCheckboxes) {
    const { Utils } = window.ModuleMatrix;

    return {
      query: Utils.getFilterQuery(filterInput),
      statuses: Utils.getSelectedCheckboxValues(statusCheckboxes),
      lifecycles: Utils.getSelectedCheckboxValues(lifecycleCheckboxes),
      stability: Utils.getSelectedCheckboxValues(stabilityCheckboxes)
    };
  },

  /**
   * Check if any filters are active
   */
  hasActiveFilters(filterInput, statusCheckboxes, lifecycleCheckboxes, stabilityCheckboxes) {
    const filterState = this.getCurrentFilterState(
      filterInput,
      statusCheckboxes,
      lifecycleCheckboxes,
      stabilityCheckboxes
    );

    return filterState.query !== '' ||
           filterState.statuses.length > 0 ||
           filterState.lifecycles.length > 0 ||
           filterState.stability.length > 0;
  },

  /**
   * Count visible modules after filtering
   */
  countVisibleModules(mainList) {
    const { SELECTORS, CLASSES } = window.ModuleMatrix.Constants;
    return mainList.querySelectorAll(`${SELECTORS.moduleItem}:not(.${CLASSES.hidden})`).length;
  },

  /**
   * Filter modules by specific criteria
   */
  filterModulesByStatus(modules, status) {
    const { DEFAULTS } = window.ModuleMatrix.Constants;
    const targetStatus = status === 'enabled' ? DEFAULTS.enabledStatus.toString() : '0';

    return modules.filter(module => {
      const moduleDetails = this.getModuleFilterData(module);
      return moduleDetails && moduleDetails.status === targetStatus;
    });
  }
};
