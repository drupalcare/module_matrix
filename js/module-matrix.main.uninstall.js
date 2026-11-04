/**
 * @file
 * Module Matrix Main Uninstall.
 *
 * Sorts the uninstall rows by name, filters them by the search field and the
 * package rail, and turns each row's details into an accordion.
 *
 * Filename:     module-matrix-main-uninstall.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */

((Drupal, once) => {
  'use strict';

  const FORM = 'form#system-modules-uninstall';

  Drupal.behaviors.moduleMatrixUninstallFilter = {
    attach(context) {
      once('mm-uninstall-filter', FORM, context).forEach((form) => {
        const list = form.querySelector('.module-matrix-list');
        if (!list) {
          return;
        }
        const searchInput = form.querySelector('#edit-text');
        const sidebar = form.querySelector('.module-matrix-sidebar');
        const rows = Array.from(
          list.querySelectorAll('.module-matrix-list-inner:not(.empty-message)'),
        );
        let activePackage = 'all';

        // Sort modules alphabetically on page load.
        const nameOf = (row) =>
          (row.querySelector('.module-name')?.textContent || '').trim().toLowerCase();
        rows.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
        rows.forEach((row) => list.appendChild(row));

        // A row shows when it matches both the search text and the package.
        const applyFilters = () => {
          const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
          rows.forEach((row) => {
            const inPackage = activePackage === 'all' || row.dataset.package === activePackage;
            const matches = !searchText || row.textContent.toLowerCase().includes(searchText);
            row.style.display = inPackage && matches ? '' : 'none';
          });
        };

        if (searchInput) {
          searchInput.addEventListener('input', applyFilters);
        }

        if (sidebar) {
          sidebar.addEventListener('click', (event) => {
            const link = event.target.closest('.package-link');
            if (!link || !sidebar.contains(link)) {
              return;
            }
            event.preventDefault();
            activePackage = link.dataset.package || 'all';
            sidebar.querySelectorAll('.package-link').forEach((item) => {
              const isActive = item === link;
              item.classList.toggle('active', isActive);
              if (isActive) {
                item.setAttribute('aria-current', 'true');
              }
              else {
                item.removeAttribute('aria-current');
              }
            });
            applyFilters();
          });
        }
      });
    },
  };

  Drupal.behaviors.moduleMatrixUninstallAccordion = {
    attach(context) {
      once('mm-uninstall-acc', `${FORM} .matrix-details-header`, context).forEach((header) => {
        const panel = document.getElementById(header.getAttribute('aria-controls'));
        if (!panel) {
          return;
        }
        const details = header.closest('.module-matrix-item-details');
        // The markup ships open so the reasons stay readable without
        // JavaScript; collapse here, where the button can reopen it.
        const setOpen = (open) => {
          header.setAttribute('aria-expanded', open ? 'true' : 'false');
          panel.hidden = !open;
          if (details) {
            details.classList.toggle('open', open);
          }
        };
        setOpen(false);
        header.addEventListener('click', () => {
          setOpen(header.getAttribute('aria-expanded') !== 'true');
        });
      });
    },
  };
})(Drupal, once);
