<?php

declare(strict_types=1);

namespace Drupal\Tests\module_matrix\Unit;

use Drupal\Tests\UnitTestCase;

/**
 * Tests the module_matrix_get_stability() function.
 *
 * @group module_matrix
 */
class StabilityTest extends UnitTestCase {

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    require_once dirname(__DIR__, 3) . '/module_matrix.module';
  }

  /**
   * Tests stability detection for various version strings.
   *
   * @dataProvider versionProvider
   */
  public function testGetStability(string $version, string $expected): void {
    $this->assertSame($expected, module_matrix_get_stability($version));
  }

  /**
   * Data provider for testGetStability().
   */
  public static function versionProvider(): array {
    return [
      'stable release' => ['2.0.0', 'stable'],
      'dev release' => ['2.0.x-dev', 'dev'],
      'alpha release' => ['1.0.0-alpha1', 'alpha'],
      'beta release' => ['1.0.0-beta2', 'beta'],
      'release candidate' => ['1.0.0-rc1', 'rc'],
      'empty string' => ['', 'stable'],
      'core-style version' => ['10.3.1', 'stable'],
      'dev with extra info' => ['1.x-dev#abc123', 'dev'],
      'alpha uppercase in path' => ['1.0.0-alpha', 'alpha'],
      'beta with no number' => ['2.0.0-beta', 'beta'],
      'rc uppercase mixed' => ['3.0.0-rc3', 'rc'],
    ];
  }

}
