# Changelog

All notable changes to the Module Matrix module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Entries before 1.0.14 were not kept in this file; see the release notes on
drupal.org.

## [Unreleased]

## [1.0.14] - 2026-11-03

### Changed
- **Calmer accent palettes.** All 12 accent files (6 colors, light and dark)
  have new, softer values in the same color family. Sites that rely on the old
  shipped colors will see the new ones after updating.
- **SVG icons replace the Material Icons font.** The Extend page, the Uninstall
  page and the settings page now draw their icons from SVG files in `icons/`
  (Google Material Symbols, Apache License 2.0, with the license in
  `icons/LICENSE`). A new library, `module_matrix/icons`, loads
  `css/module-matrix.icons.css`. The module no longer ships or loads the icon
  font, so a page makes one less font request.
- **The settings page is redesigned.** It has a header band with links to the
  Extend and Uninstall pages, sections for Layout, Colors and Module
  Information Fields, picture tiles for the layout and style choices, and a
  live preview of the Extend page. A note replaces the fields section while
  Compact Layout is on. No setting, key or value changed.
- **The accent swatches and the preview use the colors the pages apply.** Each
  swatch shows the accent color of the chosen style mode, taken from the same
  values as the accent CSS files, so what you pick is what you get.
- **The Uninstall page matches the Extend page.** It has a package rail with
  counts, a search field, rows sorted by name and an accordion for each
  module's details, in the chosen style mode and accent.
- The active package link now sets `aria-current` so a screen reader knows
  which package is showing.
- The default package icon is `folder` instead of `category`.

### Removed
- The icon font file `fonts/MaterialIcons-Regular.woff2`. Custom CSS that uses
  the `material-icons` class inside Module Matrix pages needs checking; the
  class name is still defined in the JavaScript constants but nothing renders
  the font.
- The accent tooltip script `js/module-matrix.settings.js`; the accent colors
  are now visible swatches.

### Fixed
- Selectify, when installed, no longer restyles Module Matrix's own switches,
  filter checkboxes and uninstall picks (`data-selectify-skip`).
- The search field no longer shows the browser's history popup.
- Selecting a package no longer breaks on a package name that contains
  characters special to CSS selectors.
- Icons stay visible in Windows High Contrast (forced colors) mode on the
  Extend, Uninstall and settings pages.
- The fallback package name "Other" on the Uninstall page is translatable.
