// inner angular imports
// these are necessary to bootstrap the local angular.
// They can stay even after NP cutover
import angular from 'angular';
// required for `ngSanitize` angular module
import 'angular-sanitize';
import 'angular-recursion';
import { i18nDirective, i18nFilter, I18nProvider } from '@kbn/i18n/angular';
import { CoreStart, IUiSettingsClient, PluginInitializerContext } from 'kibana/public';
import {
  PaginateDirectiveProvider,
  PaginateControlsDirectiveProvider,
  PrivateProvider,
  watchMultiDecorator,
  KbnAccessibleClickProvider,
} from '../../../src/plugins/kibana_legacy/public';

const thirdPartyAngularDependencies = ['ngSanitize', 'ui.bootstrap', 'RecursionHelper'];

export function getAngularModule(name: string, core: CoreStart, context: PluginInitializerContext) {
  const uiModule = getInnerAngular(name, core);
  return uiModule;
}

let initialized = false;

export function getInnerAngular(name = 'kibana/enhanced_table_vis', core: CoreStart) {
  if (!initialized) {
    createLocalPrivateModule();
    createLocalI18nModule();
    createLocalConfigModule(core.uiSettings);
    createLocalPaginateModule();
    initialized = true;
  }
  return angular
    .module(name, [
      ...thirdPartyAngularDependencies,
      'tableVisPaginate',
      'tableVisConfig',
      'tableVisPrivate',
      'tableVisI18n',
    ])
    .config(watchMultiDecorator)
    .directive('kbnAccessibleClick', KbnAccessibleClickProvider);
}

function createLocalPrivateModule() {
  angular.module('tableVisPrivate', []).provider('Private', PrivateProvider);
}

function createLocalConfigModule(uiSettings: IUiSettingsClient) {
  angular.module('tableVisConfig', []).provider('config', function () {
    return {
      $get: () => ({
        get: (value: string) => {
          return uiSettings ? uiSettings.get(value) : undefined;
        },
        // set method is used in agg_table mocha test
        set: (key: string, value: string) => {
          return uiSettings ? uiSettings.set(key, value) : undefined;
        },
      }),
    };
  });
}

function createLocalI18nModule() {
  angular
    .module('tableVisI18n', [])
    .provider('i18n', I18nProvider)
    .filter('i18n', i18nFilter)
    .directive('i18nId', i18nDirective);
}

function createLocalPaginateModule() {
  angular
    .module('tableVisPaginate', [])
    .directive('paginate', PaginateDirectiveProvider)
    .directive('paginateControls', PaginateControlsDirectiveProvider);
}
