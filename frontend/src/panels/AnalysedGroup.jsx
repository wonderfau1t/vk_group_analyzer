import { 
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Group, 
  Image, 
  Title,
  Text,
  SegmentedControl,
  Placeholder,
  Card,
  ScreenSpinner,
  Flex,
  Button,
  Spacing,
  Avatar,
  Div,
  Spinner,
} from "@vkontakte/vkui";
import { useState, useEffect } from "react";
import { Icon20ListAddOutline, Icon16UserOutline, Icon56ReportOutline } from '@vkontakte/icons';
import bridge from "@vkontakte/vk-bridge";

const ProgressBar = ({ score }) => (
  <Div style={{ width: '50%', padding: '0'}}>
    <Text style={{fontWeight: '500',}}>Результат аудита:</Text>
    <div style={{ 
      width: '100%', 
      backgroundColor: '#e0e0e0', 
      borderRadius: '8px', 
      height: '30px', 
      overflow: 'hidden' }}>
      <div style={{
        display: 'flex',
        width: `${score}%`,
        height: '100%',
        backgroundColor: score > 40 ? '#4bb34b' : (score <= 20 ? '#ff6b6b' : '#ffa000'),
        borderRadius: '8px',
        transition: 'width 0.5s ease-in-out',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginRight: '10px'
      }}>
        <Text style={{
          fontWeight: '400',
          color: 'white',
          marginRight: '15px'}}>{score}%</Text>
      </div>
    </div>
  </Div>
);

const CardItem = ({ title, description, backgroundColor, textColor }) => (
  <div style={{ margin: '8px 0' }}>
    <Card mode="shadow" style={{ paddingTop: '5px' }}>
      <Text style={{
        fontSize: '16px',
        textTransform: 'uppercase',
        padding: '10px',
        margin: '10px 16px 0 16px',
        backgroundColor: backgroundColor,
        color: textColor,
        borderRadius: '10px'
      }}>
        {title}
      </Text>
      <Div style={{ display: 'flex', gap: '6px', padding: '10px 26px' }}>
        <Div className="description__icon" style={{ padding: '0' }}>
          <Icon20ListAddOutline />
        </Div>
        <Div className="description" style={{ padding: '0' }}>
          <Text>
            {description.split(' ').map((word, index) =>
              word.startsWith('https') ? (
                <a key={index} href={word} target="_blank" rel="noopener noreferrer" style={{ color: '#6d7885'}}>
                  {word}
                </a>
              ) : (
                <span key={index}>{word} </span>
              )
            )}
          </Text>
        </Div>
      </Div>
    </Card>
  </div>
);

