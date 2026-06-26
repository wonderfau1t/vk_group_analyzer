import { ModalPage, ModalPageHeader, PanelHeaderBack, Div, Title, Text, Button, Group, Cell, Spacing, Separator } from "@vkontakte/vkui";

import {
  Icon20Flash,
  Icon20BookSpreadOutline,
  Icon20MessageRectangleOutline
} from "@vkontakte/icons";
import PropTypes from "prop-types";

import { openExternalLink } from "../utils/openExternalLink";

const SUBSCRIBE_GROUP_URL = "https://vk.com/lesya_ostashova.targetolog?w=donut_payment-48544404&levelId=3518";

const SubscribeModal = ({ id, onClose, onSubscribe }) => {
  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe();
    }

    onClose();
    openExternalLink(SUBSCRIBE_GROUP_URL);
  };

    const benefits = [
    {
      icon: <Icon20Flash />,
      text: "Токены для генерации контента, рекламы и обложек — больше никаких ограничений"
    },
    {
      icon: <Icon20MessageRectangleOutline />,
      text: "Закрытый чат с экспертами — спросите, что не так с постом / рекламой, и получите ответ."
    },
    {
      icon: <Icon20BookSpreadOutline />,
      text: "Интенсивы, практики и курсы — каждый месяц вместе пишем контент, настраиваем таргет, упаковываем сообщества"
    }
  ];

  return (
    <ModalPage
      id={id}
      onClose={onClose}
      settlingHeight={100}
      header={
        <ModalPageHeader
          before={
            <PanelHeaderBack label="Назад" onClick={onClose} />
          }
        >
          Подписка
        </ModalPageHeader>
      }
    >
      <div style={{ 
        maxHeight: '70vh',
        overflowY: 'auto'
      }}>
        <Div style={{ padding: '20px 16px' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Spacing size={16} />
              <Title level="2" style={{ marginBottom: 12 }}>
                Закончились токены для генерации контента?
              </Title>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                Токены закончились. Но работа — нет.
              </Text>
            </div>

            <Text style={{ fontWeight: 600, marginBottom: 12 }}>
              Подключите VK Donut за 890 ₽/мес и получите:
            </Text>

            <Group style={{ marginBottom: 24 }}>
              {benefits.map((benefit, index) => (
                <div key={index}>
                  {index > 0 && <Separator />}
                  <Cell
                    key={index}
                    before={
                      <span style={{ fontSize: 20, marginRight: 12 }}>
                        {benefit.icon}
                      </span>
                    }
                    multiline
                  >
                    <Text style={{ whiteSpace: 'normal' }}>
                      {benefit.text}
                    </Text>
                  </Cell>
                </div>
              ))}
            </Group>

            <Button 
              size="l" 
              stretched 
              onClick={handleSubscribe}
              style={{ marginBottom: 12 }}
            >
              🔥 Подключить за 890 ₽ 🔥
            </Button>
            
            <Button 
              mode="tertiary" 
              stretched 
              onClick={onClose}
            >
              Возможно, позже
            </Button>
          </Div>
      </div>
    </ModalPage>
  );
};

SubscribeModal.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubscribe: PropTypes.func,
};

export default SubscribeModal;
