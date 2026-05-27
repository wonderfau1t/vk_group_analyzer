import { useState, useEffect, useCallback } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, Root, AdaptivityProvider } from '@vkontakte/vkui';

import { Home, AnalysedGroup, Auth, EnterMenu, ContentGenerating, PastGenerations } from './panels';

const App = () => {
  const [activeStory, setActiveStory] = useState("menu");

  const [auditPanel, setAuditPanel] = useState("home");
  const [contentPanel, setContentPanel] = useState("create-content");

  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [fetchedToken, setToken] = useState();

  const goToGroup = useCallback((groupId) => {
    setSelectedGroupId(groupId)
    setAuditPanel("group");
  }, []);

  const goBackFromGroup = useCallback(() => {
    setAuditPanel("home");
  }, []);

  const goToAudit = useCallback(() => {
    setAuditPanel("home");
    setActiveStory("audit");
  }, []);

  const goToContent = useCallback(() => {
    setActiveStory("generation");
    setContentPanel("create-content");
  }, []);

  const goToMenu = useCallback(() => {
    setActiveStory("menu");
  }, []);

const goToPastGeneratedContent = useCallback(() => {
    setContentPanel("history");
  }, []);

  const goBackToContent = useCallback(() => {
    setContentPanel("create-content");
  }, []);

  useEffect(() => {
    async function fetchData() {
      const permission = await bridge.send("VKWebAppCheckAllowedScopes", {
        scopes: "groups"
      })
      if (permission.result[0].allowed) {
        const token = await bridge.send("VKWebAppGetAuthToken", {
          app_id: 52612592,
          scope: "groups",
        });
        setToken(token);
      } else {
        setActivePanel("auth")
      }
    }
    fetchData();
}, []);

  return (
      <Root activeView={activeStory}>
        <View id="auth" activePanel="auth">
          <Auth
            id="auth"
            onAuthComplete={({ token }) => {
              setToken(token);
              setActivePanel("menu");
            }}
          />
        </View>

        <View id="menu" activePanel="menu">
          <EnterMenu
            id="menu"
            goToAudit={goToAudit}
            goToContent={goToContent}
          />
        </View>

        <View id="audit" activePanel={auditPanel}>
          <Home
            id="home"
            fetchedToken={fetchedToken}
            onGroupClick={goToGroup}
            goToMenu={goToMenu}
          />
          <AnalysedGroup 
            id="group"
            groupId={selectedGroupId}
            fetchedToken={fetchedToken}
            onBackClick={goBackFromGroup}
          />
        </View>

        <View id="generation" activePanel={contentPanel}>
          <ContentGenerating
            id="create-content"
            goToMenu={goToMenu}
            goToPastGeneratedContent={goToPastGeneratedContent}
          />
          <PastGenerations
            id="history"
            goBackToContent={goBackToContent}
          />
        </View>
      </Root>
  );
};

export default App;
