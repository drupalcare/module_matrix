/**
 * @file
 * Module Matrix Main Uninstall.
 *
 * Filename:     module-matrix-main-uninstall.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */

(function (Drupal) {
  "use strict";

  Drupal.behaviors.moduleMatrixUninstallFilter = {
    attach: function (context, settings) {
      const searchInput = context.querySelector("#edit-text");
      const moduleListWrapper = context.querySelector(".module-matrix-list");

      if (!searchInput || !moduleListWrapper) {
        return;
      }

      let modules = Array.from(moduleListWrapper.querySelectorAll(".module-matrix-list-inner"));

      // Sort modules alphabetically on page load
      modules.sort((a, b) => {
        const nameA = a.querySelector(".module-name").textContent.trim().toLowerCase();
        const nameB = b.querySelector(".module-name").textContent.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });

      // Append sorted modules to the list
      modules.forEach(module => moduleListWrapper.appendChild(module));

      // Search filter function
      searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase();

        modules.forEach((module) => {
          const moduleText = module.textContent.toLowerCase();
          module.style.display = moduleText.includes(searchText) ? "" : "none";
        });
      });
    },
  };
})(Drupal);

