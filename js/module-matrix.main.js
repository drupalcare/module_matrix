((Drupal, drupalSettings, once) => {
  'use strict';
  const formContext = document.querySelector('form.system-modules');
  if (!formContext) return;
  const filterInput = formContext.querySelector('#edit-text');
  const mainList = formContext.querySelector('.module-matrix-list');
  const statusCheckboxes = formContext.querySelectorAll('input[name^="checkboxes["][value="0"], input[name^="checkboxes["][value="1"]');
  const lifecycleCheckboxes = formContext.querySelectorAll('input[name^="checkboxes["]:not([value="0"]):not([value="1"])');
  const resetButton = formContext.querySelector('#reset-filters');
  let activePackage = 'all';
  Drupal.behaviors.moduleMatrixMain = {
    attach: function(context, settings) {
      const wrapperSelector = 'form.system-modules .module-matrix-wrapper';
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
    },
  };
  // Attach filtering logic
  function attachFilters(unifiedWrapper, mainList, sidebarSelector, data) {
    const packageLinks = unifiedWrapper.querySelectorAll('.package-link');
    // Attach input filter
    if (filterInput) {
      filterInput.addEventListener('input', () => {
        activePackage = 'all';
        applyFiltersWithAnimation(mainList, activePackage, data);
        updateActivePackageLink(sidebarSelector, 'all');
      });
    }
    // Attach checkbox filters
    statusCheckboxes.forEach((checkbox) =>
      checkbox.addEventListener('change', () => {
        activePackage = 'all';
        applyFiltersWithAnimation(mainList, activePackage, data);
        updateActivePackageLink(sidebarSelector, 'all');
      })
    );
    lifecycleCheckboxes.forEach((checkbox) =>
      checkbox.addEventListener('change', () => {
        activePackage = 'all';
        applyFiltersWithAnimation(mainList, activePackage, data);
        updateActivePackageLink(sidebarSelector, 'all');
      })
    );
    // Attach reset button
    if (resetButton) {
      resetButton.addEventListener('click', (e) => {
        activePackage = 'all';
        e.preventDefault();
        resetFiltersWithAnimation(mainList, sidebarSelector, data);
      });
    }
    // Attach package links
    packageLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        activePackage = link.dataset.package || 'all';
        applyFiltersWithAnimation(mainList, activePackage, data);
        updateActivePackageLink(sidebarSelector, activePackage);
      });
    });
  }
  // Apply filters with animation
  function applyFiltersWithAnimation(mainList, activePackage, data) {
    // Get filtered modules
    const filteredModules = Array.from(mainList.querySelectorAll('.module-matrix-list-inner'));
    // Apply filtering logic
    applyFilters(mainList, activePackage, data);
    // Apply animation to visible modules
    filteredModules.forEach((module) => {
      if (!module.classList.contains('hidden')) {
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
  // Reset filters with animation
  function resetFiltersWithAnimation(mainList, sidebarSelector, data) {
    resetFilters(mainList, sidebarSelector, data);
    // Animate all modules after reset
    const allModules = mainList.querySelectorAll('.module-matrix-list-inner');
    allModules.forEach((module) => {
      module.classList.add('matrix-animate-combined');
      module.addEventListener(
        'animationend',
        () => {
          module.classList.remove('matrix-animate-combined');
        }, {
          once: true
        }
      );
    });
  }
  // Apply filters
  function applyFilters(mainList, activePackage, data) {
    const query = filterInput?.value.toLowerCase().trim() || '';
    const selectedStatuses = Array.from(statusCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);
    const selectedLifecycles = Array.from(lifecycleCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);
    let visibleCount = 0;
    Array.from(mainList.querySelectorAll('.module-matrix-list-inner')).forEach((module) => {
      const moduleDetails = module.querySelector('.name-package');
      if (!moduleDetails) return;
      // Extract data attributes
      const moduleStatus = moduleDetails.dataset.status || '';
      const moduleLifecycle = moduleDetails.dataset.lifecycle || '';
      const modulePackage = moduleDetails.dataset.package || '';
      const moduleName = moduleDetails.dataset.name?.toLowerCase() || '';
      const moduleDescription = moduleDetails.dataset.description?.toLowerCase() || '';
      // Match filters
      const matchesQuery = query === '' || moduleName.includes(query) || moduleDescription.includes(query);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(moduleStatus);
      const matchesLifecycle = selectedLifecycles.length === 0 || selectedLifecycles.includes(moduleLifecycle);
      const matchesPackage = activePackage === 'all' || modulePackage === activePackage;
      const shouldHide = !(matchesQuery && matchesStatus && matchesLifecycle && matchesPackage);
      // Toggle visibility
      module.classList.toggle('hidden', shouldHide);
      if (!shouldHide) {
        visibleCount++;
      }
    });
    // Debugging logs
    console.log("Filtering Results:");
    console.log("Query:", query);
    console.log("Selected Statuses:", selectedStatuses);
    console.log("Selected Lifecycles:", selectedLifecycles);
    console.log("Active Package:", activePackage);
    console.log("Visible Modules:", visibleCount);
    console.log("Total Modules:", getTotalModules(data));
  }
  // Update active package link visually
  function updateActivePackageLink(sidebarSelector, activePackage) {
    const sidebar = document.querySelector(sidebarSelector);
    const packageLinks = sidebar.querySelectorAll('.package-link');
    packageLinks.forEach((link) => link.classList.remove('active'));
    const activeLink = sidebar.querySelector(`[data-package="${activePackage}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
  // Reset all filters
  function resetFilters(mainList, sidebarSelector, data) {
    if (!data) {
      console.error('Data object is not defined for resetFilters');
      return;
    }
    if (filterInput) filterInput.value = '';
    statusCheckboxes.forEach((checkbox) => (checkbox.checked = false));
    lifecycleCheckboxes.forEach((checkbox) => (checkbox.checked = false));
    applyFilters(mainList, 'all', data); // Pass the `data` object
    updateActivePackageLink(sidebarSelector, 'all');
  }

  function unifyModuleMatrix(wrapperSelector) {
    const wrappers = Array.from(document.querySelectorAll(wrapperSelector));
    if (wrappers.length === 0) return null;
    const mainWrapper = wrappers[0];
    const mainSidebar = mainWrapper.querySelector('.module-matrix-sidebar');
    const mainList = mainWrapper.querySelector('.module-matrix-list');
    if (!mainSidebar || !mainList) {
      console.error('Main sidebar or list not found in the first wrapper');
      return null;
    }
    // Initialize `data` using the wrapper
    const data = initializeModuleData(mainWrapper);
    // Ensure `data` is valid
    if (!data) {
      console.error('Failed to initialize module data');
      return null;
    }
    // Pass `data` to the sidebar initialization
    initializeSidebar(mainSidebar, mainList, data);
    mergeWrappers(wrappers, mainSidebar, mainList);
    return mainWrapper;
  }

  function initializeSidebar(mainSidebar, mainList, data) {
    once('moduleMatrixClick', mainSidebar).forEach(() => {
      mainSidebar.addEventListener('click', (event) =>
        handlePackageFilter(event, mainSidebar, mainList, data)
      );
    });
  }

  function mergeWrappers(wrappers, mainSidebar, mainList) {
    wrappers.slice(1).forEach((wrapper) => {
      mergeSidebar(wrapper.querySelector('.module-matrix-sidebar'), mainSidebar);
      mergeList(wrapper.querySelector('.module-matrix-list'), mainList);
      wrapper.remove();
    });
  }

  function mergeSidebar(sidebar, mainSidebar) {
    if (!sidebar) return;
    Array.from(sidebar.querySelectorAll('a')).forEach((link) => {
      if (!mainSidebar.querySelector(`[data-package="${link.dataset.package}"]`)) {
        mainSidebar.appendChild(link);
      }
    });
    const allLinks = mainSidebar.querySelectorAll('.package-link');
    if (!mainSidebar.querySelector('.package-link.active')) {
      const allModulesLink = mainSidebar.querySelector('.package-link-all');
      if (allModulesLink) {
        allModulesLink.classList.add('active'); // Default to "All Modules".
      }
    }
  }

  function mergeList(list, mainList) {
    if (!list) return;
    Array.from(list.querySelectorAll('.module-matrix-list-inner')).forEach((module) => {
      mainList.appendChild(module);
    });
  }
  // Filtering Logic
  function handlePackageFilter(event, mainSidebar, mainList, data) {
    const link = event.target.closest('.package-link');
    if (!link) return;
    event.preventDefault();
    // Update active package
    const packageFilter = link.dataset.package;
    activePackage = packageFilter;
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
      console.error('Module list not found inside wrapper');
      return data;
    }
    const moduleItems = Array.from(moduleList.querySelectorAll('.module-matrix-list-inner'));
    // console.log(`Found ${moduleItems.length} individual modules (.module-matrix-list-inner)`);
    moduleItems.forEach((item, index) => processModuleItem(item, index, data));
    // Validate counts after initialization
    // console.log('Initialized Data:', {
    //   totalModules: getTotalModules(data),
    //   totalEnabled: getTotalEnabled(data),
    //   totalDisabled: getTotalDisabled(data),
    // });
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
      modulesByName: [],
      modules: [],
    };
  }

  function getModuleList(wrapper) {
    return wrapper.querySelector('.module-matrix-list');
  }

  function processModuleItem(item, index, data) {
    const namePackage = item.querySelector('.name-package');
    const details = item.querySelector('.name-package');
    if (!namePackage || !details) {
      // console.warn(`Module #${index + 1} missing name-package or name-package`);
      return;
    }
    const packageName = details.dataset.package || 'unknown';
    const isEnabled = details.dataset.status && parseInt(details.dataset.status) === 1;
    const moduleName = namePackage.textContent.trim() || '';
    const moduleDate = details.dataset.date || '';
    const moduleStability = details.dataset.stability || '';
    updateModuleCounts(data, packageName, isEnabled);
    updateModuleLists(data, item, packageName, moduleName, moduleDate, moduleStability);
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

  function updateModuleLists(data, item, packageName, moduleName, moduleDate, moduleStability) {
    data.modules.push({
      element: item,
      packageName,
      name: moduleName,
      date: moduleDate,
      stability: moduleStability,
    });
    data.modulesByDate.push({
      element: item,
      date: moduleDate,
    });
    data.modulesByStability.push({
      element: item,
      stability: moduleStability,
    });
    data.modulesByName.push({
      element: item,
      name: moduleName,
    });
  }
  //Data Utilities
  /**
   * Utility functions for data manipulation
   */
  function getTotalModules(data) {
    return data.totalModules;
  }

  function getTotalEnabled(data) {
    return data.totalEnabled;
  }

  function getTotalDisabled(data) {
    return data.totalDisabled;
  }

  function getPackageCounts(data) {
    return data.packageCounts;
  }

  function getPackageEnabledCounts(data) {
    return data.packageEnabledCounts;
  }

  function getPackageDisabledCounts(data) {
    return data.packageDisabledCounts;
  }

  function getModulesByDate(data) {
    return sortAlphabetically(data.modulesByDate, 'date');
  }

  function getModulesByStability(data) {
    return sortAlphabetically(data.modulesByStability, 'stability');
  }

  function getModulesByName(data) {
    return sortAlphabetically(data.modulesByName, 'name');
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
      console.error(`Sidebar not found for selector: ${sidebarSelector}`);
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
      ['package-link-all', 'active'],
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
      package: packageName,
    });
    classList.forEach((className) => link.classList.add(className));

    // Add the material-icons span to the left
    const iconSpan = document.createElement('span');
    iconSpan.className = 'material-icons';
    iconSpan.textContent = 'category';
    link.prepend(iconSpan);

    // Add the span elements for counts
    const countSpans = createCountSpans(total, enabled, disabled);
    link.appendChild(countSpans);

    // Add specific behavior for "All Modules" link
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (!data) {
        console.error('Data object is not defined for applyFilters');
        return;
      }
      if (isAllModulesLink) {
        resetFilters(mainList, '.module-matrix-sidebar', data); // Use `data` here
      } else {
        activePackage = packageName;
        applyFilters(mainList, activePackage, data); // Use `data` here
        updateActivePackageLink('.module-matrix-sidebar', activePackage);
      }
    });
    return link;
  }

  function storeAllModules(containerSelector, modules) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      //console.error(`Container not found for selector: ${containerSelector}`);
      return;
    }
    clearAndAppend(container, modules.map((module) => module.element));
    //console.log('All modules stored:', modules);
  }

  function sortAlphabetically(array, key) {
    return [...array].sort((a, b) => a[key].localeCompare(b[key]));
  }

  function clearAndAppend(container, elements) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    elements.forEach((element) => fragment.appendChild(element));
    container.appendChild(fragment);
  }

  function getUpdateFunctions(modules) {
    return modules.filter((module) => {
      const details = module.element.querySelector('.name-package');
      return details && details.dataset.update === '1'; // Assuming 'data-update="1"' indicates an update function
    });
  }

  function createCountSpans(total = 0, enabled = 0, disabled = 0) {
    const fragment = document.createDocumentFragment();
    // Create total span
    const totalSpan = document.createElement('span');
    totalSpan.className = 'total';
    totalSpan.textContent = total;
    fragment.appendChild(totalSpan);
    // Create enabled span
    const onSpan = document.createElement('span');
    onSpan.className = 'on';
    onSpan.textContent = enabled;
    fragment.appendChild(onSpan);
    // Create separator span
    const separator = document.createElement('span');
    separator.textContent = '/';
    fragment.appendChild(separator);
    // Create disabled span
    const offSpan = document.createElement('span');
    offSpan.className = 'off';
    offSpan.textContent = disabled;
    fragment.appendChild(offSpan);
    return fragment;
  }
})(Drupal, drupalSettings, once);
