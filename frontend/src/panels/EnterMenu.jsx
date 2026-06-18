import { 
  Panel,
  PanelHeader, 
  Button, 
  Div, 
  Group, 
  Image, 
  Flex,
  Text,
  Title,
} from "@vkontakte/vkui";

import mainMenuBackground from "../assets/main-menu-background.png";
import groupAnalyserLogo from "../assets/group-analyser-logo.jpg";
import aiGeneratorLogo from "../assets/ai-generator-logo.jpg";

const EnterMenu = ({ id, goToAudit, goToContent }) => {
  return (
    <Panel
      id={id}
      className="enter-menu-panel"
      style={{
        "--enter-menu-background": `url(${mainMenuBackground})`,
      }}
    >
      <PanelHeader>
        Меню
      </PanelHeader>
      <Div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 400,
        margin: 'auto',
      }}>
        <Group
          mode="card"
          style={{ 
            width: '100%',
            borderRadius: "12px",
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Div>
            <Flex direction="column" style={{ gap: '10px'}}>
              <Flex style={{ gap: '10px'}} align="center">
                <Image size={64} src={groupAnalyserLogo} />
                <Title level="3">Аудит сообществ</Title>
              </Flex>
              <Text>
                Проанализируйте бесплатно ваше сообщество и получите актуальные рекомендации по
                улучшению ведения группы.
              </Text>
              <Button
                size="m"
                appearance="accent"
                stretched
                onClick={goToAudit}
              >
                Перейти
              </Button>
            </Flex>
          </Div>
        </Group>

        <Group
          mode="card"
          style={{
            width: '100%',
            borderRadius: "12px",
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Div>
            <Flex direction="column" style={{ gap: '10px'}}>
              <Flex style={{ gap: '10px'}} align="center">
                <Image size={64} src={aiGeneratorLogo} />
                <Title level="3">Генерация контента</Title>
              </Flex>
              <Text>
                Создайте контент-план, посты, рекламные объявления и дизайн своего сообщества с помощью
                нейросетей.
              </Text>
              <Button
                size="m"
                appearance="accent"
                stretched
                onClick={goToContent}
              >
                Перейти
              </Button>
            </Flex>
          </Div>
        </Group>
      </Div>
    </Panel>
  );
};

export default EnterMenu;
