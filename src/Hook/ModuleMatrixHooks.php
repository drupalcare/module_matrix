<?php

namespace Drupal\module_matrix\Hook;

use Drupal\Core\Url;
use Drupal\Core\Render\Element;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Hook implementations for module_matrix.
 */
class ModuleMatrixHooks {
  use StringTranslationTrait;

  /**
   * Implements hook_help().
   */
  #[Hook('help')]
  public function help($route_name, RouteMatchInterface $route_match): ?string {
    if ($route_name === 'help.page.module_matrix') {
      return _module_matrix_helper_render_readme();
    }
    return NULL;
  }

  /**
   * Implements hook_theme_registry_alter().
   */
  #[Hook('theme_registry_alter')]
  public function themeRegistryAlter(array &$theme_registry): void {
    $templates = [
      'system_modules_uninstall' => 'system-modules-uninstall',
      'system_modules_details' => 'system-modules-details',
    ];
    $module_path = \Drupal::service('extension.list.module')->getPath('module_matrix') . '/templates';
    foreach ($templates as $key => $template) {
      if (isset($theme_registry[$key])) {
        $theme_registry[$key]['path'] = $module_path;
        $theme_registry[$key]['template'] = $template;
      }
    }
  }

  /**
   * Implements hook_preprocess_HOOK() for system_modules_details.
   */
  #[Hook('preprocess_system_modules_details')]
  public function preprocessSystemModulesDetails(array &$variables): void {
    $config = \Drupal::config('module_matrix.settings');
    $extension_list = \Drupal::service('extension.list.module')->getList();
    // Get categorized modules (parents and submodules).
    [$parent_modules, $sub_modules] = module_matrix_categorize_modules($extension_list);
    // Enhance module details.
    foreach ($variables['modules'] as &$module) {
      $id = $module['name']['#parents'][1] ?? NULL;
      if ($id && isset($extension_list[$id])) {
        module_matrix_enhance_module($module, $extension_list[$id], $parent_modules, $sub_modules);
      }
    }
    foreach ($variables['modules'] as &$module) {
      // Process "requires" field to style missing/disabled modules.
      if (isset($module['requires']) && is_array($module['requires']) && !empty($module['requires']['#markup'])) {
        $module['requires']['#markup'] = module_matrix_style_dependency_status($module['requires']['#markup']);
      }
      // Process "required_by" field to style missing/disabled modules.
      if (isset($module['required_by']) && is_array($module['required_by']) && !empty($module['required_by']['#markup'])) {
        $module['required_by']['#markup'] = module_matrix_style_dependency_status($module['required_by']['#markup']);
      }
    }
    // Add visibility settings and enabled count to variables.
    $module_options = module_matrix_get_modules_options($config);
    $variables['enabled_count'] = count(array_filter($module_options, fn($value) => $value === TRUE));
    // Merge module options with visibility settings.
    $variables['visibility'] = array_merge($module_options, module_matrix_get_visibility_settings($config));
  }

  /**
   * Implements hook_preprocess_HOOK() for system_modules_uninstall.
   */
  #[Hook('preprocess_system_modules_uninstall')]
  public function preprocessSystemModulesUninstall(array &$variables): void {
    $config = \Drupal::config('module_matrix.settings');
    $variables['visibility'] = module_matrix_get_visibility_settings($config);
    foreach ($variables['modules'] as &$module) {
      // Process "required_by" field for uninstall page.
      if (isset($module['required_by']) && is_array($module['required_by']) && !empty($module['required_by']['#markup'])) {
        $module['required_by']['#markup'] = module_matrix_style_dependency_status($module['required_by']['#markup']);
      }
    }
  }

