import {
  ButtonGroup,
  Textarea,
  Button,
  Flex,
  Headline,
  IconButton,
  Placeholder,
  Text,
  Spacing,
  Spinner,
  Snackbar,
  Popover,
  Image,
  Div,
  CustomSelect,
  CustomSelectOption,
  ModalRoot,
} from '@vkontakte/vkui';

import {
  Icon24Copy,
  Icon56Stars3Outline,
  Icon56HistoryOutline,
  Icon20QuestionOutline,
  Icon20PicturePlusOutline,
  Icon12Cancel,
  Icon28CheckCircleOutline,
  Icon24Download
} from "@vkontakte/icons";

import SubscribeModal from "../modals/SubscribeModal";
import useGenerationStore from '../stores/useGenerationStore';

import { useState, useEffect, useRef } from 'react';

const PostsGenerator = ({ contentType }) => {
  const [prompt, setPrompt] = useState("");
  const fileInputRef = useRef(null);
  const [filePreview, setFilePreview] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [file, setFile] = useState(null);

  const aspectOptions = [
    { value: '1:1', label: '1:1' },
    { value: '2:3', label: '2:3' },
    { value: '3:2', label: '3:2' },
    { value: '3:4', label: '3:4' },
    { value: '4:3', label: '4:3' },
    { value: '4:5', label: '4:5' },
    { value: '5:4', label: '5:4' },
    { value: '9:16', label: '9:16' },
    { value: '16:9', label: '16:9' },
    { value: '21:9', label: '21:9' },
  ];

  const {
    taskResult,
    isPolling,
    isChecking,
    error,
    reset,
    generateContent,
    message,
    savedPrompt,
    taskStatus,
  } = useGenerationStore();

  useEffect(() => {
    if (message && message.includes("Недостаточно токенов")) {
      setActiveModal('subscribe');
    }
  }, [message]);

  useEffect(() => {
    if (savedPrompt) {
      setPrompt(savedPrompt);
    }
  }, [savedPrompt]);

  useEffect(() => {
    if (!isPolling && !taskResult) {
      reset(); 
      setPrompt("");
      setFilePreview(null);
    }
  }, [contentType]);

  const downloadImage = async (imageUrl) => {
    // 1. VK Bridge (мобилка)
    try {
      await bridge.send("VKWebAppDownloadFile", {
        url: imageUrl,
        filename: `generated_${Date.now()}.png` 
      });
      return;
    } catch {}

    // 2. ПК через fetch
    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error('Ошибка загрузки');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `generated_${Date.now()}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      return;

    } catch (error) {
      console.warn('fetch не сработал:', error);
    }

    window.open(imageUrl, '_blank');
  };

  const handleCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (err) {
      console.error('Ошибка при копировании:', err);
    }
    document.body.removeChild(textarea);
    
    if (success) {
      setSnackbar(
        <Snackbar
          onClose={() => setSnackbar(null)}
          before={<Icon28CheckCircleOutline fill="var(--vkui--color_icon_positive)" />}
        >
          Текст скопирован в буфер обмена
        </Snackbar>
      );
    } else {
      setSnackbar(
        <Snackbar
          onClose={() => setSnackbar(null)}
          before={<Icon28CheckCircleOutline fill="var(--vkui--color_icon_negative)" />}
        >
          Не удалось скопировать текст. Скопируйте вручную
        </Snackbar>
      );
    }
    
    setTimeout(() => setSnackbar(null), 3000);
  };

  const handleGenerate = async () => {
    generateContent(contentType, {
      prompt,
      image: file,
      aspectRatio,
    });
  };

  const handleClearAll = () => {
    setPrompt('');
    reset();
    setFilePreview(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const modals = (
    <ModalRoot activeModal={activeModal} onClose={() => setActiveModal(null)}>
      <SubscribeModal id="subscribe" onClose={() => setActiveModal(null)} />
    </ModalRoot>
  );

  return (
    <>
      <Flex direction="column" style={{ gap: "10px" }}>
        <Spacing />
        <Flex align="center" justify="space-between">
          <Flex align="center" style={{ gap: 3 }}>
            <Headline level="1" style={{ color: "var(--vkui--color_text_secondary)" }}>
              Промпт
            </Headline>
            <Popover
              style={{ marginLeft: 10 }}
              placement="bottom"
              role="tooltip"
              aria-describedby="tooltip-1"
              content={
                <Div style={{ maxWidth: 280 }}> {/* Ограничь ширину контента */}
                  <Headline level="3" weight="2" style={{ marginBottom: 4 }}>Формула:</Headline>
                  <Text style={{ fontSize: 14 }}>
                    {contentType === "post" 
                      ? "[Роль] + [Задача] + [Контекст] + [Формат] + [Ограничения]" 
                      : "[Что изображено] + [Стиль/техника] + [Освещение] + [Камера] + [Финальный маркер]"}
                  </Text>
                </Div>
              }
              restoreFocus="anchor-element"
            >
              <Button id="tooltip-1" mode="tertiary" before={<Icon20QuestionOutline color="#818c99" />} rounded aria-label="Подсказка к промпту" />
            </Popover>
          </Flex>
          <>
            {contentType === "image" && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={onFileChange}
                />
                <Button 
                  id="tooltip-1"
                  mode="secondary"
                  before={<Icon20PicturePlusOutline />}
                  style={{ color: "var(--vkui--color_icon_secondary)" }}
                  rounded
                  aria-label="Добавить файл"
                  onClick={handleButtonClick}
                  disabled={isPolling || isChecking}
                >
                  Добавить фото
                </Button>
              </>
            )}
          </>
        </Flex>

        {filePreview && (
          <Div>
            <Image size={96} src={filePreview}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px' }}>
                <IconButton 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  background: 'var(--vkui--color_background_accent)', // Синий фон
                  color: 'white',
                  borderRadius: '50%',
                  padding: 0,
                  height: "fit-content",
                  padding: 4,
                  margin: "2px 2px 0 0"
                }}
                onClick={() => setFilePreview(null)}
              >
                <Icon12Cancel />
              </IconButton>
              </div>
            </Image>
          </Div>
        )}

        <Textarea
          name="prompt" 
          value={prompt}
          disabled={isPolling || isChecking}
          onChange={(e) => setPrompt(e.currentTarget.value)}
          placeholder={contentType === "post" ? "Напишите промпт для генерации поста" : "Напишите промпт для генерации изображения"}
        />

        {contentType === "image" && (
          <CustomSelect
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value )}
            options={aspectOptions}
            placeholder="Выберите соотношение сторон"
            disabled={isPolling || isChecking}
          />
        )}

        <ButtonGroup mode="horizontal" gap="s" stretched>
          <Button
            size="m"
            appearance="accent-invariable"
            mode="primary"
            stretched
            disabled={!prompt.trim() || isPolling || isChecking}
            onClick={() => handleGenerate()}
          >
            Сгенерировать
          </Button>
          <Button
            size="m"
            appearance="accent-invariable"
            mode="outline"
            stretched
            disabled={isPolling || isChecking}
            onClick={handleClearAll}
          >
            Очистить
          </Button>
        </ButtonGroup>
        <Div style={{
          border: "1px solid var(--vkui--color_separator_primary)",
          borderRadius: "12px",
          padding: 0,
          background: "var(--vkui--color_background_content)"
        }}
        >
          <Flex justify="space-between" align="center" style={{ color: "var(--vkui--color_text_secondary)" }}>
            <Headline level="1" style={{ paddingLeft: 10 }}>
              Результат:
            </Headline>
            {contentType === "post" ? (
              <IconButton 
                onClick={() => handleCopy(taskResult)} 
                disabled={!taskResult}
                aria-label="Копировать результат"
              >
                <Icon24Copy />
              </IconButton>
            ) : (
              <IconButton 
                onClick={() => downloadImage(taskResult)} 
                disabled={!taskResult}
                aria-label="Скачать изображение"
              >
                <Icon24Download />
              </IconButton>
            )}
          </Flex>

          {taskResult ? (
            <Div style={{ padding: "0 10px 10px 10px" }}>
              {contentType === "post" ? (
                <Text style={{ whiteSpace: 'pre-wrap', borderRadius: "8px", padding: 10, background: "var(--vkui--color_background_secondary_alpha)",
                  color: "var(--vkui--color_text_primary)",
                  border: "1px solid var(--vkui--color_separator_primary)" }}>{taskResult}</Text>
              ) : (
                <img src={taskResult} alt="Result" style={{ width: '100%', borderRadius: '8px' }} />
              )}
            </Div>
          ) : error ? (
            <Placeholder
              icon={<Icon56HistoryOutline />}
              header="Ошибка загрузки"
            >
              {error}
            </Placeholder>
          ) : message ? (
            <Placeholder
              icon={<Icon56HistoryOutline />}
              header="Ошибка отправки"
            >
              {message}
            </Placeholder>
          ) : taskStatus === "failed" ? (
            <Placeholder
              icon={<Icon56HistoryOutline />}
              header="Ошибка генерации"
            >
              Возникли проблемы с генерацией на стороне сервиса! Ваш баланс токенов сохранен!
            </Placeholder>
          ) : (
            <Placeholder
              style={{ color: "var(--vkui--color_text_secondary)" }}
              icon={isPolling ? <Spinner size="medium" /> : <Icon56Stars3Outline />}
              header={isPolling ? "Идет генерация..." : undefined}
            >
              {!isPolling && (
                `Здесь отобразится результат генерации ${contentType === "post" ? "поста" : "изображения"}`
              )}
            </Placeholder>
          )}
        </Div>
      </Flex>
      {modals}
      {snackbar}
    </>
  );
};

export default PostsGenerator;