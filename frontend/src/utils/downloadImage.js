import bridge from "@vkontakte/vk-bridge";

const isIOSDevice = () => {
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";

  return /iPad|iPhone|iPod/i.test(userAgent)
    || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

const isHttpUrl = (url) => /^https?:\/\//i.test(url);

const normalizeDownloadUrl = (url) => {
  const value = String(url || "").trim();

  if (!value || /^(blob|data):/i.test(value)) {
    return value;
  }

  try {
    return new URL(value, window.location.href).href;
  } catch {
    return value;
  }
};

const browserDownload = async (url, filename) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("download_failed");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
};

export const downloadGeneratedImage = async (imageUrl, filename = `generated_${Date.now()}.png`) => {
  const isIOS = isIOSDevice();
  const downloadUrl = normalizeDownloadUrl(imageUrl);

  if (!downloadUrl) {
    return {
      ok: false,
      message: "Не удалось скачать изображение: ссылка не найдена.",
    };
  }

  if (isHttpUrl(downloadUrl)) {
    try {
      await bridge.send("VKWebAppDownloadFile", {
        url: downloadUrl,
        filename,
      });

      return { ok: true, method: "bridge" };
    } catch (error) {
      console.warn("VKWebAppDownloadFile failed:", error);

      if (isIOS) {
        return {
          ok: false,
          message: "Если изображение не сохранилось, нажмите «Сохранить изображение» в системном окне iOS.",
        };
      }
    }
  }

  try {
    await browserDownload(downloadUrl, filename);

    return { ok: true, method: "browser" };
  } catch (error) {
    console.warn("Browser image download failed:", error);
  }

  if (isIOS) {
    return {
      ok: false,
      message: "Не удалось скачать изображение. Попробуйте ещё раз из истории генераций.",
    };
  }

  try {
    await bridge.send("VKWebAppOpenExternalLink", { url: downloadUrl });

    return {
      ok: false,
      message: "Не удалось скачать напрямую. Изображение открыто во внешнем окне.",
    };
  } catch (error) {
    console.warn("VKWebAppOpenExternalLink failed:", error);
  }

  window.open(downloadUrl, "_blank", "noopener,noreferrer");

  return {
    ok: false,
    message: "Не удалось скачать напрямую. Изображение открыто в новой вкладке.",
  };
};
