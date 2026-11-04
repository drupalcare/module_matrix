# Module Matrix

**Module Matrix** is an advanced module management tool for Drupal that
combines performance, flexibility, and customization. Built entirely with
vanilla JavaScript, it eliminates the need for jQuery, making it lightweight
and fast. With responsive design and powerful features, Module Matrix is your
ultimate solution for managing modules efficiently.

## Features

### No jQuery Dependency

Module Matrix is designed to work without relying on jQuery,
ensuring better compatibility with modern web standards and faster performance.

### Advanced Filtering Options

Module Matrix provides instant client-side filtering options:

- **Text Search**: Quickly search modules by name or description.
- **Filter by Status**: Use checkboxes to filter Enabled, Disabled, or
  Unavailable modules.
- **Filter by Lifecycle**: Focus on Active, Deprecated, Experimental, or
  Obsolete modules.
- **Filter by Stability**: Sort modules by Stable, RC, Beta, Alpha, or Dev
  versions.

> **Note**: Lifecycle reflects the module’s current usability, while Stability
> indicates its development stage (e.g., stable or beta).

The filters include a reset button for clearing selections instantly.

### Package Links for Navigation

Modules are grouped by package with visual indicators:

- **Gray**: Total number of modules in a package.
- **Green**: Number of enabled modules.
- **Red**: Number of disabled modules.

Google Material Icons are used for a clean and modern visual design.

### Customizable Module List

The module list consists of two sections:

1. **Name and Package**: Displays the module name, package name, and an
   enable/disable checkbox.
2. **Details Section**: Customizable fields include Machine Name, Version,
   Lifecycle, Stability, Requires, Required By, Status, Project, Subpath,
   Last Modified, and links (Help, Permissions, Configure, Issue Link, Usage
   Link). All fields are styled with icons for clarity.

### Modern Page Layout

Module Matrix uses a responsive, table-free design with CSS Flex and Grid.
Users can choose between three layout options:

- **Left Layout**: Packages on the left, modules on the right.
- **Right Layout**: Packages on the right, modules on the left.
- **Top Layout**: Packages at the top, modules at the bottom.

Layouts are fully responsive and adapt below 992px for smaller screens.

### Fully Configurable Settings Form

The settings form allows users to:

- Choose between Left, Right, or Top layouts.
- Select which details appear in the module list (e.g., Machine Name, Version,
  Lifecycle, Stability).
- Enable a grid layout for a modern appearance.
- Activate Compact Mode for a minimalistic view.
- Toggle scrolling for long package lists.
- Disable custom styles for a plain interface.

### Quick Access and Permissions

- Access settings via `Configuration > System > Module Matrix Settings`.
- Use a quick access link at `admin/config/system/module-matrix-settings`.
- Assign permissions to restrict configuration access to specific roles.

## Module Matrix vs Module Filter

If you're already using
[Module Filter](https://www.drupal.org/project/module_filter), here's how
Module Matrix differs:

| Feature | Module Matrix | Module Filter |
|---------|---------------|---------------|
| jQuery dependency | None (vanilla JS) | Requires jQuery |
| Layout options | Left, Right, Top | Tabs or dropdown |
| Filter by lifecycle | Yes | No |
| Filter by stability | Yes | No |
| Customizable detail fields | Yes (14 toggleable fields) | No |
| Dark mode | Yes | No |
| Accent color themes | 6 options | No |
| Compact mode | Yes | No |
| Grid layout | Yes | No |
| Drupal.org links (issues, usage) | Yes | No |
| Submodule detection | Yes | No |

Module Filter is a mature, widely adopted module focused on filtering and
tabbed navigation. Module Matrix takes a different approach with a richer,
fully customizable interface including multiple layout modes, theme options,
and deeper module metadata display. Choose the one that fits your workflow.

## Installation

1. Download and enable Module Matrix.
2. Navigate to `admin/config/system/module-matrix-settings` to configure the
   module.

## Support

For feedback or issues, visit [Module Matrix on Drupal.org](https://www.drupal.org/project/module_matrix).
