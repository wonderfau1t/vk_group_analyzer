import { Panel, PanelHeader, Group, Cell, Div, Avatar, Search, Separator, SegmentedControl, Title, Spacing, CustomScrollView, List, Placeholder } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';
import { useState, useEffect } from 'react';
import {Icon56InfoOutline} from '@vkontakte/icons';

export const Home = ({ id, fetchedUser, fetchedToken }) => {
  const [subscribedGroups, setSubscribedGroups] = useState([]);
  const [administeredGroups, setAdministeredGroups] = useState([]);
  const [selectedTab, setSelectedTab] = useState('subscribes');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedGroups, setSearchedGroups] = useState([]);

  const searchAllGroups = async (query) => {
    const response = await bridge.send("VKWebAppCallAPIMethod", {
      method: 'groups.search',
      params: {
        q: query,
        count: 200,
        access_token: fetchedToken.access_token,
        v: "5.199",
      },
    });
    setSearchedGroups(response.response.items);
  };

  useEffect(() => {
    if (selectedTab === 'all' && searchQuery) {
      searchAllGroups(searchQuery);
    }
  }, [searchQuery, selectedTab]);

  const onSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    searchAllGroups(query);
  }

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

  const groupsToDisplay =
    selectedTab === 'subscribes'
    ? subscribedGroups.filter((group) => group.name.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()))
    : selectedTab === 'administered'
    ? administeredGroups.filter((group) => group.name.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()))
    : searchedGroups;
  return (
    <Panel id={id}>
      <PanelHeader>Анализ групп</PanelHeader>
      {fetchedUser && (
        <Group header={<Title level='1' style={{marginBottom: 10, paddingTop: 20, paddingLeft: 20}}>Выберите группу для анализа</Title>}>
          <Spacing size={16}>
            <Separator/>
          </Spacing>
          <Div>
            <Search value={searchQuery} onChange={onSearchChange} placeholder='Введите название группы'/>
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
                  {
                    label: 'Поиск по всем группам',
                    value: 'all',
                  },
                ]}
                onChange={handleTabChange}
              />
            </Div>
          </Div>
          <Div>
            <Group>
              {groupsToDisplay.length > 0 ? (
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
              ) : (
                <Placeholder icon={<Icon56InfoOutline/>} header='Нет групп, соответствующих вашему запросу'>
                  Перейдите во вкладку «Поиск по всем группам» и попробуйте найти там
                </Placeholder>
              )}
            </Group>
          </Div>
        </Group>
      )}
    </Panel>
  );
};
