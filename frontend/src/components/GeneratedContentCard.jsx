import {
  Div,
  Flex,
  Spacing,
  Headline,
  Text,
  Separator,
  Accordion,
  EllipsisText,
  Button,
  Snackbar,
  IconButton
} from "@vkontakte/vkui";

import { useState } from "react";

import { Icon24DownloadOutline, Icon24Copy, Icon28CheckCircleOutline } from "@vkontakte/icons";

import bridge from "@vkontakte/vk-bridge";

const GeneratedContentCard = ({ card, type }) => {

  const [snackbar, setSnackbar] = useState(null);

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

      // 🔴 ВАЖНО: если дошли сюда — всё ок → выходим
      return;

    } catch (error) {
      console.warn('fetch не сработал:', error);
    }

    // 3. fallback ТОЛЬКО если всё реально упало
    window.open(imageUrl, '_blank');
  };

  const handleCopy = async (text) => {
    let success = false;

    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch (err) {
    
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        success = document.execCommand("copy");

        document.body.removeChild(textarea);
      } catch (e) {
        console.error("Fallback тоже не сработал:", e);
      }
    }

    setSnackbar(
      <Snackbar
        style={{ marginBottom: 80 }}
        onClose={() => setSnackbar(null)}
        before={
          <Icon28CheckCircleOutline
            fill={
              success
                ? "var(--vkui--color_icon_positive)"
                : "var(--vkui--color_icon_negative)"
            }
          />
        }
      >
        {success
          ? "Текст скопирован в буфер обмена"
          : "Не удалось скопировать текст"}
      </Snackbar>
    );

    setTimeout(() => setSnackbar(null), 3000);
  };

  return (
    <>
      <Div style={{ background: "var(--vkui--color_background_content)",
        border: "1px solid var(--vkui--color_separator_primary)",
        borderRadius: "12px", 
        padding: "8px" 
      }}>
        <Spacing />
        <Flex direction="column" style={{ gap: "5px" }}>
          <Flex style={{ color: "var(--vkui--color_text_secondary)", paddingLeft: "10px", gap: "5px" }}>
            <Headline level="1">
              Дата:
            </Headline>
            <Text style={{ color: "var(--vkui--color_text_primary)" }}>{card.createdAt}</Text>
          </Flex>

          <Spacing />
          <Separator />
          <Spacing />

          <Flex style={{ color: "#99a2ad", paddingLeft: "10px", gap: "5px" }}>
            <Headline level="1">
              Промпт:
            </Headline>
          </Flex>
          <Accordion>
            <Accordion.Summary>
              <EllipsisText maxWidth={200}>
                {card.prompt.replace(/\\n/g, ' ').replace(/\\"/g, '"')}
              </EllipsisText>
            </Accordion.Summary>
            <Accordion.Content>
              <Div>
                {card.prompt}
              </Div>
            </Accordion.Content>
          </Accordion>

          <Separator />

          <Flex style={{ color: "#99a2ad", paddingLeft: "10px" }}>
            <Flex align="center" justify="space-between" style={{ color: "#99a2ad", paddingLeft: "10px", paddingRight: "4px", gap: "5px" }}>
              <Headline level="1">Результат:</Headline>
              {type === "posts" && (
                <IconButton onClick={() => handleCopy(card.result)} aria-label="Копировать">
                  <Icon24Copy />
                </IconButton>
              )}
            </Flex>
          </Flex>
          <Accordion>
            <Accordion.Summary>
              <EllipsisText maxWidth={200}>
                { type === "posts" ? card.result : "Изображение"}
              </EllipsisText>
            </Accordion.Summary>
            <Accordion.Content>
              <Div style={{ padding: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {type === "posts" ? (
                  <Text style={{ whiteSpace: 'pre-wrap', color: "var(--vkui--color_text_primary)" }}>{card.result}</Text>
                ) : (
                  <Flex direction="column" style={{ gap: 10 }}>
                    <Button
                      size="m"
                      mode="secondary"
                      before={<Icon24DownloadOutline />}
                      onClick={() => downloadImage(card.result)}
                      stretched
                    >
                      Скачать изображение
                    </Button>
                    <img src={encodeURI(card.result)} alt="Result" style={{ width: '100%', height: 'auto', borderRadius: '12px' }} />
                  </Flex>
                )}
              </Div>
            </Accordion.Content>
          </Accordion>
        </Flex>
      </Div>
      {snackbar}
    </>
  );
};

export default GeneratedContentCard;