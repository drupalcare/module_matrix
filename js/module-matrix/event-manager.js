/**
 * @file event-manager.js
 * Event handling and user interaction management
 */

window.ModuleMatrix = window.ModuleMatrix || {};

window.ModuleMatrix.EventManager = {

  // Store references for event handling
  state: {
    activePackage: 'all',
    filterInput: null,
    mainList: null,
    sidebarSelector: null,
    checkboxes: {
      status: null,
      lifecycle: null,
      stability: null
    }
  },

  /**
   * Initialize all event listeners
   */
  attachEventListeners(unifiedWrapper, mainList, sidebarSelector, filterInput, statusCheckboxes, lifecycleCheckboxes, stabilityCheckboxes, resetButton) {
    // Store references
    this.state.mainList = mainList;
    this.state.sidebarSelector = sidebarSelector;
    this.state.filterInput = filterInput;
    this.state.checkboxes.status = statusCheckboxes;
    this.state.checkboxes.lifecycle = lifecycleCheckboxes;
    this.state.checkboxes.stability = stabilityCheckboxes;

    // Attach individual event listeners
    this.attachTextFilterEvents(filterInput);
    this.attachCheckboxFilterEvents(statusCheckboxes, lifecycleCheckboxes, stabilityCheckboxes);
    this.attachResetButtonEvents(resetButton);
    this.attachPackageLinkEvents(unifiedWrapper, sidebarSelector);
  },

  /**
   * Attach text filter input events
   */
  attachTextFilterEvents(filterInput) {
    if (!filterInput) return;

    const { Utils } = window.ModuleMatrix;
    const debouncedHandler = Utils.debounce(() => this.handleFilterChange(), 150);

    filterInput.addEventListener('input', debouncedHandler);
  },

  /**
   * Attach checkbox filter events
   */
  attachCheckboxFilterEvents(statusCheckboxes, lifecycleCheckboxes, stabilityCheckboxes) {
    const allCheckboxes = [
      ...statusCheckboxes,
      ...lifecycleCheckboxes,
      ...stabilityCheckboxes
    ];

    allCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.handleFilterChange());
    });
  },

  /**
   * Attach reset button events
   */
  attachResetButtonEvents(resetButton) {
    if (!resetButton) return;

    resetButton.addEventListener('click', (event) => this.handleResetFilters(event));
  },

  /**
   * Attach package link events
   */
  attachPackageLinkEvents(unifiedWrapper, sidebarSelector) {
    const { SELECTORS } = window.ModuleMatrix.Constants;
    const packageLinks = unifiedWrapper.querySelectorAll(SELECTORS.packageLink);

    packageLinks.forEach(link => {
      link.addEventListener('click', (event) => this.handlePackageSelection(event, sidebarSelector));
    });
  },

  /**
   * Handle filter input changes
   */
  handleFilterChange() {
    const { DEFAULTS } = window.ModuleMatrix.Constants;

    this.state.activePackage = DEFAULTS.activePackage;
    this.applyFiltersWithAnimation(false);
    this.updateActivePackageLink(this.state.sidebarSelector, DEFAULTS.activePackage);
  },

  /**
   * Handle reset button click
   */
  handleResetFilters(event) {
    event.preventDefault();
    const { DEFAULTS } = window.ModuleMatrix.Constants;
    const { FilterManager } = window.ModuleMatrix;

    this.state.activePackage = DEFAULTS.activePackage;

    FilterManager.resetAllFilters(
      this.state.filterInput,
      this.state.checkboxes.status,
      this.state.checkboxes.lifecycle,
      this.state.checkboxes.stability
    );

    this.applyFiltersWithAnimation(true);
  },

  /**
   * Handle package link selection
   */
  handlePackageSelection(event, sidebarSelector) {
    event.preventDefault();
    const { SELECTORS } = window.ModuleMatrix.Constants;

    const link = event.target.closest(SELECTORS.packageLink);
    if (!link) return;

    this.state.activePackage = link.dataset.package || 'all';
    const isShowingAll = this.state.activePackage === 'all';

    this.applyFiltersWithAnimation(isShowingAll);
    this.updateActivePackageLink(sidebarSelector, this.state.activePackage);
  },

  /**
   * Apply filters with animation
   */
  applyFiltersWithAnimation(isReset = false) {
    const { FilterManager, AnimationManager } = window.ModuleMatrix;

    if (isReset) {
      FilterManager.resetAllFilters(
        this.state.filterInput,
        this.state.checkboxes.status,
        this.state.checkboxes.lifecycle,
        this.state.checkboxes.stability
      );
    }

    FilterManager.applyFilters(
      this.state.mainList,
      this.state.activePackage,
      this.state.filterInput,
      this.state.checkboxes.status,
      this.state.checkboxes.lifecycle,
      this.state.checkboxes.stability
    );

    AnimationManager.animateVisibleModules(this.state.mainList);
  },

  /**
   * Update active package link styling
   */
  updateActivePackageLink(sidebarSelector, activePackage) {
    const { SELECTORS, CLASSES } = window.ModuleMatrix.Constants;

    const sidebar = document.querySelector(sidebarSelector);
    if (!sidebar) return;

    // Remove active class from all links
    const allLinks = sidebar.querySelectorAll(SELECTORS.packageLink);
    allLinks.forEach(link => link.classList.remove(CLASSES.active));

    // Add active class to selected link
    const activeLink = sidebar.querySelector(`[data-package="${activePackage}"]`);
    if (activeLink) {
      activeLink.classList.add(CLASSES.active);
    }
  },

  /**
   * Get current active package
   */
  getActivePackage() {
    return this.state.activePackage;
  },

  /**
   * Set active package programmatically
   */
  setActivePackage(packageName) {
    this.state.activePackage = packageName;
    this.updateActivePackageLink(this.state.sidebarSelector, packageName);
  },

  /**
   * Trigger filter update programmatically
   */
  triggerFilterUpdate() {
    this.applyFiltersWithAnimation(false);
  }
};