  /**
   * Implements hook_form_FORM_ID_alter().
   */
  #[Hook('form_system_modules_alter')]
  public function formSystemModulesAlter(array &$form, FormStateInterface $form_state, $form_id): void {
    // Remove the 'container' wrapper explicitly if it's part of the render array.
    // Adjust module packages and elements similar to module_filter.
    if (isset($form['modules']) && is_array($form['modules'])) {
      foreach (Element::children($form['modules']) as $package_name) {
        $package =& $form['modules'][$package_name];
        // Modify the package-level details element.
        if (isset($package['#type']) && $package['#type'] === 'details') {
          $package['#type'] = 'container';
          unset($package['#open']);
          $package['#attributes']['class'][] = 'module-package-wrapper';
        }
      }
    }
    $form['intro_message'] = [
      '#type' => 'markup',
      '#markup' => '<p>' . $this->t('<a href=":layout_url" target="_blank"><span class="material-icons" aria-hidden="true">settings</span> Adjust layout and options</a>', [
        ':layout_url' => Url::fromRoute('module_matrix.settings_form')->toString(),
      ]) . '</p>',
          // Ensures it appears at the top.
      '#weight' => -100,
      '#prefix' => '<div class="intro-message-class">',
      '#suffix' => '</div>',
    ];
    $form['filters'] = [
      '#type' => 'fieldset',
      '#attributes' => [
        'class' => [
          'module-matrix-filters',
        ],
      ],
    ];
    // Add the text filter field.
    $form['filters']['text'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Search Modules'),
      '#placeholder' => $this->t('Enter module name or description'),
      '#attributes' => [
        'class' => [
          'form-control',
        ],
      ],
    ];
    // Add the status filter container.
    $form['filters']['status'] = [
      '#type' => 'container',
      '#attributes' => [
        'class' => [
          'module-matrix-status',
          'form-item',
        ],
      ],
      'checkboxes' => [
        '#type' => 'checkboxes',
        '#title' => $this->t('Filter by status'),
        '#options' => [
          '1' => $this->t('Enabled'),
          '0' => $this->t('Disabled'),
          'unavailable' => $this->t('Unavailable'),
        ],
        '#default_value' => [],
        '#attributes' => [
          'class' => [
            'form-checkboxes',
            'enable-filter',
          ],
        ],
      ],
    ];
    // Add the lifecycle filter container.
    $form['filters']['lifecycle'] = [
      '#type' => 'container',
      '#attributes' => [
        'class' => [
          'module-matrix-lifecycle',
          'form-item',
        ],
      ],
      'checkboxes' => [
        '#type' => 'checkboxes',
        '#title' => $this->t('Filter by lifecycle'),
        '#options' => [
          'stable' => $this->t('Stable'),
          'deprecated' => $this->t('Deprecated'),
          'experimental' => $this->t('Experimental'),
          'obsolete' => $this->t('Obsolete'),
        ],
        '#default_value' => [],
        '#attributes' => [
          'class' => [
            'form-checkboxes',
            'lifecycle-filter',
          ],
        ],
      ],
    ];
    // Add the stability filter container.
    $form['filters']['stability'] = [
      '#type' => 'container',
      '#attributes' => [
        'class' => [
          'module-matrix-stability',
          'form-item',
        ],
      ],
      'checkboxes' => [
        '#type' => 'checkboxes',
        '#title' => $this->t('Filter by stability'),
        '#options' => [
          'stable' => $this->t('Stable'),
          'rc' => $this->t('Release Candidate'),
          'beta' => $this->t('Beta'),
          'alpha' => $this->t('Alpha'),
          'dev' => $this->t('Development'),
        ],
        '#default_value' => [],
        '#attributes' => [
          'class' => [
            'form-checkboxes',
            'stability-filter',
          ],
        ],
      ],
    ];
    // Add the reset button.
    $form['filters']['reset'] = [
      '#type' => 'button',
      '#value' => $this->t('Reset'),
      '#attributes' => [
        'id' => 'reset-filters',
              // Adding Drupal button classes.
        'class' => [
          'button',
          'reset-button',
          'form-button',
        ],
      ],
    ];
  }

  /**
   * Implements hook_theme_suggestions_fieldset_alter().
   */
  #[Hook('theme_suggestions_fieldset_alter')]
  public function themeSuggestionsFieldsetAlter(array &$suggestions, array $variables) {
    // Get the current route name.
    $route_name = \Drupal::routeMatch()->getRouteName();
    // Apply only on 'admin/modules' and 'module_matrix.settings_form'.
    if (in_array($route_name, [
      'system.modules_list',
      'module_matrix.settings_form',
    ])) {
      $suggestions[] = 'fieldset__module_matrix';
    }
  }

  /**
   * Implements hook_theme().
   */
  #[Hook('theme')]
  public function theme($existing, $type, $theme, $path) {
    return [
      'fieldset__module_matrix' => [
        'base hook' => 'fieldset',
        'template' => 'fieldset--module-matrix',
        'path' => $path . '/templates',
      ],
    ];
  }

}
