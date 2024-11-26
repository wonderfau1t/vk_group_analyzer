import { useState, useEffect, useCallback } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View } from '@vkontakte/vkui';

import { Home, AnalysedGroup, Auth } from './panels';

export const App = () => {
  const [activePanel, setActivePanel] = useState('home');
  const [fetchedToken, setToken] = useState();
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const goToGroup = useCallback((groupId) => {
    setSelectedGroupId(groupId)
    setActivePanel('group');
  }, []);

  const goBack = useCallback(() => {
    setActivePanel('home');
  }, []);

  useEffect(() => {
    async function fetchData() {
      const permission = await bridge.send('VKWebAppCheckAllowedScopes', {
        scopes: 'groups'
      })
      if (permission.result[0].allowed) {
        console.log(permission)
        const token = await bridge.send('VKWebAppGetAuthToken', {
          app_id: 52612592,
          scope: 'groups',
        });
        setToken(token);
      } else {
        setActivePanel('auth')
      }
    }
    fetchData();
  }, []);

  return (
    <View activePanel={activePanel}>
      <Auth id="auth" onAuthComplete={({ token }) => {
        setToken(token);
        setActivePanel('home');
      }} />
      <Home id="home" fetchedToken={fetchedToken} onGroupClick={goToGroup} />
      <AnalysedGroup id="group" onBackClick={goBack} groupId={selectedGroupId} fetchedToken={fetchedToken} />
    </View>
  );
};
