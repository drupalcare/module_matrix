<?php

declare(strict_types=1);

namespace Drupal\Tests\module_matrix\Unit;

use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\DataProvider;
use Drupal\Tests\UnitTestCase;

/**
 * Tests the module_matrix_get_stability() function.
 */
#[Group('module_matrix')]
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
   * The annotation sits beside the attribute on purpose: PHPUnit 9.6, which
   * Drupal 10 runs, ignores #[DataProvider] and calls this with no arguments.
   *
   * @dataProvider versionProvider
   */
  #[DataProvider('versionProvider')]
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
      // Changed in c269aea: an absent version tells us nothing about
      // stability, and reporting 'stable' labelled every Git-checkout
      // module Stable. The caller passes '' whenever info['version'] is
      // absent, so this is the Git-checkout case.
      'empty string' => ['', 'unknown'],
      'whitespace only' => ['   ', 'unknown'],
      'core-style version' => ['10.3.1', 'stable'],
      'dev with extra info' => ['1.x-dev#abc123', 'dev'],
      'alpha uppercase in path' => ['1.0.0-alpha', 'alpha'],
      'beta with no number' => ['2.0.0-beta', 'beta'],
      'rc uppercase mixed' => ['3.0.0-rc3', 'rc'],
    ];
  }

}
