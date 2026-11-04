<?php

declare(strict_types=1);

namespace Drupal\module_matrix\Form;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Component\Render\MarkupInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

/**
 * Configuration form for Module Matrix settings.
 */
class ModuleMatrixSettingsForm extends ConfigFormBase {

  /**
   * Accent swatch colors: stored value => [light mode hex, dark mode hex].
   *
   * Each pair must equal the --accent-color in
   * css/accent/module-matrix.{light,dark}.{name}.css.
   */
  public const ACCENTS = [
    'teal' => ['#2b6f69', '#7cc9bf'],
    'coral' => ['#a8473f', '#f0a39a'],
    'indigo' => ['#4a56a6', '#aab3ec'],
    'gold' => ['#7d5a14', '#e3c27a'],
    'slate' => ['#4b5f69', '#aebfc7'],
    'neutral' => ['#4f555b', '#c3c7cb'],
  ];

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
    // Every rule in css/module-matrix.settings.css is scoped to this class.
    $form['#attributes']['class'][] = 'mm-settings';

    $config = $this->config('module_matrix.settings');
    $extend_url = Url::fromRoute('system.modules_list')->toString();
    $uninstall_url = Url::fromRoute('system.modules_uninstall')->toString();

    // =========================================================================
    // Branded header band: presentation only, holds no value.
    // =========================================================================
    $form['mm_header'] = [
      '#type' => 'inline_template',
      '#template' => '<header class="mm-band"><div class="mm-mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="mm-band__text"><h2>{{ title }}</h2><p>{{ purpose }}</p></div><nav class="mm-band__nav" aria-label="{{ nav_label }}"><a class="mm-pill mm-pill--extend" href="{{ extend_url }}">{{ extend }}</a><a class="mm-pill mm-pill--uninstall" href="{{ uninstall_url }}">{{ uninstall }}</a></nav></header>',
      '#context' => [
        'title' => $this->t('Module Matrix'),
        'purpose' => $this->t('Shape the Extend page your way: packages beside the list, instant filters, and only the details you need.'),
        'nav_label' => $this->t('Module Matrix pages'),
        'extend' => $this->t('Open the Extend page'),
        'uninstall' => $this->t('Uninstall page'),
        'extend_url' => $extend_url,
        'uninstall_url' => $uninstall_url,
      ],
      '#weight' => -10,
    ];

