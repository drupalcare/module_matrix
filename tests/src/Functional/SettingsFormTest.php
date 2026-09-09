<?php

declare(strict_types=1);

namespace Drupal\Tests\module_matrix\Functional;

use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use Drupal\Tests\BrowserTestBase;

/**
 * Tests the Module Matrix settings form and route access.
 */
#[Group('module_matrix')]
#[RunTestsInSeparateProcesses]
class SettingsFormTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['module_matrix'];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * A user with permission to access the settings form.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $adminUser;

  /**
   * A user without permission to access the settings form.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $unprivilegedUser;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->adminUser = $this->drupalCreateUser([
      'access module matrix settings',
      'access administration pages',
    ]);
    $this->unprivilegedUser = $this->drupalCreateUser([]);
  }

  /**
   * Tests that the settings form is accessible with correct permission.
   */
  public function testSettingsFormAccess(): void {
    // Anonymous user should be denied.
    $this->drupalGet('admin/config/system/module-matrix-settings');
    $this->assertSession()->statusCodeEquals(403);

    // Unprivileged user should be denied.
    $this->drupalLogin($this->unprivilegedUser);
    $this->drupalGet('admin/config/system/module-matrix-settings');
    $this->assertSession()->statusCodeEquals(403);

    // Admin user should have access.
    $this->drupalLogin($this->adminUser);
    $this->drupalGet('admin/config/system/module-matrix-settings');
    $this->assertSession()->statusCodeEquals(200);
    $this->assertSession()->pageTextContains('Module Matrix Settings');
  }

  /**
   * Tests the settings form renders expected elements.
   */
  public function testSettingsFormElements(): void {
    $this->drupalLogin($this->adminUser);
    $this->drupalGet('admin/config/system/module-matrix-settings');

    // Layout radio buttons.
    $this->assertSession()->fieldExists('layout');

    // Checkboxes.
    $this->assertSession()->fieldExists('grid_layout');
    $this->assertSession()->fieldExists('scrollable_sidebar');
    $this->assertSession()->fieldExists('compact_layout');

    // Color theme.
    $this->assertSession()->fieldExists('style_mode');
    $this->assertSession()->fieldExists('accent_color');

    // Module fields.
    $this->assertSession()->fieldExists('module_machine_name');
    $this->assertSession()->fieldExists('module_version');
    $this->assertSession()->fieldExists('module_lifecycle');
    $this->assertSession()->fieldExists('module_requires');
    $this->assertSession()->fieldExists('module_required_by');
    $this->assertSession()->fieldExists('module_status');
    $this->assertSession()->fieldExists('module_project');
    $this->assertSession()->fieldExists('module_subpath');
    $this->assertSession()->fieldExists('module_mtime');
    $this->assertSession()->fieldExists('module_stability');
    $this->assertSession()->fieldExists('module_links');
    $this->assertSession()->fieldExists('module_issue_link');
    $this->assertSession()->fieldExists('module_usage_link');
  }

  /**
   * Tests that saving the settings form persists configuration.
   */
  public function testSettingsFormSubmission(): void {
    $this->drupalLogin($this->adminUser);
    $this->drupalGet('admin/config/system/module-matrix-settings');

    $edit = [
      'layout' => 'right',
      'grid_layout' => TRUE,
      'scrollable_sidebar' => TRUE,
      'compact_layout' => FALSE,
      'style_mode' => 'dark',
      'accent_color' => 'teal',
      'module_machine_name' => TRUE,
      'module_version' => FALSE,
      'module_lifecycle' => TRUE,
      'module_requires' => FALSE,
      'module_required_by' => FALSE,
      'module_status' => TRUE,
      'module_project' => TRUE,
      'module_subpath' => FALSE,
      'module_mtime' => FALSE,
      'module_stability' => TRUE,
      'module_links' => TRUE,
      'module_issue_link' => FALSE,
      'module_usage_link' => FALSE,
    ];

    $this->submitForm($edit, 'Save configuration');
    $this->assertSession()->pageTextContains('The configuration options have been saved.');

    // Verify saved configuration.
    $config = $this->config('module_matrix.settings');
    $this->assertSame('right', $config->get('layout'));
    $this->assertTrue((bool) $config->get('grid_layout'));
    $this->assertTrue((bool) $config->get('scrollable_sidebar'));
    $this->assertSame('dark', $config->get('style_mode'));
    $this->assertSame('teal', $config->get('accent_color'));
    $this->assertFalse((bool) $config->get('module_version'));
    $this->assertFalse((bool) $config->get('module_requires'));
    $this->assertTrue((bool) $config->get('module_stability'));
  }

}
