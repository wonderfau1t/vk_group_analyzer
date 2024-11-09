import { useState, useEffect, useCallback } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner } from '@vkontakte/vkui';

import { Persik, Home, AnalysedGroup } from './panels';

export const App = () => {
  const [activePanel, setActivePanel] = useState('home');
  const [fetchedUser, setUser] = useState();
  const [fetchedToken, setToken] = useState();
  const [popout, setPopout] = useState(<ScreenSpinner size="large" />);
  const [selectedGroupId, setSelectedGroupId] = useState(null)

  const goToGroup = useCallback((groupId) => {
    setSelectedGroupId(groupId)
    setActivePanel('group');
  }, []);

  const goBack = useCallback(() => {
    setActivePanel('home');
  }, []);

  useEffect(() => {
    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      const token = await bridge.send('VKWebAppGetAuthToken', {
        app_id: 52612592,
        scope: 'groups,video',
      });

      setUser(user);
      setToken(token);
      setPopout(null);
    }
    fetchData();
  }, []);

  return (
    <View activePanel={activePanel} popout={popout}>
      <Home id="home" fetchedUser={fetchedUser} fetchedToken={fetchedToken} onGroupClick={goToGroup} />
      <Persik id="persik" />
      <AnalysedGroup id="group" onBackClick={goBack} groupId={selectedGroupId} />
    </View>
  );
};