    // Two-column body: the settings column and the live preview beside it.
    // The form tree stays flat (#tree is not set), so these wrappers do not
    // change any value path read in submitForm().
    $form['mm_body'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['mm-body']],
      '#weight' => 0,
    ];
    $form['mm_body']['mm_col'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['mm-col']],
      '#weight' => 0,
    ];
    $col = &$form['mm_body']['mm_col'];

    // =========================================================================
    // SECTION 1: Layout & Display Settings
    // =========================================================================
    $col['layout_display'] = [
      '#type' => 'details',
      '#title' => $this->sectionTitle('layout', (string) $this->t('Layout'), (string) $this->t('Where packages sit and how modules are listed')),
      '#open' => TRUE,
      '#weight' => 0,
      '#attributes' => ['class' => ['mm-section']],
    ];

    $col['layout_display']['layout'] = [
      '#type' => 'radios',
      '#title' => $this->t('Package position'),
      '#default_value' => $config->get('layout') ?? 'left',
      '#options' => [
        'left' => $this->t('Left'),
        'right' => $this->t('Right'),
        'top' => $this->t('Top'),
      ],
      '#description' => $this->t('Choose where package navigation appears relative to the module list.'),
    ];
    $layout_captions = [
      'left' => $this->t('Packages on the left, modules on the right'),
      'right' => $this->t('Packages on the right, modules on the left'),
      'top' => $this->t('Packages at the top, modules at the bottom'),
    ];
    foreach ($layout_captions as $key => $caption) {
      // Core's Radios::processRadios() keeps children set here and only adds
      // the keys that are missing, so the caption and drawing survive.
      $col['layout_display']['layout'][$key] = [
        '#description' => $caption,
        '#field_prefix' => $this->drawing($key),
        '#wrapper_attributes' => ['class' => ['mm-tile']],
      ];
    }

    $col['layout_display']['mm_display'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Display options'),
      '#attributes' => ['class' => ['mm-group', 'mm-group--toggles']],
    ];

    $col['layout_display']['mm_display']['grid_layout'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Grid Layout'),
      '#default_value' => $config->get('grid_layout') ?? FALSE,
      '#description' => $this->t('Transform the module list into a responsive grid layout instead of a traditional table.'),
      '#wrapper_attributes' => ['class' => ['mm-tile']],
    ];

    $col['layout_display']['mm_display']['scrollable_sidebar'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Scrollable Sidebar'),
      '#default_value' => $config->get('scrollable_sidebar') ?? FALSE,
      '#description' => $this->t('Make the package sidebar scrollable when there are many packages.'),
      '#wrapper_attributes' => ['class' => ['mm-tile']],
    ];

    $col['layout_display']['mm_display']['compact_layout'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Compact Layout'),
      '#default_value' => $config->get('compact_layout') ?? FALSE,
      '#description' => $this->t('Simplify the interface by hiding most optional fields. Only Name, Description, and Package will be displayed.'),
      '#attributes' => ['class' => ['compact-layout-toggle']],
      '#wrapper_attributes' => ['class' => ['mm-tile']],
    ];

    // =========================================================================
    // SECTION 2: Color Theme
    // =========================================================================
    $col['color_theme'] = [
      '#type' => 'details',
      '#title' => $this->sectionTitle('colors', (string) $this->t('Colors'), (string) $this->t('Style mode and accent for the Extend and Uninstall pages')),
      '#open' => TRUE,
      '#weight' => 10,
      '#attributes' => ['class' => ['mm-section']],
    ];

    $col['color_theme']['style_mode'] = [
      '#type' => 'radios',
      '#title' => $this->t('Style Mode'),
      '#options' => [
        'light' => $this->t('Light'),
        'dark' => $this->t('Dark'),
        'none' => $this->t('None'),
      ],
      '#default_value' => $config->get('style_mode') ?? 'light',
      '#description' => $this->t('Select a color theme for the module administration interface.'),
    ];
    foreach (['light', 'dark', 'none'] as $key) {
      $col['color_theme']['style_mode'][$key] = [
        '#field_prefix' => $this->drawing('mode-' . $key),
        '#wrapper_attributes' => ['class' => ['mm-tile']],
      ];
    }
    $col['color_theme']['style_mode']['none']['#description'] = $this->t('Use default browser styles');

    $col['color_theme']['accent_color'] = [
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
    foreach (self::ACCENTS as $key => [$light, $dark]) {
      $col['color_theme']['accent_color'][$key] = [
        '#field_suffix' => [
          '#type' => 'inline_template',
          '#template' => '<span class="mm-dot" style="--sw: {{ light }}; --swd: {{ dark }};" aria-hidden="true"></span>',
          '#context' => ['light' => $light, 'dark' => $dark],
        ],
        '#wrapper_attributes' => ['class' => ['mm-swatch']],
      ];
    }

    // Shown only while Compact Layout is on, in place of the fields section.
    $col['mm_compact_note'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['mm-compact-note'], 'role' => 'note'],
      '#weight' => 15,
      '#states' => [
        'visible' => [
          ':input[name="compact_layout"]' => ['checked' => TRUE],
        ],
      ],
      'text' => [
        '#markup' => $this->t('Compact Layout is on, so the Extend page shows only Name, Description and Package. Turn it off to choose the information fields.'),
      ],
    ];

    // =========================================================================
    // SECTION 3: Module Information Fields
    // =========================================================================
    $col['module_fields'] = [
      '#type' => 'details',
      '#title' => $this->sectionTitle('fields', (string) $this->t('Module Information Fields'), (string) $this->t('What each module row shows on the Extend page')),
      '#open' => TRUE,
      '#weight' => 20,
      '#attributes' => ['class' => ['mm-section']],
      '#states' => [
        'visible' => [
          ':input[name="compact_layout"]' => ['checked' => FALSE],
        ],
      ],
    ];

    $col['module_fields']['mm_intro'] = [
      '#type' => 'html_tag',
      '#tag' => 'p',
      '#value' => $this->t('Choose which information fields to display for each module. These settings apply to the <a href=":modules_url" target="_blank">module administration page</a>. The <a href=":uninstall_url" target="_blank">uninstall page</a> has a fixed layout showing only Name, Description, and Required By.', [
        ':modules_url' => $extend_url,
        ':uninstall_url' => $uninstall_url,
      ]),
      '#attributes' => ['class' => ['mm-intro']],
      '#weight' => -10,
    ];

    $col['module_fields']['mm_fields'] = [
      '#type' => 'container',
      '#attributes' => ['class' => ['mm-fields']],
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
      $col['module_fields']['mm_fields'][$group_key] = [
        '#type' => 'fieldset',
        '#title' => $group_data['title'],
        '#attributes' => ['class' => ['mm-fs']],
      ];

      foreach ($group_data['fields'] as $field_key => $label) {
        // No '#states' => 'disabled' here. Compact layout already hides this
        // whole section through the '#states' => 'visible' on
        // $form['module_fields'], and hidden inputs still post their values.
        // Disabling them instead stopped the browser from sending them at all,
        // so saving the form while compact layout was on silently rewrote every
        // one of these to FALSE and the user lost settings they never touched.
        $col['module_fields']['mm_fields'][$group_key][$field_key] = [
          '#type' => 'checkbox',
          '#title' => $label,
          '#default_value' => $config->get($field_key) ?? TRUE,
          '#wrapper_attributes' => ['class' => ['mm-check']],
        ];
      }
    }
    unset($col);

    // =========================================================================
    // Live preview: a sample Extend page driven by CSS :has() only. It reads
    // no site data and holds no value; the sample names are core modules.
    // =========================================================================
    $form['mm_body']['mm_preview'] = [
      '#type' => 'inline_template',
      '#template' => '<aside class="mm-aside" aria-label="{{ label }}"><p class="mm-pv-title"><span class="mm-ico mm-ico--preview" aria-hidden="true"></span>{{ label }}</p><div class="mm-pv" aria-hidden="true"><div class="mm-pv-bar"><span>{{ search }}</span></div><div class="mm-pv-grid"><div class="mm-pv-side"><span class="mm-pv-pkg on">Core <em>41</em></span><span class="mm-pv-pkg">Field types <em>9</em></span><span class="mm-pv-pkg">Multilingual <em>2</em></span><span class="mm-pv-pkg">Web services <em>0</em></span></div><div class="mm-pv-list"><div class="mm-pv-row"><span class="sw"></span><b>Book</b><p>{{ book }}</p><div class="mm-pv-meta"><span data-k="machine" data-f="{{ f_machine }}">book</span><span data-k="version" data-f="{{ f_version }}">11.x</span><span data-k="status" class="st-on">{{ enabled }}</span><span data-k="requires" data-f="{{ f_requires }}">Node</span><span data-k="project" data-f="{{ f_project }}">drupal</span><span data-k="links" class="mm-pv-link">{{ help }}</span></div></div><div class="mm-pv-row off"><span class="sw"></span><b>Forum</b><p>{{ forum }}</p><div class="mm-pv-meta"><span data-k="machine" data-f="{{ f_machine }}">forum</span><span data-k="version" data-f="{{ f_version }}">11.x</span><span data-k="requires" data-f="{{ f_requires }}">Taxonomy</span></div></div></div></div></div><p class="mm-pv-cap">{{ caption }}</p></aside>',
      '#context' => [
        'label' => $this->t('Preview of the Extend page'),
        'search' => $this->t('Search modules…'),
        'book' => $this->t('Allows users to create and organize related content in an outline.'),
        'forum' => $this->t('Provides discussion forums.'),
        'f_machine' => $this->t('Machine'),
        'f_version' => $this->t('Version'),
        'f_requires' => $this->t('Requires'),
        'f_project' => $this->t('Project'),
        'enabled' => $this->t('Enabled'),
        'help' => $this->t('Help'),
        'caption' => $this->t('The preview follows your choices before you save. Sample modules, not your site.'),
      ],
      '#weight' => 10,
    ];

    $form = parent::buildForm($form, $form_state);

    $form['actions']['#attributes']['class'][] = 'mm-actions';
    $form['actions']['mm_hint'] = [
      '#type' => 'html_tag',
      '#tag' => 'p',
      '#value' => $this->t('Changes apply the next time the Extend page loads.'),
      '#attributes' => ['class' => ['mm-actions__hint']],
      '#weight' => -10,
    ];

    return $form;
  }

  /**
   * Builds a section title: icon, name and a one-line hint.
   *
   * @param string $icon
   *   The icon modifier class: layout, colors or fields.
   * @param string $name
   *   The translated section name.
   * @param string $hint
   *   The translated hint shown under the name.
   *
   * @return \Drupal\Component\Render\MarkupInterface
   *   Markup with every placeholder escaped.
   */
  protected function sectionTitle(string $icon, string $name, string $hint): MarkupInterface {
    return new FormattableMarkup('<span class="mm-head"><span class="mm-ico mm-ico--@icon" aria-hidden="true"></span><span class="mm-head__text"><span class="mm-head__name">@name</span><span class="mm-head__hint">@hint</span></span></span>', [
      '@icon' => $icon,
      '@name' => $name,
      '@hint' => $hint,
    ]);
  }

  /**
   * Builds the decorative drawing shown on a layout or style mode tile.
   *
   * @param string $shape
   *   One of left, right, top, mode-light, mode-dark, mode-none.
   *
   * @return array<string, mixed>
   *   A render array.
   */
  protected function drawing(string $shape): array {
    return [
      '#type' => 'inline_template',
      '#template' => '<span class="mm-draw mm-draw--{{ shape }}" aria-hidden="true"><i class="p"></i><i></i></span>',
      '#context' => ['shape' => $shape],
    ];
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
