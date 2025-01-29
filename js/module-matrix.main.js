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
  const formContext = document.querySelector('form.system-modules');
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
      animateDetails();
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
    stabilityCheckboxes.forEach((checkbox) =>
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
    const selectedStability = Array.from(stabilityCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    // Get all modules
    const allModules = Array.from(mainList.querySelectorAll('.module-matrix-list-inner'));

    // Filter and collect visible modules
    const visibleModules = allModules.filter((module) => {
      const moduleDetails = module.querySelector('.name-package');
      if (!moduleDetails) return false;

      const moduleName = moduleDetails.dataset.name?.toLowerCase() || '';
      const moduleDescription = moduleDetails.dataset.description?.toLowerCase() || '';
      const modulePackage = moduleDetails.dataset.package || '';
      const moduleStatus = moduleDetails.dataset.status || '';
      const moduleLifecycle = moduleDetails.dataset.lifecycle || '';
      const moduleStability = moduleDetails.dataset.stability || '';

      const matchesQuery = query === '' || moduleName.includes(query) || moduleDescription.includes(query);
      const matchesPackage = activePackage === 'all' || modulePackage === activePackage;
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(moduleStatus);
      const matchesLifecycle = selectedLifecycles.length === 0 || selectedLifecycles.includes(moduleLifecycle);
      const matchesStability = selectedStability.length === 0 || selectedStability.includes(moduleStability);

      return matchesQuery && matchesPackage && matchesStatus && matchesLifecycle && matchesStability;
    });

    // Sort the filtered modules alphabetically by `data-name`
    const sortedVisibleModules = visibleModules.sort((a, b) => {
      const nameA = a.querySelector('.name-package')?.dataset.name?.toLowerCase() || '';
      const nameB = b.querySelector('.name-package')?.dataset.name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });

    // Hide all modules and then show only the filtered and sorted ones
    allModules.forEach((module) => module.classList.add('hidden'));
    sortedVisibleModules.forEach((module) => module.classList.remove('hidden'));

    // Debugging
    //console.log(`Visible modules after filtering and sorting: ${sortedVisibleModules.length}`);
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
    const wrappers = Array.from(document.querySelectorAll(wrapperSelector));
    if (wrappers.length === 0) return null;
    const mainWrapper = wrappers[0];
    const mainSidebar = mainWrapper.querySelector('.module-matrix-sidebar');
    const mainList = mainWrapper.querySelector('.module-matrix-list');
    if (!mainSidebar || !mainList) {
      // console.error('Main sidebar or list not found in the first wrapper');
      return null;
    }
    // Initialize `data` using the wrapper
    const data = initializeModuleData(mainWrapper);
    // Ensure `data` is valid
    if (!data) {
      // console.error('Failed to initialize module data');
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
    const details = item.querySelector('.name-package');
    if (!namePackage || !details) {
      // console.warn(`Module #${index + 1} missing name-package or name-package`);
      return;
    }
    const packageName = details.dataset.package || 'unknown';
    const isEnabled = details.dataset.status && parseInt(details.dataset.status) === 1;
    const moduleName = namePackage.textContent.trim() || '';
    const moduleDate = details.dataset.date || '';
    const moduleLifecycle = details.dataset.lifecycle || '';
    const moduleStability = details.dataset.stability || '';
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
    data.modules.push({
      element: item,
      packageName,
      name: moduleName,
      date: moduleDate,
      stability: moduleStability,
      lifecycle: moduleLifecycle,
    });
    data.modulesByDate.push({
      element: item,
      date: moduleDate,
    });
    data.modulesByLifecycle.push({
      element: item,
      lifecycle: moduleLifecycle,
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
      ['package-link', 'package-link-all' , 'active'],
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
    const link = generateLinkElement(label, href, { package: packageName });
    classList.forEach((className) => link.classList.add(className));

    // Create container for left side (icon + text)
    const leftContainer = document.createElement('div');
    leftContainer.className = 'package-link-left';

    // Add the material-icons span to the left container
    const iconSpan = document.createElement('span');
    iconSpan.className = 'material-icons';
    iconSpan.textContent = 'category';

    // Add the label to the left container
    const labelSpan = document.createElement('span');
    labelSpan.className = 'package-label';
    labelSpan.textContent = label;

    leftContainer.appendChild(iconSpan);
    leftContainer.appendChild(labelSpan);

    // Create container for right side (totals)
    const rightContainer = document.createElement('div');
    rightContainer.className = 'package-link-right';

    // Add total, enabled, and disabled spans to the right container
    const totalSpan = document.createElement('span');
    totalSpan.className = 'total';
    totalSpan.textContent = total;

    const onSpan = document.createElement('span');
    onSpan.className = 'on';
    onSpan.textContent = enabled;

    const separator = document.createElement('span');
    separator.textContent = '/';

    const offSpan = document.createElement('span');
    offSpan.className = 'off';
    offSpan.textContent = disabled;

    rightContainer.appendChild(totalSpan);
    rightContainer.appendChild(onSpan);
    rightContainer.appendChild(separator);
    rightContainer.appendChild(offSpan);

    // Append both left and right containers to the link
    link.innerHTML = ''; // Clear link content
    link.appendChild(leftContainer);
    link.appendChild(rightContainer);

    return link;
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

  // Add animation to <details> elements
  function animateDetails() {
    const detailsElements = document.querySelectorAll('details');

    detailsElements.forEach((details) => {
      const wrapper = details.querySelector('.details-wrapper');
      if (!wrapper) return;

      // Add initial styles
      wrapper.style.transition = 'height 0.3s ease';
      wrapper.style.overflow = 'hidden';
      wrapper.style.height = details.open ? `${wrapper.scrollHeight}px` : '0px';

      // Listen for toggle events
      details.addEventListener('toggle', () => {
        if (details.open) {
          // Animate expanding
          wrapper.style.height = `${wrapper.scrollHeight}px`;
        } else {
          // Animate collapsing
          wrapper.style.height = '0px';
        }
      });
    });
  }

  // function getUpdateFunctions(modules) {
  //   return modules.filter((module) => {
  //     const details = module.element.querySelector('.name-package');
  //     return details && details.dataset.update === '1';
  //   });
  // }

  // function sortAlphabetically(array, key) {
  //   return [...array].sort((a, b) => a[key].localeCompare(b[key]));
  // }

  /**
   * Utility functions for data manipulation
   */
  // function getTotalModules(data) {
  //   return data.totalModules;
  // }

  // function getTotalEnabled(data) {
  //   return data.totalEnabled;
  // }

  // function getTotalDisabled(data) {
  //   return data.totalDisabled;
  // }

  // function getPackageCounts(data) {
  //   return data.packageCounts;
  // }

  // function getPackageEnabledCounts(data) {
  //   return data.packageEnabledCounts;
  // }

  // function getPackageDisabledCounts(data) {
  //   return data.packageDisabledCounts;
  // }

  // function getModulesByDate(data) {
  //   return sortAlphabetically(data.modulesByDate, 'date');
  // }

  // function getModulesByStability(data) {
  //   return sortAlphabetically(data.modulesByStability, 'stability');
  // }

  // function getModulesByLifecycle(data) {
  //   return sortAlphabetically(data.modulesByLifecycle, 'lifecycle');
  // }

  // function getModulesByName(data) {
  //   return sortAlphabetically(data.modulesByName, 'name');
  // }

})(Drupal, drupalSettings, once);
