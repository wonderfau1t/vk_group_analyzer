import {
  Panel,
  PanelHeader,
  PanelHeaderButton,
  SegmentedControl,
  CellButton,
  Spacing,
  Button,
  Flex,
  ContentBadge,
  Separator,
  ModalRoot,
  ScreenSpinner,
  // Spinner,
  Div,
} from "@vkontakte/vkui";

import { 
  Icon28MenuOutline, 
  Icon20ArrowRightOutline,
  Icon20Flash,
  Icon20NftHeptagonOutline,
  Icon20InfoCircleOutline
} from '@vkontakte/icons';

import PostsGenerator from "./PostsGenerator";
import SubscribeModal from "../modals/SubscribeModal";
import TokensInfoModal from "../modals/TokensInfoModal";
import useGenerationStore from "../stores/useGenerationStore";

import { useState, useEffect } from "react";

const ContentGenerating = ({ id, goToMenu, goToPastGeneratedContent }) => {
  const [activeTab, setActiveTab] = useState("post");
  const [activeModal, setActiveModal] = useState(null);

  const tabType = useGenerationStore(state => state.tabType);

  useEffect(() => {
    // Если с сервера пришло 'image', меняем локальный стейт вкладки
    if (tabType) {
      setActiveTab(tabType);
    }
  }, [tabType]);

  const {
    balance,
    isDonut,
    isChecking,
    checkAndStartPolling,
    stopPolling,
    fetchBalance,
    reset,
  } = useGenerationStore();

  useEffect(() => {
    fetchBalance();
    checkAndStartPolling();

    return () => {
      stopPolling();
    };
  }, [fetchBalance, checkAndStartPolling, stopPolling]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    reset();
  }

  const modals = (
    <ModalRoot activeModal={activeModal} onClose={() => setActiveModal(null)}>
      <SubscribeModal id="subscribe" onClose={() => setActiveModal(null)} />
      <TokensInfoModal id="tokens-info" onClose={() => setActiveModal(null)} />
    </ModalRoot>
  );

  return (
    <>
      <Panel id={id}>
        <PanelHeader
          before={
            <PanelHeaderButton aria-label="Выход в меню" onClick={goToMenu}>
              <Icon28MenuOutline />
            </PanelHeaderButton>
          }
        >
          Генерация контента
        </PanelHeader>
        <Div>
          <Flex justify="space-between" style={{ gap: "10px" }}>
            <div >
              <ContentBadge size="l" appearance="accent-green" style={{ marginRight: "5px" }}>
                <ContentBadge.SlotIcon>
                  <Icon20Flash  />
                </ContentBadge.SlotIcon>
                {balance} токенов
              </ContentBadge>
              <Button mode="tertiary" before={<Icon20InfoCircleOutline />} rounded aria-label="Информация о токенах"
                onClick={() => setActiveModal('tokens-info')}  
              />
            </div>
            <Button
              before={<Icon20NftHeptagonOutline />}
              rounded
              mode={isDonut ? "outline" : "primary"}
              aria-label="Подписаться"
              onClick={() => setActiveModal('subscribe')}
            >
              Подписка
            </Button>
          </Flex>
          <Spacing size="2xl" />
          <Separator />
          <Spacing />
          <CellButton
            after={<Icon20ArrowRightOutline />}
            onClick={goToPastGeneratedContent}
          >
            Прошлые генерации
          </CellButton>
          <Spacing />
          <SegmentedControl 
            name="groups"
            value={activeTab}
            options={[
              {
                label: "Посты",
                value: "post",
              },
              {
                label: "Изображения",
                value: "image",
              },
            ]}
            onChange={handleTabChange}
          />

          {isChecking ? (
            <ScreenSpinner size='large' caption='Загружаем данные о группах'>Проверяем статус ваших генераций</ScreenSpinner>
          ) : (
            <PostsGenerator contentType={activeTab} />
          )}
        </Div>
      </Panel>
      {modals}
    </>
  );
};

export default ContentGenerating;