import {
  createHashRouter,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from '@vkontakte/vk-mini-apps-router';

export const DEFAULT_ROOT = 'default_root';

export const DEFAULT_VIEW = 'default_view';

export const DEFAULT_VIEW_PANELS = {
  HOME: 'home',
  GROUP: 'group',
  AUTH: 'auth',
  ENTER_MENU: 'enter-menu',
  CONTENT_GENERATING: "content-generating"
};

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.ENTER_MENU, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.HOME, `/${DEFAULT_VIEW_PANELS.HOME}`, []),
      createPanel(DEFAULT_VIEW_PANELS.GROUP, `/${DEFAULT_VIEW_PANELS.GROUP}`, []),
      createPanel(DEFAULT_VIEW_PANELS.AUTH, `/${DEFAULT_VIEW_PANELS.AUTH}`, []),
      createPanel(DEFAULT_VIEW_PANELS.CONTENT_GENERATING, `/${DEFAULT_VIEW_PANELS.CONTENT_GENERATING}`),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
