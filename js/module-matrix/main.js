/**
 * @file main.js
 * Module Matrix Main Entry Point
 *
 * Orchestrates the initialization and coordination of all Module Matrix components.
 * This is the primary entry point that registers the Drupal behavior and coordinates
 * all the modular components.
 *
 * Dependencies (must be loaded first):
 * - constants.js
 * - utilities.js
 * - data-manager.js
 * - module-unifier.js
 * - filter-manager.js
 * - event-manager.js
 * - animation-manager.js
 * - ui-generator.js
 */

((Drupal, drupalSettings, once) => {
  'use strict';

  // Ensure namespace exists
  window.ModuleMatrix = window.ModuleMatrix || {};

  // Cache DOM elements and state
  const ModuleMatrixMain = {

    // Component state
    state: {
      isInitialized: false,
      moduleData: null,
      unifiedWrapper: null,
      domElements: {}
    },

    /**
     * Initialize the Module Matrix system
     */
    init(context, settings) {
      const { SELECTORS } = window.ModuleMatrix.Constants;

      // Check if form context exists
      const formContext = document.querySelector(SELECTORS.form);
      if (!formContext) {
        console.warn('Module Matrix: Form context not found');
        return false;
      }

      // Cache DOM elements
      this.cacheDOMElements(formContext);

      // Unify multiple module containers
      this.state.unifiedWrapper = window.ModuleMatrix.ModuleUnifier.unifyModuleMatrix(SELECTORS.wrapperSelector);
      if (!this.state.unifiedWrapper) {
        console.warn('Module Matrix: Failed to unify module containers');
        return false;
      }

      // Initialize module data
      this.state.moduleData = window.ModuleMatrix.DataManager.initializeModuleData(this.state.unifiedWrapper);
      if (!window.ModuleMatrix.DataManager.validateData(this.state.moduleData)) {
        console.error('Module Matrix: Invalid module data structure');
        return false;
      }

      // Generate UI components
      this.generateUI();

      // Attach event listeners
      this.attachEventListeners();

      // Initialize animations
      this.initializeAnimations();

      this.state.isInitialized = true;
      console.log('Module Matrix: Successfully initialized');
      return true;
    },

    /**
     * Cache frequently accessed DOM elements
     */
    cacheDOMElements(formContext) {
      const { SELECTORS } = window.ModuleMatrix.Constants;

      this.state.domElements = {
        formContext,
        filterInput: formContext.querySelector(SELECTORS.filterInput),
        mainList: formContext.querySelector(SELECTORS.mainList),
        statusCheckboxes: formContext.querySelectorAll(SELECTORS.statusCheckboxes),
        lifecycleCheckboxes: formContext.querySelectorAll(SELECTORS.lifecycleCheckboxes),
        stabilityCheckboxes: formContext.querySelectorAll(SELECTORS.stabilityCheckboxes),
        resetButton: formContext.querySelector(SELECTORS.resetButton)
      };
    },

    /**
     * Generate all UI components
     */
    generateUI() {
      const { SELECTORS } = window.ModuleMatrix.Constants;
      const { UIGenerator } = window.ModuleMatrix;

      // Generate sidebar navigation
      UIGenerator.generateSidebarNavigation(SELECTORS.sidebarSelector, this.state.moduleData);

      // Populate and sort module list
      UIGenerator.populateModuleList(SELECTORS.listSelector, this.state.moduleData.modules);

      // Show initialization success
      this.showInitializationStatus();
    },

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
      const { SELECTORS } = window.ModuleMatrix.Constants;
      const { EventManager } = window.ModuleMatrix;
      const { domElements } = this.state;

      EventManager.attachEventListeners(
        this.state.unifiedWrapper,
        domElements.mainList,
        SELECTORS.sidebarSelector,
        domElements.filterInput,
        domElements.statusCheckboxes,
        domElements.lifecycleCheckboxes,
        domElements.stabilityCheckboxes,
        domElements.resetButton
      );
    },

    /**
     * Initialize animations and interactive elements
     */
    initializeAnimations() {
      const { AnimationManager } = window.ModuleMatrix;

      // Initialize expandable details
      AnimationManager.initializeDetailsAnimation();

      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        AnimationManager.disableAnimations();
      }
    },

    /**
     * Show initialization status
     */
    showInitializationStatus() {
      const { DataManager } = window.ModuleMatrix;
      const stats = DataManager.getPackageStats(this.state.moduleData);

      console.log(`Module Matrix: Loaded ${stats.totalModules} modules across ${Object.keys(this.state.moduleData.packageCounts).length} packages`);
    },

    /**
     * Get current module data
     */
    getModuleData() {
      return this.state.moduleData;
    },

    /**
     * Get DOM element references
     */
    getDOMElements() {
      return this.state.domElements;
    },

    /**
     * Check if system is initialized
     */
    isInitialized() {
      return this.state.isInitialized;
    },

    /**
     * Refresh the entire module matrix (useful for AJAX updates)
     */
    refresh() {
      if (!this.state.isInitialized) return false;

      console.log('Module Matrix: Refreshing...');

      // Re-initialize with current context
      const context = document;
      const settings = drupalSettings || {};

      return this.init(context, settings);
    },

    /**
     * Destroy the module matrix (cleanup)
     */
    destroy() {
      // Remove event listeners
      if (window.ModuleMatrix.EventManager.removeEventListeners) {
        window.ModuleMatrix.EventManager.removeEventListeners();
      }

      // Clear state
      this.state = {
        isInitialized: false,
        moduleData: null,
        unifiedWrapper: null,
        domElements: {}
      };

      console.log('Module Matrix: Destroyed');
    }
  };

  /**
   * Main Drupal behavior registration
   */
  Drupal.behaviors.moduleMatrixMain = {
    attach: function(context, settings) {
      // Ensure all required components are loaded
      if (!window.ModuleMatrix.Constants ||
          !window.ModuleMatrix.Utils ||
          !window.ModuleMatrix.DataManager ||
          !window.ModuleMatrix.ModuleUnifier ||
          !window.ModuleMatrix.FilterManager ||
          !window.ModuleMatrix.EventManager ||
          !window.ModuleMatrix.AnimationManager ||
          !window.ModuleMatrix.UIGenerator) {
        console.error('Module Matrix: Required components not loaded');
        return;
      }

      // Use 'once' to ensure single initialization
      once('moduleMatrixMain', 'form.system-modules', context).forEach(() => {
        ModuleMatrixMain.init(context, settings);
      });
    },

    detach: function(context, settings, trigger) {
      if (trigger === 'unload') {
        ModuleMatrixMain.destroy();
      }
    }
  };

  // Expose main controller for external access
  window.ModuleMatrix.Main = ModuleMatrixMain;

  // Expose public API
  window.ModuleMatrix.API = {

    /**
     * Get current filter state
     */
    getFilterState() {
      const { EventManager } = window.ModuleMatrix;
      return {
        activePackage: EventManager.getActivePackage(),
        isInitialized: ModuleMatrixMain.isInitialized()
      };
    },

    /**
     * Set active package programmatically
     */
    setActivePackage(packageName) {
      const { EventManager } = window.ModuleMatrix;
      EventManager.setActivePackage(packageName);
    },

    /**
     * Trigger filter update
     */
    updateFilters() {
      const { EventManager } = window.ModuleMatrix;
      EventManager.triggerFilterUpdate();
    },

    /**
     * Get module statistics
     */
    getStats() {
      const moduleData = ModuleMatrixMain.getModuleData();
      if (!moduleData) return null;

      const { DataManager } = window.ModuleMatrix;
      return DataManager.getPackageStats(moduleData);
    },

    /**
     * Refresh the interface
     */
    refresh() {
      return ModuleMatrixMain.refresh();
    }
  };

})(Drupal, drupalSettings, once);
