<?php

namespace Drupal\module_matrix\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configuration form for Module Matrix settings.
 */
class ModuleMatrixSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['module_matrix.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'module_matrix_settings_form';
  }

  /**
   * Build the settings form.
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('module_matrix.settings');

    // Existing layout radios.
    // Add "Layout" radio buttons with detailed descriptions.
    $form['layout'] = [
      '#type' => 'radios',
      '#title' => $this->t('Layout'),
      '#default_value' => $config->get('layout') ?? 'right',
      '#options' => [
        'left' => $this->t('Left Sidebar'),
        'right' => $this->t('Right Side'),
        'top' => $this->t('Top Sidebar'),
      ],
      '#description' => $this->t('Choose the layout for displaying modules and packages:
        <ul>
          <li><strong>Default:</strong> Packages are displayed on the left, and modules are displayed on the right.</li>
          <li><strong>Right Side:</strong> Sidebar appears on the right, and modules are displayed on the left.</li>
          <li><strong>Top Sidebar:</strong> Packages are displayed at the top, and modules are displayed at the bottom.</li>
        </ul>'),
    ];

    // Scrollable sidebar checkbox.
    $form['scrollable_sidebar'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Scrollable Sidebar'),
      '#default_value' => $config->get('scrollable_sidebar') ?? 0,
      '#description' => $this->t('Make the sidebar scrollable when there are too many items.'),
    ];

    // New "Disable Library" checkbox.
    $form['disable_library'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Disable Library'),
      '#default_value' => $config->get('disable_library') ?? 0,
      '#description' => $this->t('Check this to disable a library. This option is not affected by Compact Layout.'),
    ];

    // New "Grid Layout" checkbox.
    $form['grid_layout'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Grid Layout'),
      '#default_value' => $config->get('grid_layout') ?? 0,
      '#description' => $this->t('Switch to a grid layout. This option is not affected by Compact Layout.'),
    ];

    // Additional settings that can be toggled.
    $fields = [
      'module_machine_name' => $this->t('Machine Name'),
      'module_version' => $this->t('Version'),
      'module_lifecycle' => $this->t('Lifecycle'),
      'module_requires' => $this->t('Requires'),
      'module_required_by' => $this->t('Required By'),
      'module_status' => $this->t('Status'),
      'module_project' => $this->t('Project'),
      'module_mtime' => $this->t('Last Modified'),
      'module_stability' => $this->t('Stability'),
      'module_links' => $this->t('Links (Help, Permissions, Configure)'),
      'module_issue_link' => $this->t('Issue Link'),
      'module_usage_link' => $this->t('Usage Link'),
    ];

    foreach ($fields as $field_key => $label) {
      $form[$field_key] = [
        '#type' => 'checkbox',
        '#title' => $label,
        '#default_value' => $config->get($field_key) ?? 1,
        '#states' => [
                // Disabled by compact layout.
          'disabled' => [':input.compact-layout-toggle' => ['checked' => TRUE]],
        ],
      ];
    }

    // Add "Compact Layout" checkbox.
    $form['compact_layout'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Compact Layout'),
      '#default_value' => $config->get('compact_layout') ?? 0,
      '#description' => $this->t("Enable Compact Layout to simplify the interface. When enabled, the following settings will be disabled: Description, Machine Name, Version, Lifecycle, Requires, Required By, Status, Project, Last Modified, Stability, Links (Help, Permissions, Configure), Issue Link, and Usage Link. Note that the Name and Package options are alawys displayed."),
      '#attributes' => ['class' => ['compact-layout-toggle']],
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('module_matrix.settings');
    foreach ($form_state->getValues() as $key => $value) {
      $config->set($key, $value);
    }
    $config->save();
    parent::submitForm($form, $form_state);
  }

}
