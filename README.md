## Overview

The **Module Matrix** module (machine name: `module_matrix`) enhances the
experience of managing modules in Drupal by offering an intuitive, dynamic, and
filterable user interface. Built with modern vanilla JavaScript and an
accessible design, Module Matrix aims to streamline module management by
categorizing, filtering, and presenting detailed information in an interactive
way.

## Features

- **Modern JavaScript**: Utilizes vanilla JavaScript for optimal performance
  and lightweight implementation.
- **Dynamic Filtering**: Filter modules by name, package, status, or lifecycle
  using a real-time search box and checkboxes.
- **Enhanced Sidebar Navigation**: Automatically generates package links in
  the sidebar for easy navigation between module categories.
- **Responsive Design**: Provides flexible layouts that adapt to various screen
  sizes and orientations, including grid and compact views.
- **Detailed Module Information**: Displays module descriptions, versions,
  lifecycles, dependencies, and administrative links in a clean, expandable
  format.
- **Customizable Styling**: Offers modular CSS files to adapt the styling to
  your theme’s design.
- **Smooth Animations**: Includes subtle animations for a polished user
  experience.
- **Accessible by Design**: Ensures compatibility with screen readers and
  keyboard navigation.

## Accessibility

The **Module Matrix** module is designed with accessibility in mind:

- **ARIA Roles and Properties**: Provides context and state information for
  screen readers.
- **Keyboard Navigation**: Fully functional navigation and interaction using a
  keyboard.
- **Focus Management**: Automatically focuses on interactive elements when
  appropriate.

## Configuration

After installing and enabling the module, access the settings page at
`/admin/config/system/module-matrix-settings`:

1. **Sidebar Layout**: Choose from top, left, or right layouts for the sidebar.
2. **Grid or List View**: Switch between grid and list layouts for the module
   list.
3. **Default Filters**: Set default filters for the module listing page.
4. **CSS Customization**: Enable or disable the module’s built-in CSS for
   styling.

## Example Usage

1. Navigate to the module management page.
2. Use the search bar to filter modules by name or description.
3. Apply additional filters using the checkboxes for status and lifecycle.
4. Click on a package link in the sidebar to view modules in that category.
5. Expand a module’s details to see version, dependencies, and administrative
   links.

## Installation

1. Download and install the module from
   [Drupal.org](https://www.drupal.org/project/module_matrix).
2. Enable the module through the Drupal admin interface or using Drush:
   `drush en module_matrix`
3. Clear caches to ensure the module is fully functional:
   `drush cr`

## Troubleshooting

If you encounter any issues:

1. Verify that JavaScript is enabled and running in your browser.
2. Check the console for errors that might indicate conflicts with other
   modules or themes.
3. Open an issue in the module’s issue queue on Drupal.org for support.

## Maintainers

- [Alaa Haddad](https://www.drupal.org/u/flashwebcenter)

## Support

For issues, feature requests, or general support, please use the
[issue queue](https://www.drupal.org/project/issues/module_matrix).

## License

This project is licensed under the
[GNU General Public License, version 2 or later](http://www.gnu.org/licenses/gpl-2.0.html).

---

This README adheres to Drupal best practices, providing clear documentation for
users to understand the module’s functionality and setup.
