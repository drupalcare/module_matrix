/**
 * @file ui-generator.js
 * UI creation and management functions
 */

window.ModuleMatrix = window.ModuleMatrix || {};

window.ModuleMatrix.UIGenerator = {

  /**
   * Generate complete sidebar navigation
   */
  generateSidebarNavigation(sidebarSelector, data) {
    const { DataManager } = window.ModuleMatrix;
    const sidebar = document.querySelector(sidebarSelector);
    if (!sidebar) return;

    sidebar.innerHTML = '';

    const stats = DataManager.getPackageStats(data);

    // Create "All Modules" link
    const allModulesLink = this.createSidebarLink(
      'All Modules',
      'all',
      ['package-link', 'package-link-all', 'active'],
      stats.totalModules,
      stats.totalEnabled,
      stats.totalDisabled
    );
    sidebar.appendChild(allModulesLink);

    // Create package-specific links
    Object.entries(data.packageCounts).forEach(([packageName, count]) => {
      const packageCounts = DataManager.getPackageCounts(data, packageName);

      const link = this.createSidebarLink(
        packageName,
        packageName,
        ['package-link'],
        packageCounts.total,
        packageCounts.enabled,
        packageCounts.disabled
      );
      sidebar.appendChild(link);
    });
  },

  /**
   * Create individual sidebar link element
   */
  createSidebarLink(label, packageName, classList, total, enabled, disabled) {
    const link = document.createElement('a');
    link.href = '#';
    link.dataset.package = packageName;

    classList.forEach(className => link.classList.add(className));

    const leftContainer = this.createLeftContainer(label);
    const rightContainer = this.createRightContainer(total, enabled, disabled);

    link.append(leftContainer, rightContainer);
    return link;
  },

  /**
   * Create left side of sidebar link (icon + label)
   */
  createLeftContainer(label) {
    const { CLASSES, DEFAULTS } = window.ModuleMatrix.Constants;
    const { Utils } = window.ModuleMatrix;

    const container = Utils.createElement('div', CLASSES.packageLinkLeft);

    const icon = Utils.createElement('span', CLASSES.materialIcons, DEFAULTS.categoryIcon);
    const labelSpan = Utils.createElement('span', CLASSES.packageLabel, label);

    container.append(icon, labelSpan);
    return container;
  },

  /**
   * Create right side of sidebar link (counts)
   */
  createRightContainer(total, enabled, disabled) {
    const { CLASSES } = window.ModuleMatrix.Constants;
    const { Utils } = window.ModuleMatrix;

    const container = Utils.createElement('div', CLASSES.packageLinkRight);
    const fragment = this.createCountFragment(total, enabled, disabled);

    container.appendChild(fragment);
    return container;
  },

  /**
   * Create count display fragment
   */
  createCountFragment(total, enabled, disabled) {
    const { CLASSES } = window.ModuleMatrix.Constants;
    const { Utils } = window.ModuleMatrix;

    const fragment = document.createDocumentFragment();

    fragment.append(
      Utils.createElement('span', CLASSES.totalCount, total),
      Utils.createElement('span', CLASSES.enabledCount, enabled),
      document.createTextNode('/'),
      Utils.createElement('span', CLASSES.disabledCount, disabled)
    );

    return fragment;
  },

  /**
   * Populate and sort module list
   */
  populateModuleList(containerSelector, modules) {
    const { Utils } = window.ModuleMatrix;
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Sort modules alphabetically
    const sortedModules = Utils.sortModuleDataByName(modules);

    // Extract elements and populate container
    const elements = sortedModules.map(module => module.element);
    Utils.clearAndAppend(container, elements);
  },

  /**
   * Create loading indicator
   */
  createLoadingIndicator() {
    const { Utils } = window.ModuleMatrix;

    const loader = Utils.createElement('div', 'module-matrix-loader');
    const spinner = Utils.createElement('div', 'spinner');
    const text = Utils.createElement('span', 'loading-text', 'Loading modules...');

    loader.append(spinner, text);
    return loader;
  },

  /**
   * Create empty state message
   */
  createEmptyState(message = 'No modules found') {
    const { Utils } = window.ModuleMatrix;

    const emptyState = Utils.createElement('div', 'module-matrix-empty');
    const icon = Utils.createElement('span', 'material-icons', 'inbox');
    const text = Utils.createElement('p', 'empty-text', message);

    emptyState.append(icon, text);
    return emptyState;
  },

  /**
   * Create filter summary display
   */
  createFilterSummary(visibleCount, totalCount) {
    const { Utils } = window.ModuleMatrix;

    const summary = Utils.createElement('div', 'filter-summary');
    const text = visibleCount === totalCount
      ? `Showing all ${totalCount} modules`
      : `Showing ${visibleCount} of ${totalCount} modules`;

    summary.textContent = text;
    return summary;
  },

  /**
   * Update filter summary
   */
  updateFilterSummary(container, visibleCount, totalCount) {
    const existingSummary = container.querySelector('.filter-summary');
    if (existingSummary) {
      existingSummary.remove();
    }

    const newSummary = this.createFilterSummary(visibleCount, totalCount);
    container.insertBefore(newSummary, container.firstChild);
  },

  /**
   * Create breadcrumb navigation
   */
  createBreadcrumb(activePackage) {
    const { Utils } = window.ModuleMatrix;
    const { DEFAULTS } = window.ModuleMatrix.Constants;

    const breadcrumb = Utils.createElement('nav', 'module-matrix-breadcrumb');
    const homeLink = Utils.createElement('a', 'breadcrumb-home', 'All Modules');
    homeLink.href = '#';
    homeLink.dataset.package = DEFAULTS.activePackage;

    breadcrumb.appendChild(homeLink);

    if (activePackage !== DEFAULTS.activePackage) {
      const separator = Utils.createElement('span', 'breadcrumb-separator', ' / ');
      const currentPage = Utils.createElement('span', 'breadcrumb-current', activePackage);
      breadcrumb.append(separator, currentPage);
    }

    return breadcrumb;
  },

  /**
   * Create action buttons container
   */
  createActionButtons() {
    const { Utils } = window.ModuleMatrix;

    const container = Utils.createElement('div', 'module-matrix-actions');

    const resetButton = Utils.createElement('button', 'btn btn-secondary', 'Reset Filters');
    resetButton.type = 'button';
    resetButton.id = 'reset-filters';

    const exportButton = Utils.createElement('button', 'btn btn-outline-secondary', 'Export List');
    exportButton.type = 'button';

    container.append(resetButton, exportButton);
    return container;
  },

  /**
   * Create tooltip element
   */
  createTooltip(text, targetElement) {
    const { Utils } = window.ModuleMatrix;

    const tooltip = Utils.createElement('div', 'module-matrix-tooltip', text);
    tooltip.style.position = 'absolute';
    tooltip.style.visibility = 'hidden';

    targetElement.addEventListener('mouseenter', () => {
      this.showTooltip(tooltip, targetElement);
    });

    targetElement.addEventListener('mouseleave', () => {
      this.hideTooltip(tooltip);
    });

    document.body.appendChild(tooltip);
    return tooltip;
  },

  /**
   * Show tooltip with positioning
   */
  showTooltip(tooltip, targetElement) {
    const rect = targetElement.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
    tooltip.style.visibility = 'visible';
  },

  /**
   * Hide tooltip
   */
  hideTooltip(tooltip) {
    tooltip.style.visibility = 'hidden';
  },

  /**
   * Create notification/alert
   */
  createNotification(message, type = 'info') {
    const { Utils } = window.ModuleMatrix;

    const notification = Utils.createElement('div', `alert alert-${type}`);
    notification.textContent = message;

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);

    return notification;
  },

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const notification = this.createNotification(message, type);

    // Insert at top of the main form
    const form = document.querySelector('form#system-modules');
    if (form) {
      form.insertBefore(notification, form.firstChild);
    }

    return notification;
  }
};
