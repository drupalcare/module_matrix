/**
 * @file constants.js
 * Configuration constants and DOM selectors for Module Matrix
 */

window.ModuleMatrix = window.ModuleMatrix || {};

window.ModuleMatrix.Constants = {
  // DOM Selectors
  SELECTORS: {
    form: 'form#system-modules',
    filterInput: '#edit-text',
    mainList: '.module-matrix-list',
    statusCheckboxes: '.enable-filter',
    lifecycleCheckboxes: '.lifecycle-filter',
    stabilityCheckboxes: '.stability-filter',
    resetButton: '#reset-filters',
    wrapperSelector: 'form.system-modules .package-listing',
    sidebarSelector: '.module-matrix-sidebar',
    listSelector: '.module-matrix-list',
    moduleItem: '.module-matrix-list-inner',
    namePackage: '.name-package',
    packageLink: '.package-link',
    moduleDetails: '.module-matrix-item-details',
    detailsHeader: '.matrix-details-header',
    detailsContent: '.matrix-details-content',
    moduleWrapper: '.module-matrix-wrapper'
  },

  // CSS Classes
  CLASSES: {
    hidden: 'hidden',
    active: 'active',
    open: 'open',
    animate: 'matrix-animate-combined',
    packageLink: 'package-link',
    packageLinkAll: 'package-link-all',
    packageLinkLeft: 'package-link-left',
    packageLinkRight: 'package-link-right',
    packageLabel: 'package-label',
    // Kept for backward compatibility; nothing renders the icon font now.
    materialIcons: 'material-icons',
    // SVG icon base class; the modifier is the icon name (mm-i--folder).
    icon: 'mm-i',
    // Matrix mark on the "All modules" link (CSS only).
    mark: 'mm-mark',
    totalCount: 'total',
    enabledCount: 'on',
    disabledCount: 'off',
    countSeparator: 'mm-count-sep'
  },

  // Default Values
  DEFAULTS: {
    activePackage: 'all',
    unknownPackage: 'unknown',
    categoryIcon: 'folder',
    enabledStatus: 1
  },

  // Data Structure Template
  DATA_STRUCTURE: {
    totalModules: 0,
    totalDisabled: 0,
    totalEnabled: 0,
    packageCounts: {},
    packageDisabledCounts: {},
    packageEnabledCounts: {},
    modules: []
  }
};
