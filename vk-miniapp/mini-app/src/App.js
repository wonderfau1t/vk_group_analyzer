import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';

import { Persik, Home } from './panels';
import { DEFAULT_VIEW_PANELS } from './routes';

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
  const [fetchedUser, setUser] = useState();
  const [fetchedToken, setToken] = useState();
  const [popout, setPopout] = useState(<ScreenSpinner size="large" />);

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      const token = await bridge.send('VKWebAppGetAuthToken', {
        app_id: 52612592,
        scope: 'groups',
      });
      setUser(user);
      setToken(token);
      setPopout(null);
    }
    fetchData();
  }, []);

  // bridge.send('VKWebAppGetAuthToken', {
  //   app_id: 52612592,
  //   scope: 'groups,messages',
  // })
  // .then( (data) => {
  //   if (data.access_token) {
  //     console.log(data.access_token)
  //   }
  // })
  return (
    <SplitLayout popout={popout}>
      <SplitCol>
        <View activePanel={activePanel}>
          <Home id="home" fetchedUser={fetchedUser} fetchedToken={fetchedToken} />
          <Persik id="persik" />
        </View>
      </SplitCol>
    </SplitLayout>
  );
};
