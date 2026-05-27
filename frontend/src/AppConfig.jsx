import vkBridge, { parseURLSearchParamsForGetLaunchParams } from '@vkontakte/vk-bridge';
import { useAdaptivity, useAppearance, useInsets } from '@vkontakte/vk-bridge-react';
import { AdaptivityProvider, ConfigProvider, AppRoot, FixedLayout, Button, Div } from '@vkontakte/vkui';
import { RouterProvider } from '@vkontakte/vk-mini-apps-router';
import { transformVKBridgeAdaptivity } from './utils/transformVKBridgeAdaptivity';
import '@vkontakte/vkui/dist/vkui.css';
import { Icon20MessageOutline } from "@vkontakte/icons";

import { router } from './routes';
import App from './App';

const AppConfig = () => {
  const vkBridgeAppearance = useAppearance() || undefined;
  const vkBridgeInsets = useInsets() || undefined;
  const adaptivity = transformVKBridgeAdaptivity(useAdaptivity());
  const { vk_platform } = parseURLSearchParamsForGetLaunchParams(window.location.search);


  const handleContact = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      vkBridge.send("VKWebAppOpenExternalLink", { 
        url: "https://vk.com/im/convo/-48544404" 
      })
      .catch((error) => {
        
        window.open("https://vk.com/im/convo/-48544404", "_blank");
      });
    } else {
      window.open("https://vk.com/im/convo/-48544404", "_blank");
    }
  };

  return (
    <ConfigProvider
      appearance={vkBridgeAppearance}
      platform={vk_platform === 'desktop_web' ? 'android' : undefined}
      isWebView={vkBridge.isWebView()}
      hasCustomPanelHeaderAfter={true}
    >
      <AdaptivityProvider {...adaptivity}>
        <AppRoot mode="full" safeAreaInsets={vkBridgeInsets}>
          <RouterProvider router={router}>
            <App />
            <FixedLayout vertical="bottom" style={{ zIndex: 100, pointerEvents: 'none' }}>
              <Div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '24px' }}>
                <Button
                  size="l"
                  rounded
                  before={<Icon20MessageOutline style={{ margin: 0 }} />} // Убираем отступы иконки, если кнопка круглая
                  onClick={handleContact}
                  style={{
                    pointerEvents: 'auto', // Кнопка должна реагировать на клики
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    height: '44px',
                    width: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 0,
                    padding: 0
                  }}
                />
              </Div>
            </FixedLayout>
          </RouterProvider>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
};

export default AppConfig;
