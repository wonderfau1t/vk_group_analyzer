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
  Text,
  Subhead,
  SegmentedControl, 
  Card,
  Headline,
  Paragraph,
  Header} from "@vkontakte/vkui";
import { useState, useEffect } from "react";
import { Icon28ListCheckOutline, Icon16UserOutline } from '@vkontakte/icons';

export const AnalysedGroup = ({id, onBackClick, groupId, fetchedToken}) => {
  const [selectedTab, setSelectedTab] = useState();
  const [groupInfo, setGroupInfo] = useState({});

  const handleTabChange = (value) => {
    setSelectedTab(value);
  };

  useEffect(() => {
    async function GetInfoAboutGroup() {
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
  
        const data = await response.json();
        setGroupInfo(data);
    };
    GetInfoAboutGroup();
  }, [groupId, fetchedToken] );

  function formatMembersCount(count) {

    if (typeof count !== 'number') return '0 подписчиков';
    // Форматируем число с разделением разрядов пробелами
    const formattedCount = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
    // Определяем правильное окончание для слова "подписчик"
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    let suffix = 'подписчиков';
  
    if (lastDigit === 1 && lastTwoDigits !== 11) {
      suffix = 'подписчик';
    } else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) {
      suffix = 'подписчика';
    }
  
    return `${formattedCount} ${suffix}`;
  }

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBackClick}/>}>
        Анализ групп
      </PanelHeader>
      <Group>
        <Div>
          <div className="group-info__container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div className="groupInfo" style={{ display: 'flex', flexDirection: 'column', gap: '4px'}}>
              <Title level="1">{groupInfo.name}</Title>
              <Text style={{fontSize: '18px'}}>{groupInfo.activity}</Text>
              <div className="members__container" style={{display: 'flex', alignItems: 'center', color: '#818c99'}}>
                <Icon16UserOutline />
                <Text>{formatMembersCount(groupInfo.members_count)}</Text>
              </div>
            </div>
            <div className="groupImage">
              <Image src={groupInfo.photo_200} alt="Аватар группы" size={96}/>
            </div>
          </div>
        </Div>      
      </Group>
      <Group>
        <Div>
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
          <Group style={{marginTop: '10px'}}>
            {groupInfo.good.map((card) => (
              <Card mode="shadow" key={id}>
                <Header mode="secondary">
                  {card.title}
                </Header>
                <Div style={{margin: '0', display: 'flex'}}>
                  <Icon28ListCheckOutline />
                  <Paragraph>
                    {card.description}
                  </Paragraph>
                </Div>
              </Card>
            ))}
          </Group>
        </Div>
      </Group>
    </Panel>
  )
};