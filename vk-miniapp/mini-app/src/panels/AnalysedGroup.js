import { 
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Div, 
  SimpleCell, 
  Avatar, 
  Button, 
  Group, 
  Image, 
  Title, 
  Subhead,
  SegmentedControl } from "@vkontakte/vkui";
import { useState, useEffect } from "react";
import PersikImage from "..//assets/persik.png";
import bridge from "@vkontakte/vk-bridge";

export const AnalysedGroup = ({id, onBackClick, groupId, fetchedToken}) => {
  const [selectedTab, setSelectedTab] = useState();
  const [groupInfo, setGroupInfo] = useState({});

  const handleTabChange = (value) => {
    setSelectedTab(value);
  };

  useEffect(() => {
    async function GetInfoAboutGroup() {
      try {
        const params = new URLSearchParams({
          group_id: groupId,
          access_token: fetchedToken.access_token,
        });
  
        const response = await fetch(`http://localhost:8000/api/check_group?${params.toString()}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
          }
        });
  
        if (!response.ok) {
          throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        setGroupInfo(data.main_info);
      } catch (error) {
        console.error("Ошибка при получении информации о группе:", error);
      }
    };
    GetInfoAboutGroup();
  }, [groupId, fetchedToken] );

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBackClick}/>}>
        Анализ групп
      </PanelHeader>
      <Group>
        <SimpleCell
          after={<Image src={PersikImage} alt="Аватар группы"/>}
        >
          <Title level="1">{groupInfo.name}</Title>
          <Subhead></Subhead>
          <Subhead></Subhead>
        </SimpleCell>
        
      </Group>
      <Group>
        <SegmentedControl
          name='info'
          options={[
            {
              label: 'Все отлично',
              value: 'good',
            },
            {
              label: 'Следует исправить',
              value: 'correct',
            },
          ]}
          onChange={handleTabChange}
        />
      </Group>
    </Panel>
  )
};