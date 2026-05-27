import bridge from '@vkontakte/vk-bridge';
import { Button, Group, Text, Panel, PanelHeader, Placeholder } from '@vkontakte/vkui';
import { Icon56ShieldKeyholeOutline } from '@vkontakte/icons';

const Auth = ({ id, onAuthComplete }) => {
  const handleAuth = async () => {
      const token = await bridge.send('VKWebAppGetAuthToken', {
        app_id: 52612592,
        scope: 'groups',
      });
      onAuthComplete({ token });
  };

  return (
    <Panel id={id}>
      <PanelHeader>Авторизация</PanelHeader>
      <Group>
        <Placeholder icon={<Icon56ShieldKeyholeOutline/>} header="Доступ к сообществам" action={<Button onClick={handleAuth} size="l">Предоставить доступ</Button>}>
          Для аудита групп вам необходимо предоставить доступ к вашим сообществам
        </Placeholder>
      </Group>
    </Panel>
  );
};

export default Auth;