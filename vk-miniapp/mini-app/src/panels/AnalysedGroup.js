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

export const AnalysedGroup = ({id, onBackClick, groupId}) => {
  const [selectedTab, setSelectedTab] = useState();

  const handleTabChange = (value) => {
    setSelectedTab(value);
  };

  useEffect(() => {
    async function GetInfoAboutGroup() {
      const info = await bridge.send('VKWebAppCallAPIMethod', {
        method: 'groups.getById',
        params: {
          group_id: groupId,
          
        }
      });
    };
  });

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBackClick}/>}>
        Анализ групп
      </PanelHeader>
      <Group>
        <SimpleCell
          after={<Image src={PersikImage} alt="Аватар группы"/>}
        >
          <Title level="1">Название группы</Title>
          <Subhead>{groupId}</Subhead>
          <Subhead>Количество подписчиков</Subhead>
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