<?php

declare(strict_types=1);

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

    // =========================================================================
    // SECTION 1: Layout & Display Settings
    // =========================================================================
    $form['layout_display'] = [
      '#type' => 'details',
      '#title' => $this->t('Layout & Display Settings'),
      '#description' => $this->t('Configure how modules and packages are displayed on the administration page.'),
      '#open' => TRUE,
      '#weight' => 0,
    ];

    $form['layout_display']['layout'] = [
      '#type' => 'radios',
      '#title' => $this->t('Layout Position'),
      '#default_value' => $config->get('layout') ?? 'left',
      '#options' => [
        'left' => $this->t('<strong>Left:</strong> Packages on the left, modules on the right'),
        'right' => $this->t('<strong>Right:</strong> Packages on the right, modules on the left'),
        'top' => $this->t('<strong>Top:</strong> Packages at the top, modules at the bottom'),
      ],
      '#description' => $this->t('Choose where package navigation appears relative to the module list.'),
    ];

    $form['layout_display']['grid_layout'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Grid Layout'),
      '#default_value' => $config->get('grid_layout') ?? FALSE,
      '#description' => $this->t('Transform the module list into a responsive grid layout instead of a traditional table.'),
    ];

    $form['layout_display']['scrollable_sidebar'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Scrollable Sidebar'),
      '#default_value' => $config->get('scrollable_sidebar') ?? FALSE,
      '#description' => $this->t('Make the package sidebar scrollable when there are many packages.'),
    ];

    $form['layout_display']['compact_layout'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Compact Layout'),
      '#default_value' => $config->get('compact_layout') ?? FALSE,
      '#description' => $this->t('Simplify the interface by hiding most optional fields. Only Name, Description, and Package will be displayed.'),
      '#attributes' => ['class' => ['compact-layout-toggle']],
    ];

    // =========================================================================
    // SECTION 2: Color Theme
    // =========================================================================
    $form['color_theme'] = [
      '#type' => 'details',
      '#title' => $this->t('Color Theme'),
      '#description' => $this->t('Customize the visual appearance with style modes and accent colors.'),
      '#open' => FALSE,
      '#weight' => 10,
    ];

    $form['color_theme']['style_mode'] = [
      '#type' => 'radios',
      '#title' => $this->t('Style Mode'),
      '#options' => [
        'light' => $this->t('Light'),
        'dark' => $this->t('Dark'),
        'none' => $this->t('None - Use default browser styles'),
      ],
      '#default_value' => $config->get('style_mode') ?? 'light',
      '#description' => $this->t('Select a color theme for the module administration interface.'),
    ];

    $form['color_theme']['accent_color'] = [
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
      '#description' => $this->t('Choose the accent color for highlights and interactive elements.'),
      '#states' => [
        'disabled' => [
          ':input[name="style_mode"]' => ['value' => 'none'],
        ],
      ],
      '#after_build' => [
        [get_called_class(), 'addDataAccent'],
      ],
    ];

    // =========================================================================
    // SECTION 3: Module Information Fields
    // =========================================================================
    $form['module_fields'] = [
      '#type' => 'details',
      '#title' => $this->t('Module Information Fields'),
      '#description' => $this->t('Choose which information fields to display for each module. These settings apply to the <a href=":modules_url" target="_blank">module administration page</a>. The <a href=":uninstall_url" target="_blank">uninstall page</a> has a fixed layout showing only Name, Description, and Required By.', [
        ':modules_url' => Url::fromRoute('system.modules_list')->toString(),
        ':uninstall_url' => Url::fromRoute('system.modules_uninstall')->toString(),
      ]),
      '#open' => TRUE,
      '#weight' => 20,
      '#states' => [
        'visible' => [
          ':input[name="compact_layout"]' => ['checked' => FALSE],
        ],
      ],
    ];

    // Module field options grouped by category.
    $field_groups = [
      'basic_info' => [
        'title' => $this->t('Basic Information'),
        'fields' => [
          'module_machine_name' => $this->t('Machine Name'),
          'module_version' => $this->t('Version'),
          'module_status' => $this->t('Status'),
        ],
      ],
      'dependencies' => [
        'title' => $this->t('Dependencies'),
        'fields' => [
          'module_requires' => $this->t('Requires'),
          'module_required_by' => $this->t('Required By'),
        ],
      ],
      'project_info' => [
        'title' => $this->t('Project Information'),
        'fields' => [
          'module_project' => $this->t('Project'),
          'module_subpath' => $this->t('Subpath'),
          'module_lifecycle' => $this->t('Lifecycle'),
          'module_stability' => $this->t('Stability'),
          'module_mtime' => $this->t('Last Modified'),
        ],
      ],
      'links' => [
        'title' => $this->t('Links & Resources'),
        'fields' => [
          'module_links' => $this->t('Help, Permissions, Configure'),
          'module_issue_link' => $this->t('Issue Queue Link'),
          'module_usage_link' => $this->t('Usage Statistics Link'),
        ],
      ],
    ];

    foreach ($field_groups as $group_key => $group_data) {
      $form['module_fields'][$group_key] = [
        '#type' => 'fieldset',
        '#title' => $group_data['title'],
      ];

      foreach ($group_data['fields'] as $field_key => $label) {
        // No '#states' => 'disabled' here. Compact layout already hides this
        // whole section through the '#states' => 'visible' on
        // $form['module_fields'], and hidden inputs still post their values.
        // Disabling them instead stopped the browser from sending them at all,
        // so saving the form while compact layout was on silently rewrote every
        // one of these to FALSE and the user lost settings they never touched.
        $form['module_fields'][$group_key][$field_key] = [
          '#type' => 'checkbox',
          '#title' => $label,
          '#default_value' => $config->get($field_key) ?? TRUE,
        ];
      }
    }

    return parent::buildForm($form, $form_state);
  }

  /**
   * Adds data-accent attributes to each radio button for visual styling.
   *
   * @param array $element
   *   The form element being processed.
   *
   * @return array
   *   The modified form element with data attributes added.
   */
  public static function addDataAccent(array $element): array {
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

    // Save layout & display settings.
    $config->set('layout', $form_state->getValue('layout'))
      ->set('grid_layout', $form_state->getValue('grid_layout'))
      ->set('scrollable_sidebar', $form_state->getValue('scrollable_sidebar'))
      ->set('compact_layout', $form_state->getValue('compact_layout'));

    // Save color theme settings.
    $config->set('style_mode', $form_state->getValue('style_mode'))
      ->set('accent_color', $form_state->getValue('accent_color'));

    // Save module field settings.
    $fields = [
      'module_machine_name',
      'module_version',
      'module_lifecycle',
      'module_requires',
      'module_required_by',
      'module_status',
      'module_project',
      'module_subpath',
      'module_mtime',
      'module_stability',
      'module_links',
      'module_issue_link',
      'module_usage_link',
    ];

    foreach ($fields as $field) {
      $config->set($field, $form_state->getValue($field));
    }

    $config->save();

    parent::submitForm($form, $form_state);
  }

}
