<?php

declare(strict_types=1);

namespace Drupal\Tests\module_matrix\Kernel;

use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests the module_matrix configuration schema and defaults.
 *
 * @group module_matrix
 */
#[Group('module_matrix')]
#[RunTestsInSeparateProcesses]
class ConfigSchemaTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['system', 'module_matrix'];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->installConfig(['module_matrix']);
  }

  /**
   * Tests that the installed config matches the schema.
   */
  public function testConfigSchema(): void {
    $config = $this->config('module_matrix.settings');

    // Verify boolean field defaults from install config.
    $boolean_fields = [
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
      'scrollable_sidebar',
      'grid_layout',
      'compact_layout',
    ];

    foreach ($boolean_fields as $field) {
      $value = $config->get($field);
      $this->assertIsBool($value, "Config key '$field' should be a boolean.");
    }

    // Verify string field defaults.
    $this->assertSame('light', $config->get('style_mode'));
    $this->assertSame('neutral', $config->get('accent_color'));
    $this->assertSame('left', $config->get('layout'));
  }

  /**
   * Tests that layout display options are disabled by default.
   */
  public function testLayoutDefaults(): void {
    $config = $this->config('module_matrix.settings');

    $this->assertFalse($config->get('scrollable_sidebar'));
    $this->assertFalse($config->get('grid_layout'));
    $this->assertFalse($config->get('compact_layout'));
  }

  /**
   * Tests that configuration can be updated and persisted.
   */
  public function testConfigUpdate(): void {
    // Update a few settings.
    $editable = \Drupal::configFactory()->getEditable('module_matrix.settings');
    $editable->set('layout', 'right');
    $editable->set('style_mode', 'dark');
    $editable->set('compact_layout', TRUE);
    $editable->set('module_links', FALSE);
    $editable->save();

    // Re-read and verify.
    $updated = $this->config('module_matrix.settings');
    $this->assertSame('right', $updated->get('layout'));
    $this->assertSame('dark', $updated->get('style_mode'));
    $this->assertTrue($updated->get('compact_layout'));
    $this->assertFalse($updated->get('module_links'));
  }

}
