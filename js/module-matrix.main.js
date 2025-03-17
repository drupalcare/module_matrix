/**
 * @file
 * Module Matrix Main.
 *
 * Filename:     module-matrix-main.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */
((Drupal, drupalSettings, once) => {
  'use strict';
  const formContext = document.querySelector('form#system-modules');
  if (!formContext) return;
  const filterInput = formContext.querySelector('#edit-text');
  const mainList = formContext.querySelector('.module-matrix-list');
  const statusCheckboxes = formContext.querySelectorAll('.enable-filter');
  const lifecycleCheckboxes = formContext.querySelectorAll('.lifecycle-filter');
  const stabilityCheckboxes = formContext.querySelectorAll('.stability-filter');
  const resetButton = formContext.querySelector('#reset-filters');
  let activePackage = 'all';
  Drupal.behaviors.moduleMatrixMain = {
    attach: function(context, settings) {
      const wrapperSelector = 'form.system-modules .package-listing';
      const sidebarSelector = '.module-matrix-sidebar';
      const listSelector = '.module-matrix-list';
      const unifiedWrapper = unifyModuleMatrix(wrapperSelector);
      if (!unifiedWrapper) return;
      const mainList = unifiedWrapper.querySelector(listSelector);
      // Initialize data
      const data = initializeModuleData(unifiedWrapper);
      // Generate sidebar links
      storePackageLinks(
        sidebarSelector,
        data.packageCounts,
        data.packageEnabledCounts,
        data.packageDisabledCounts,
        data // Pass the data object
      );
      // Populate the module list
      storeAllModules(listSelector, data.modules);
      // Attach filters and pass the `data` object
      attachFilters(unifiedWrapper, mainList, sidebarSelector, data);
      animateDetails();
    },
  };
  // Attach filtering logic
  function attachFilters(unifiedWrapper, mainList, sidebarSelector, data) {
    const packageLinks = unifiedWrapper.querySelectorAll('.package-link');
    // Helper function to attach change event listeners
    const attachCheckboxFilter = (checkboxes) => {
      checkboxes.forEach((checkbox) =>
        checkbox.addEventListener('change', () => applyAndResetFilters(mainList, sidebarSelector, data))
      );
    };
    // Attach input filter
    if (filterInput) {
      filterInput.addEventListener('input', () => applyAndResetFilters(mainList, sidebarSelector, data));
    }
    // Attach checkbox filters
    attachCheckboxFilter(statusCheckboxes);
    attachCheckboxFilter(lifecycleCheckboxes);
    attachCheckboxFilter(stabilityCheckboxes);
    // Attach reset button
    if (resetButton) {
      resetButton.addEventListener('click', (e) => {
        e.preventDefault();
        activePackage = 'all';
        animateFilteredModules(mainList, sidebarSelector, data, true);
      });
    }
    // Attach package links
    packageLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        activePackage = link.dataset.package || 'all';
        if (activePackage === 'all') {
          animateFilteredModules(mainList, sidebarSelector, data, true);
        } else {
          animateFilteredModules(mainList, sidebarSelector, data, false);
        }
        updateActivePackageLink(sidebarSelector, activePackage);
      });
    });
  }
  // Helper function to apply filters and reset active package
  function applyAndResetFilters(mainList, sidebarSelector, data) {
    activePackage = 'all';
    animateFilteredModules(mainList, sidebarSelector, data, false);
    updateActivePackageLink(sidebarSelector, 'all');
  }

  function animateFilteredModules(mainList, sidebarSelector, data, isReset = false) {
    if (isReset) {
      resetFilters(mainList, sidebarSelector, data);
    } else {
      applyFilters(mainList, activePackage, data);
    }
    const modules = mainList.querySelectorAll('.module-matrix-list-inner');
    modules.forEach((module) => {
      if (isReset || !module.classList.contains('hidden')) {
        module.classList.add('matrix-animate-combined');
        module.addEventListener(
          'animationend',
          () => {
            module.classList.remove('matrix-animate-combined');
          }, {
            once: true
          }
        );
      }
    });
  }
  // Apply filters
  function applyFilters(mainList, activePackage, data) {
    const query = getFilterQuery();
    const selectedStatuses = getSelectedValues(statusCheckboxes);
    const selectedLifecycles = getSelectedValues(lifecycleCheckboxes);
    const selectedStability = getSelectedValues(stabilityCheckboxes);
    // Get all modules
    const allModules = Array.from(mainList.querySelectorAll('.module-matrix-list-inner'));
    // Filter and collect visible modules
    const visibleModules = allModules.filter((module) => matchesFilters(module, query, activePackage, selectedStatuses, selectedLifecycles, selectedStability));
    // Sort the filtered modules alphabetically by `data-name`
    const sortedVisibleModules = sortModulesByName(visibleModules);
    // Hide all modules and then show only the filtered and sorted ones
    allModules.forEach((module) => module.classList.add('hidden'));
    sortedVisibleModules.forEach((module) => module.classList.remove('hidden'));
  }
  // Helper function to get the filter query
  function getFilterQuery() {
    return filterInput?.value.toLowerCase().trim() || '';
  }
  // Helper function to get selected values from checkboxes
  function getSelectedValues(checkboxes) {
    return Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);
  }
  // Helper function to check if a module matches the filters
  function matchesFilters(module, query, activePackage, selectedStatuses, selectedLifecycles, selectedStability) {
    const moduleDetails = module.querySelector('.name-package');
    if (!moduleDetails) return false;
    const moduleName = moduleDetails.dataset.name?.toLowerCase() || '';
    const moduleDescription = moduleDetails.dataset.description?.toLowerCase() || '';
    const modulePackage = moduleDetails.dataset.package || '';
    const moduleStatus = moduleDetails.dataset.status || '';
    const moduleLifecycle = moduleDetails.dataset.lifecycle || '';
    const moduleStability = moduleDetails.dataset.stability || '';
    return (
      (query === '' || moduleName.includes(query) || moduleDescription.includes(query)) &&
      (activePackage === 'all' || modulePackage === activePackage) &&
      (selectedStatuses.length === 0 || selectedStatuses.includes(moduleStatus)) &&
      (selectedLifecycles.length === 0 || selectedLifecycles.includes(moduleLifecycle)) &&
      (selectedStability.length === 0 || selectedStability.includes(moduleStability))
    );
  }
  // Helper function to sort modules alphabetically by `data-name`
  function sortModulesByName(modules) {
    return modules.sort((a, b) => {
      const nameA = a.querySelector('.name-package')?.dataset.name?.toLowerCase() || '';
      const nameB = b.querySelector('.name-package')?.dataset.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  }
  // Update active package link visually
  function updateActivePackageLink(sidebarSelector, activePackage) {
    const sidebar = document.querySelector(sidebarSelector);
    if (!sidebar) return;
    // Remove "active" class from all links
    sidebar.querySelectorAll('.package-link').forEach((link) => {
      link.classList.remove('active');
    });
    // Add "active" class to the selected link
    const activeLink = sidebar.querySelector(`[data-package="${activePackage}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
  // Reset all filters
  function resetFilters(mainList, sidebarSelector, data) {
    if (!data) {
      // console.error('Data object is not defined for resetFilters');
      return;
    }
    if (filterInput) filterInput.value = '';
    statusCheckboxes.forEach((checkbox) => (checkbox.checked = false));
    lifecycleCheckboxes.forEach((checkbox) => (checkbox.checked = false));
    stabilityCheckboxes.forEach((checkbox) => (checkbox.checked = false));
    applyFilters(mainList, 'all', data); // Pass the `data` object
    updateActivePackageLink(sidebarSelector, 'all');
  }

  function unifyModuleMatrix(wrapperSelector) {
    const systemModules = document.querySelector('form.system-modules');
    if (!systemModules) return null;
    const wrappers = Array.from(document.querySelectorAll(wrapperSelector));
    if (wrappers.length === 0) return null;
    let mainWrapper = null;
    let allModuleWrappers = [];
    wrappers.forEach((wrapper) => {
      const moduleWrapper = wrapper.querySelector('.module-matrix-wrapper');
      if (moduleWrapper) {
        systemModules.appendChild(moduleWrapper);
        allModuleWrappers.push(moduleWrapper);
        if (!mainWrapper) {
          mainWrapper = moduleWrapper;
        }
      }
    });
    wrappers.forEach((wrapper) => wrapper.remove());
    if (!mainWrapper) return null;
    const mainSidebar = mainWrapper.querySelector('.module-matrix-sidebar');
    const mainList = mainWrapper.querySelector('.module-matrix-list');
    if (!mainSidebar || !mainList) {
      return null;
    }
    // Merge all additional module-matrix-wrappers into the main one
    allModuleWrappers.slice(1).forEach((extraWrapper) => {
      mergeWrappers([extraWrapper], mainSidebar, mainList);
    });
    // Initialize `data` using the unified wrapper
    const data = initializeModuleData(mainWrapper);
    if (!data) return null;
    // Pass `data` to the sidebar initialization
    initializeSidebar(mainSidebar, mainList, data);
    mergeWrappers(allModuleWrappers, mainSidebar, mainList);
    return mainWrapper;
  }

  function initializeSidebar(mainSidebar, mainList, data) {
    once('moduleMatrixClick', mainSidebar).forEach(() => {
      mainSidebar.addEventListener('click', (event) =>
        handlePackageFilter(event, mainSidebar, mainList, data)
      );
    });
  }

  function mergeElements(source, target, selector) {
    if (!source || !target) return;
    Array.from(source.querySelectorAll(selector)).forEach((element) => {
      if (!target.querySelector(`[data-package="${element.dataset.package}"]`)) {
        target.appendChild(element);
      }
    });
  }

  function mergeWrappers(wrappers, mainSidebar, mainList) {
    wrappers.slice(1).forEach((wrapper) => {
      mergeElements(wrapper.querySelector('.module-matrix-sidebar'), mainSidebar, 'a');
      mergeElements(wrapper.querySelector('.module-matrix-list'), mainList, '.module-matrix-list-inner');
      wrapper.remove();
    });
  }
  // Filtering Logic
  function handlePackageFilter(event, mainSidebar, mainList, data) {
    const link = event.target.closest('.package-link');
    if (!link) return;
    event.preventDefault();
    // Update active package
    activePackage = link.dataset.package;
    // Highlight the selected link
    updateActiveLink(mainSidebar, link);
    // Apply all filters (package + text + checkboxes)
    applyFilters(mainList, activePackage, data); // Use `data` here
  }

  function updateActiveLink(mainSidebar, activeLink) {
    mainSidebar.querySelectorAll('.package-link').forEach((el) => el.classList.remove('active'));
    activeLink.classList.add('active');
  }
  // Module Data Initialization
  /**
   * Initialize module data from the unified wrapper
   */
  function initializeModuleData(wrapper) {
    const data = initializeDataStructure();
    const moduleList = getModuleList(wrapper);
    if (!moduleList) {
      //console.error('Module list not found inside wrapper');
      return data;
    }
    const moduleItems = Array.from(moduleList.querySelectorAll('.module-matrix-list-inner'));
    // console.log(`Found ${moduleItems.length} individual modules (.module-matrix-list-inner)`);
    moduleItems.forEach((item, index) => processModuleItem(item, index, data));
    return data;
  }

  function initializeDataStructure() {
    return {
      totalModules: 0,
      totalDisabled: 0,
      totalEnabled: 0,
      packageCounts: {},
      packageDisabledCounts: {},
      packageEnabledCounts: {},
      modulesByDate: [],
      modulesByStability: [],
      modulesByLifecycle: [],
      modulesByName: [],
      modules: [],
    };
  }

  function getModuleList(wrapper) {
    return wrapper.querySelector('.module-matrix-list');
  }

  function processModuleItem(item, index, data) {
    const namePackage = item.querySelector('.name-package');
    if (!namePackage) {
      // console.warn(`Module #${index + 1} missing .name-package`);
      return;
    }

    const packageName = namePackage.dataset.package || 'unknown';
    const isEnabled = parseInt(namePackage.dataset.status) === 1;
    const moduleName = namePackage.textContent.trim() || '';
    const moduleDate = namePackage.dataset.date || '';
    const moduleLifecycle = namePackage.dataset.lifecycle || '';
    const moduleStability = namePackage.dataset.stability || '';

    updateModuleCounts(data, packageName, isEnabled);
    updateModuleLists(data, item, packageName, moduleName, moduleDate, moduleStability, moduleLifecycle);
  }

  function updateModuleCounts(data, packageName, isEnabled) {
    data.totalModules++;
    data.packageCounts[packageName] = (data.packageCounts[packageName] || 0) + 1;
    if (isEnabled) {
      data.totalEnabled++;
      data.packageEnabledCounts[packageName] = (data.packageEnabledCounts[packageName] || 0) + 1;
    } else {
      data.totalDisabled++;
      data.packageDisabledCounts[packageName] = (data.packageDisabledCounts[packageName] || 0) + 1;
    }
  }

  function updateModuleLists(data, item, packageName, moduleName, moduleDate, moduleStability, moduleLifecycle) {
    const moduleData = {
      element: item,
      packageName,
      name: moduleName,
      date: moduleDate,
      stability: moduleStability,
      lifecycle: moduleLifecycle
    };
    data.modules.push(moduleData);
    data.modulesByDate.push({
      element: item,
      date: moduleDate
    });
    data.modulesByLifecycle.push({
      element: item,
      lifecycle: moduleLifecycle
    });
    data.modulesByStability.push({
      element: item,
      stability: moduleStability
    });
    data.modulesByName.push({
      element: item,
      name: moduleName
    });
  }
  //Helper Functions
  function generateLinkElement(label, href, dataset = {}) {
    const link = document.createElement('a');
    link.textContent = label;
    link.href = href;
    // Add custom data-* attributes
    Object.entries(dataset).forEach(([key, value]) => {
      link.dataset[key] = value;
    });
    return link;
  }

  function storePackageLinks(sidebarSelector, packageCounts = {}, packageEnabledCounts = {}, packageDisabledCounts = {}, data) {
    const sidebar = document.querySelector(sidebarSelector);
    if (!sidebar) {
      //console.error(`Sidebar not found for selector: ${sidebarSelector}`);
      return;
    }
    // Clear the sidebar
    sidebar.innerHTML = '';
    // Calculate totals dynamically
    const totalModules = Object.values(packageCounts).reduce((a, b) => a + b, 0);
    const totalEnabled = Object.values(packageEnabledCounts).reduce((a, b) => a + b, 0);
    const totalDisabled = Object.values(packageDisabledCounts).reduce((a, b) => a + b, 0);
    // Create and append the "All Modules" link
    const allModulesLink = createSidebarLink(
      'All Modules',
      '#',
      'all',
      ['package-link', 'package-link-all', 'active'],
      true, // This marks it as the "All Modules" link
      totalModules,
      totalEnabled,
      totalDisabled,
      data // Pass the data object
    );
    sidebar.appendChild(allModulesLink);
    // Append links for each package
    Object.entries(packageCounts).forEach(([packageName, count]) => {
      const enabled = packageEnabledCounts[packageName] || 0;
      const disabled = packageDisabledCounts[packageName] || 0;
      const link = createSidebarLink(
        packageName,
        '#',
        packageName,
        ['package-link'],
        false,
        count,
        enabled,
        disabled,
        data // Pass the data object
      );
      sidebar.appendChild(link);
    });
  }

  function createSidebarLink(label, href, packageName, classList = [], isAllModulesLink = false, total = 0, enabled = 0, disabled = 0, data = null) {
    const link = generateLinkElement(label, href, {
      package: packageName
    });
    classList.forEach(className => link.classList.add(className));
    const leftContainer = document.createElement('div');
    leftContainer.className = 'package-link-left';
    const iconSpan = document.createElement('span');
    iconSpan.className = 'material-icons';
    iconSpan.textContent = 'category';
    const labelSpan = document.createElement('span');
    labelSpan.className = 'package-label';
    labelSpan.textContent = label;
    leftContainer.append(iconSpan, labelSpan);
    const rightContainer = document.createElement('div');
    rightContainer.className = 'package-link-right';
    rightContainer.appendChild(createCountSpans(total, enabled, disabled));
    link.innerHTML = '';
    link.append(leftContainer, rightContainer);
    return link;
  }
  // Function to create count spans for total, enabled, and disabled
  function createCountSpans(total = 0, enabled = 0, disabled = 0) {
    const fragment = document.createDocumentFragment();
    const createSpan = (className, text) => {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = text;
      return span;
    };
    fragment.append(
      createSpan('total', total),
      createSpan('on', enabled),
      document.createTextNode('/'),
      createSpan('off', disabled)
    );
    return fragment;
  }

  function storeAllModules(containerSelector, modules) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    // Sort modules alphabetically by `data-name`
    const sortedModules = modules.sort((a, b) => {
      const nameA = a.element.querySelector('.name-package')?.dataset.name?.toLowerCase() || '';
      const nameB = b.element.querySelector('.name-package')?.dataset.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
    clearAndAppend(container, sortedModules.map((module) => module.element));
  }

  function clearAndAppend(container, elements) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    elements.forEach((element) => fragment.appendChild(element));
    container.appendChild(fragment);
  }
  // Add animation to <details> elements
  function animateDetails() {
    document.querySelectorAll('.module-matrix-item-details').forEach(details => {
      const header = details.querySelector('.matrix-details-header');
      const content = details.querySelector('.matrix-details-content');
      if (!header || !content) return;
      header.addEventListener('click', () => {
        const isOpen = details.classList.toggle('open');
        header.setAttribute('aria-expanded', isOpen.toString());
        if (isOpen) {
          content.style.height = content.scrollHeight + 'px';
          content.addEventListener('transitionend', function onExpand() {
            content.style.height = 'auto';
            content.removeEventListener('transitionend', onExpand);
          });
        } else {
          content.style.height = content.scrollHeight + 'px';
          requestAnimationFrame(() => (content.style.height = '0px'));
        }
      });
    });
  }
})(Drupal, drupalSettings, once);
