import {
  Div,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  ScreenSpinner,
  // Spinner,
  SegmentedControl,
  Spacing,
  Placeholder,
  Button,
} from "@vkontakte/vkui";

import {
  Icon56HistoryOutline
} from "@vkontakte/icons";

import { useEffect, useState } from "react";
import GeneratedContentCard from "../components/GeneratedContentCard";
import useGenerationStore from "../stores/useGenerationStore";

const PastGenerations = ({ id, goBackToContent }) => {
  const [activeTab, setActiveTab] = useState('posts');
  
  const {
    generationHistory,
    isHistoryLoading,
    historyError,
    getGenerationHistory,
    clearHistory,
  } = useGenerationStore();

  const handleTabChange = (value) => {
    setActiveTab(value);
  }

  useEffect(() => {
    getGenerationHistory(activeTab);

    return () => {
      clearHistory();
    };
  }, [activeTab, getGenerationHistory, clearHistory]);

  return (
    <Panel id={id}>
      <PanelHeader
        before={
          <PanelHeaderBack onClick={goBackToContent} />
        }
      >
        История генераций
      </PanelHeader>

      <Div>
        <SegmentedControl 
          name='groups'
          value={activeTab}
          options={[
            {
              label: 'Посты',
              value: 'posts',
            },
            {
              label: 'Изображения',
              value: 'images',
            },
          ]}
          onChange={handleTabChange}
        />
        <Spacing />
        <Div 
          style={{
            background: "var(--vkui--color_background_secondary_alpha)", // Мягкий фон подложки
            border: "1px solid var(--vkui--color_separator_primary)",
            borderRadius: "12px",
            padding: 0,
          }}
        >
          {isHistoryLoading ? (
            <ScreenSpinner size='large' caption='Загружаем данные о группах'>Поиск групп</ScreenSpinner>
          ) : historyError ? (
            <Placeholder
              icon={<Icon56HistoryOutline />}
              header="Ошибка загрузки"
              action={
                <Button onClick={() => getGenerationHistory(activeTab)}>
                  Повторить
                </Button>
              }
            >
              {historyError}
            </Placeholder>
          ) : (
            <>
              {generationHistory && generationHistory.length > 0 ? (
                generationHistory.map((card) => (
                  <div style={{ padding: "10px" }} key={card.id}>
                    <GeneratedContentCard card={card} type={activeTab} />
                  </div>
                ))
              ) : (
                <Placeholder
                  icon={<Icon56HistoryOutline />}
                  header="Нет истории"
                >
                  {activeTab === 'posts' 
                    ? "Здесь будут отображаться ваши сгенерированные посты" 
                    : "Здесь будут отображаться ваши сгенерированные изображения"}
                </Placeholder>
              )}
            </>
          )}
        </Div>
      </Div>
    </Panel>
  );
};

export default PastGenerations;