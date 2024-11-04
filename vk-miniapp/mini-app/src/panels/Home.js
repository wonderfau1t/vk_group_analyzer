import { Panel, PanelHeader, Group, Cell, Div, Avatar, Search, Separator, SegmentedControl, Title, Spacing, CustomScrollView, List } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';
import { useState, useEffect } from 'react';

export const Home = ({ id, fetchedUser, fetchedToken }) => {
  const [subscribedGroups, setSubscribedGroups] = useState([]);
  const [administeredGroups, setAdministeredGroups] = useState([]);
  const [selectedTab, setSelectedTab] = useState('subscribes');

  useEffect(() => {
    const fetchAndSplitGroups = async () => {
      const response = await bridge.send("VKWebAppCallAPIMethod", {
        method: 'groups.get',
        params: {
          access_token: fetchedToken.access_token,
          extended: 1,
          fields: "activity",
          v: "5.199",
        },
      });
      const allGroups = response.response.items;

      setSubscribedGroups(allGroups.filter((group) => !group.is_admin));
      setAdministeredGroups(allGroups.filter((group) => group.is_admin));
    };

    fetchAndSplitGroups();
  }, [fetchedToken]);

  const handleTabChange = (value) => {
    setSelectedTab(value);
  };

  const groupsToDisplay = selectedTab === 'subscribes' ? subscribedGroups : administeredGroups;

  return (
    <Panel id={id}>
      <PanelHeader>Анализ групп</PanelHeader>
      {fetchedUser && (
        <Group header={<Title level='1' style={{marginBottom: 10, paddingTop: 20, paddingLeft: 20}}>Выберите группу для анализа</Title>}>
          <Spacing size={16}>
            <Separator/>
          </Spacing>
          <Div>
            <Search />
            <Div>
              <SegmentedControl
                name='groups'
                options={[
                  {
                    label: 'Подписки',
                    value: 'subscribes',
                  },
                  {
                    label: 'Управляемые',
                    value: 'administered',
                  },
                ]}
                onChange={handleTabChange}
              />
            </Div>
          </Div>
          <Div>
            <Group>
              <CustomScrollView windowResize={true} style={{height: 350}}>
                <List>
                  {groupsToDisplay.map((group) => (
                    <Cell
                      key={group.id}
                      before={group.photo_100 ? <Avatar src={group.photo_100} /> : null}
                      subtitle={group.activity}
                    >
                      {group.name}
                    </Cell>
                  ))}
                </List>
              </CustomScrollView>
            </Group>
          </Div>
        </Group>
      )}
    </Panel>
  );
};
