<?php

declare(strict_types=1);

namespace Drupal\Tests\module_matrix\Kernel;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\KernelTests\KernelTestBase;
use Drupal\module_matrix\Hook\ModuleMatrixHooks;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\Compiler\PassConfig;
use Symfony\Component\DependencyInjection\ContainerBuilder as SymfonyContainerBuilder;

/**
 * The #[LegacyHook] wrappers work when the Hook class is not a service.
 *
 * WHY THIS EXISTS. Issue #3628961 (reported against solo_utilities, same
 * defect here): "You have requested a non-existent service". The
 * ModuleMatrixHooks service was first declared in 1.0.13. A site updated
 * from 1.0.12 runs the new .module against the container compiled for 1.0.12
 * until a cache rebuild, and every wrapper called
 * \Drupal::service(ModuleMatrixHooks::class), so any page reaching one of
 * them answered HTTP 500 until `drush cr`.
 *
 * This test builds exactly that container: the Hook class definition is
 * removed after every other compiler pass, including core's
 * HookCollectorPass, which re-registers Hook classes on Drupal 11.1+.
 *
 * @group module_matrix
 *
 * @license SPDX-License-Identifier: GPL-2.0-or-later
 */
#[Group('module_matrix')]
#[RunTestsInSeparateProcesses]
class LegacyHookStaleContainerTest extends KernelTestBase implements CompilerPassInterface {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['system', 'module_matrix'];

  /**
   * {@inheritdoc}
   */
  public function register(ContainerBuilder $container): void {
    parent::register($container);
    $container->addCompilerPass($this, PassConfig::TYPE_AFTER_REMOVING, -1000);
  }

  /**
   * Removes the Hook class service, as a pre-1.0.13 container lacks it.
   */
  public function process(SymfonyContainerBuilder $container): void {
    $container->removeDefinition(ModuleMatrixHooks::class);
  }

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->installConfig(['module_matrix']);
  }

  /**
   * The wrappers resolve the Hook class without the container service.
   */
  public function testWrappersRunWithoutTheHookService(): void {
    // Control: without this, a green result would prove nothing.
    $this->assertFalse(
      $this->container->has(ModuleMatrixHooks::class),
      'The Hook class must be absent from the container, as on a site updated from 1.0.12 before a cache rebuild.'
    );

    $route_match = $this->container->get('current_route_match');

    // The help page answer proves the Hook class really was instantiated
    // and its method ran, not merely that nothing threw.
    $help = module_matrix_help('help.page.module_matrix', $route_match);
    $this->assertIsString($help);
    $this->assertStringContainsString('Module Matrix', $help);
    $this->assertNull(module_matrix_help('some.other.route', $route_match));

    $theme = module_matrix_theme([], 'module', 'module_matrix', 'modules/module_matrix');
    $this->assertArrayHasKey('fieldset__module_matrix', $theme);

    $registry = ['system_modules_details' => ['path' => 'x', 'template' => 'y']];
    module_matrix_theme_registry_alter($registry);
    $this->assertSame('system-modules-details', $registry['system_modules_details']['template']);

    $suggestions = [];
    module_matrix_theme_suggestions_fieldset_alter($suggestions, []);
    $this->assertSame([], $suggestions, 'Not on the modules page, so no suggestion is added.');

    $variables = ['modules' => []];
    module_matrix_preprocess_system_modules_uninstall($variables);
    $this->assertArrayHasKey('visibility', $variables);
  }

}