const AnalysedGroup = ({id, onBackClick, groupId, fetchedToken}) => {
  const [selectedTab, setSelectedTab] = useState('good');
  const [groupInfo, setGroupInfo] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [launchParams, setLaunchParams] = useState(null);

  const handleTabChange = (value) => {
    setSelectedTab(value);
  };

  useEffect(() => {
    async function getLaunchParams() {
      try {
        const params = await bridge.send("VKWebAppGetLaunchParams");
        setLaunchParams(params);
      } catch (error) {
        console.error("Ошибка получения launchParams:", error);
      }
    }

    if (!launchParams) {
      getLaunchParams();
    }
  })

  useEffect(() => {
    async function GetInfoAboutGroup() {
      if (!groupId || !fetchedToken?.access_token || !launchParams) {
        return;
      }

      setIsLoading(true);

      try {
        const launchParams = await bridge.send('VKWebAppGetLaunchParams');

        const response = await fetch(`https://vk.wonderrfau1t.site/api/v1/analyzer/${groupId}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "X-VK-Access-Token": fetchedToken?.access_token,
            "X-VK-Launch-Params": JSON.stringify(launchParams),
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP Error! status: ${response.status}`);
        }

        const data = await response.json();
        setGroupInfo(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    GetInfoAboutGroup();
  }, [groupId, fetchedToken, launchParams]);

  const [marketingGroup, setMarketingGroup] = useState(null);

  useEffect(() => {
    async function fetchMarketingGroup() {
      if (!fetchedToken?.access_token) {
        return;
      }

      try {
        const result = await bridge.send("VKWebAppCallAPIMethod", {
          method: "groups.getById",
          params: {
            group_id: "lesya_ostashova.targetolog",
            fields: "photo_200",
            v: "5.131",
            access_token: fetchedToken.access_token 
          }
        });
        
        if (result.response && result.response[0]) {
          setMarketingGroup(result.response[0]);
        }
      } catch (e) {
        console.error("Ошибка при получении данных маркетолога:", e);
      }
    }

    fetchMarketingGroup();
    // Добавляем fetchedToken в зависимости, чтобы запрос ушел, как только токен появится
  }, [fetchedToken]);

  function formatMembersCount(count) {

    if (typeof count !== 'number') return '0 подписчиков';
    const formattedCount = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
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

  const categories = {
    good: { data: groupInfo.good, bgColor: '#e8f9e8', textColor: '#4bb34b' },
    bad: { data: groupInfo.bad, bgColor: '#ffd9d9', textColor: '#ff6b6b' },
    normal: { data: groupInfo.normal, bgColor: '#fff2d6', textColor: '#ffa000' }
  };

  if (isLoading) {
    return (
      <Panel id={id} >
        <PanelHeader before={<PanelHeaderBack onClick={onBackClick}/>}>Аудит группы</PanelHeader>
        <ScreenSpinner size='large' caption='Загружаем данные о группах'>Идет аудит выбранной группы</ScreenSpinner>
      </Panel>
    );
  }

  if (groupInfo.error_message) {
    return (
      <Panel id={id}>
        <PanelHeader before={<PanelHeaderBack onClick={onBackClick}/>}>Аудит группы</PanelHeader>
        <Placeholder icon={<Icon56ReportOutline/>} header='Это закрытая группа, провести аудит невозможно!'>
          Вернитесь на главную страницу и выберите другую группу для аудита
        </Placeholder>
      </Panel>
    );
  }

  const goToGroup = () => {
    bridge.send("VKWebAppJoinGroup", { 
      group_id: 48544404
    })
    .then((data) => {
      if (data.result) {
        console.log("Пользователь подписался или уже подписан");
      }
    })
    .catch((error) => {
      console.error(error);
      window.open("https://vk.com/lesya_ostashova.targetolog", "_blank");
    });
  };

  return (
    <Panel id={id}>
      <PanelHeader before={<PanelHeaderBack onClick={onBackClick}/>}>
        Аудит группы
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
          <div className="progressBar" style={{marginTop: '20px'}}>
            <ProgressBar score={groupInfo.score} />
          </div>
        </Div>      
      </Group>

      <Group
        mode="card"
        style={{
          borderRadius: "16px", // Чуть мягче углы
          DivShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Более глубокая тень для выделения
          margin: "12px 8px",
          background: "linear-gradient(135deg, #ffffff 0%, #f9faff 100%)", // Легкий градиент на фоне
          border: "1px solid #e1e3e6"
        }}
      >
        <Div>
          <Flex direction="column" style={{ gap: '12px' }}>
            <Flex style={{ gap: '12px' }} align="center">
              <Avatar size={80} src={marketingGroup?.photo_200} alt="Аватар группы" />
              <div style={{ flex: 1 }}>
                <Title level="3" style={{ color: "var(--vkui--color_text_accent)", marginBottom: 4 }}>
                  Клиенты из интернета с Лесей Осташовой
                </Title>
                <Text weight="2" style={{ color: "#818c99", fontSize: '14px' }}>
                  Итенсивы и марафоны по продвижению ВКонтакте
                </Text>
              </div>
            </Flex>
            
            <Text style={{ lineHeight: '1.5' }}>
              Группа не приносит нужных результатов?! Разберем, почему ваша реклама не работает и узнаем
              все лайфхаки продвижения ВКонтакте. 
              <br />
              <b>Подписывайся, здесь много полезной информации 😊</b>
            </Text>

            <Button
              size="l"
              appearance="accent"
              stretched
              rounded
              onClick={goToGroup}
              style={{ height: '44px' }}
            >
              Подписаться
            </Button>
          </Flex>
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
          <Div style={{ padding: '0px', color: '#6d7885' }}>
            {selectedTab === 'good' && categories.good.data && categories.good.data.length > 0
              ? categories.good.data.map((card) => (
                  <CardItem key={card.id} title={card.title} description={card.description}
                            backgroundColor={categories.good.bgColor} textColor={categories.good.textColor} />
                ))
              : selectedTab === 'correct' && (
                  <>
                    {categories.bad.data && categories.bad.data.length > 0 &&
                      categories.bad.data.map((card) => (
                        <CardItem key={card.id} title={card.title} description={card.description}
                                  backgroundColor={categories.bad.bgColor} textColor={categories.bad.textColor} />
                      ))}
                    {categories.normal.data && categories.normal.data.length > 0 &&
                      categories.normal.data.map((card) => (
                        <CardItem key={card.id} title={card.title} description={card.description}
                                  backgroundColor={categories.normal.bgColor} textColor={categories.normal.textColor} />
                      ))}
                  </>
              )}
          </Div>
        </Div>
      </Group>
    </Panel>
  )
};

export default AnalysedGroup;