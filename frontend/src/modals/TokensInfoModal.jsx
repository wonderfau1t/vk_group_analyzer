import {
  ModalPage,
  ModalPageHeader,
  PanelHeaderBack,
  Group,
  Div,
  InfoRow,
  Flex,
  ContentBadge,
  Button,
} from "@vkontakte/vkui";

import {
  Icon20Flash
} from "@vkontakte/icons";

import useGenerationStore from "../stores/useGenerationStore";
import { formatGenerationCost } from "../utils/generationCosts";

const TokensInfoModal = ({ id, onClose }) => {
  const {
    generationCosts,
    isCostsLoading,
    costsError,
  } = useGenerationStore();

  const postCost = formatGenerationCost(generationCosts.post);
  const imageCost = formatGenerationCost(generationCosts.image);
  const costText = (value) => {
    if (isCostsLoading) {
      return "Загрузка...";
    }

    return value ?? "Недоступно";
  };

  return (
    <ModalPage
      id={id}
      onClose={onClose}
      header={
        <ModalPageHeader
          before={
            <PanelHeaderBack label="Назад" onClick={onClose} />
          }
        >
          Что такое токены?
        </ModalPageHeader>
      }
    >
      <Group>
        <Div>
          <div style={{ 
            borderRadius: "12px",
            marginBottom: "16px"
          }}>
            <InfoRow header="🎯 Токены — это ваша внутренняя валюта">
              <div style={{ marginTop: "12px", padding: "8px" }}>
                Каждая генерация - определённое количество токенов.
              </div>
            </InfoRow>
          </div>

          <InfoRow header="💰 Стоимость генерации">
            <div style={{ marginTop: "12px" }}>
              <Flex justify="space-between" style={{ marginBottom: "12px", padding: "8px", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontWeight: "500" }}>📝 Пост</div>
                  <div style={{ fontSize: "12px" }}>Текст для публикации</div>
                </div>
                <ContentBadge size="l" appearance="accent-green" style={{ marginRight: "5px" }}>
                  <ContentBadge.SlotIcon>
                    <Icon20Flash  />
                  </ContentBadge.SlotIcon>
                  {costText(postCost)}
                </ContentBadge>
              </Flex>
              
              <Flex justify="space-between" style={{ padding: "8px", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontWeight: "500" }}>🖼️ Изображение</div>
                  <div style={{ fontSize: "12px" }}>Генерация картинки</div>
                </div>
                <ContentBadge size="l" appearance="accent-green" style={{ marginRight: "5px" }}>
                  <ContentBadge.SlotIcon>
                    <Icon20Flash  />
                  </ContentBadge.SlotIcon>
                  {costText(imageCost)}
                </ContentBadge>
              </Flex>
              {costsError && (
                <div style={{ fontSize: "12px", color: "var(--vkui--color_text_negative)", padding: "8px" }}>
                  Не удалось обновить стоимость генерации
                </div>
              )}
            </div>
          </InfoRow>
        </Div>
        
        <Div>
          <Button 
            size="l" 
            stretched 
            onClick={onClose}
          >
            Закрыть
          </Button>
        </Div>
      </Group>
    </ModalPage>
  );
};

export default TokensInfoModal;
