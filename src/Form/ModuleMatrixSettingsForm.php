<?php

namespace Drupal\module_matrix\Form;

use Drupal\Core\Url;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configuration form for Module Matrix settings.
 */
class ModuleMatrixSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['module_matrix.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'module_matrix_settings_form';
  }

  /**
   * Build the settings form.
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {
    // Attach the CSS library.
    $form['#attached']['library'][] = 'module_matrix/matrix-settings';

    $config = $this->config('module_matrix.settings');

    // Grouped container for module options settings.
    $form['module_options_settings'] = [
      '#type' => 'container',
      '#title' => $this->t('Module Options Settings'),
    ];

    // Add a message at the top of the form with a description.
    $form['module_options_settings']['intro_message'] = [
      '#type' => 'markup',
      '#markup' => '<p>' . $this->t('This form allows you to configure module-related settings. Toggle the options below to enable or disable specific module features: Machine Name, Version, Lifecycle, Requires, Required By, Status, Project, Subpath, Last Modified, Stability, Links (Help, Permissions, Configure), Issue Link, Usage Link. These settings affect the <a href=":url" target="_blank">module administration page</a>.', [
        ':url' => Url::fromRoute('system.modules_list')->toString(),
      ]) . '</p>',
      '#attributes' => ['class' => ['intro-message-class']],
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
      'module_subpath' => $this->t('Subpath'),
      'module_mtime' => $this->t('Last Modified'),
      'module_stability' => $this->t('Stability'),
      'module_links' => $this->t('Links (Help, Permissions, Configure)'),
      'module_issue_link' => $this->t('Issue Link'),
      'module_usage_link' => $this->t('Usage Link'),
    ];

    foreach ($fields as $field_key => $label) {
      $form['module_options_settings'][$field_key] = [
        '#type' => 'checkbox',
        '#title' => $label,
        '#default_value' => $config->get($field_key) ?? 1,
        '#states' => [
          // Disabled by compact layout.
          'disabled' => [':input.compact-layout-toggle' => ['checked' => TRUE]],
        ],
      ];
    }

    $form['appearance_settings'] = [
      '#type' => 'container',
      '#title' => $this->t('Module Options Settings'),
    ];

    // Scrollable sidebar checkbox.
    $form['appearance_settings']['scrollable_sidebar'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Scrollable Sidebar'),
      '#default_value' => $config->get('scrollable_sidebar') ?? 0,
      '#description' => $this->t('Make the sidebar scrollable when there are too many items.'),
    ];

    // New "Grid Layout" checkbox.
    $form['appearance_settings']['grid_layout'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Grid Layout'),
      '#default_value' => $config->get('grid_layout') ?? 0,
      '#description' => $this->t('Switch to a grid layout to transform the list into a responsive grid.'),
    ];

    // Add "Compact Layout" checkbox.
    $form['appearance_settings']['compact_layout'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Compact Layout'),
      '#default_value' => $config->get('compact_layout') ?? 0,
      '#description' => $this->t("Enable Compact Layout to simplify the interface. When enabled, the following settings will be disabled: Description, Machine Name, Lifecycle, Requires, Required By, Status, Project, Last Modified, Stability, Issue Link, and Usage Link. Note that the Name and Package options are alawys displayed."),
      '#attributes' => ['class' => ['compact-layout-toggle']],
    ];

    // New "Style Mode" radio buttons.
    $form['appearance_settings']['style_mode'] = [
      '#type' => 'radios',
      '#title' => $this->t('Style Mode'),
      '#options' => [
        'light' => $this->t('Light'),
        'dark' => $this->t('Dark'),
        'none' => $this->t('None'),
      ],
      '#default_value' => $config->get('style_mode') ?? 'light',
      '#description' => $this->t('Select a style mode for the interface. Choose Light or Dark to apply a theme with an accent color, or select None to disable styling and use the default appearance.'),
    ];

    // New "Accent Color" radio buttons.
    $form['appearance_settings']['accent_color'] = [
      '#type' => 'radios',
      '#title' => $this->t('Accent Color'),
      '#options' => [
        'teal' => $this->t('Teal'),
        'coral' => $this->t('Coral'),
        'indigo' => $this->t('Indigo'),
        'gold' => $this->t('Gold'),
        'slate' => $this->t('Slate'),
        'neutral' => $this->t('Neutral'),
      ],
      '#default_value' => $config->get('accent_color') ?? 'neutral',
      '#description' => $this->t('Choose an accent color to apply when a style mode is selected. This option is disabled if styling is turned off.'),
      '#states' => [
        'disabled' => [
          ':input[name="style_mode"]' => ['value' => 'none'],
        ],
      ],
      '#after_build' => [
          [get_called_class(), 'addDataAccent'],
      ],
    ];

    $form['appearance_settings']['layout'] = [
      '#type' => 'radios',
      '#title' => $this->t('Choose the layout for displaying modules and packages'),
      '#default_value' => $config->get('layout') ?? 'left',
      '#options' => [
        'left' => $this->t('<strong>Left:</strong> Packages are displayed on the left, and modules are displayed on the right.'),
        'right' => $this->t('<strong>Right:</strong> Packages are displayed on the right, and modules are displayed on the left.'),
        'top' => $this->t('<strong>Top:</strong> Packages are displayed at the top, and modules are displayed at the bottom.'),
      ],
      '#description' => $this->t('Select the layout that works best for your display.'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * Adds data-accent attributes to each radio button.
   */
  public static function addDataAccent($element) {
    foreach ($element['#options'] as $key => $label) {
      $element[$key]['#attributes']['data-accent'] = $label;
    }
    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {
    $config = $this->config('module_matrix.settings');
    foreach ($form_state->getValues() as $key => $value) {
      $config->set($key, $value);
    }
    $config->save();
    parent::submitForm($form, $form_state);
  }

}
