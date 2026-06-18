export const openExternalLink = (url) => {
  const openedWindow = window.open(url, "_blank", "noopener,noreferrer");

  if (openedWindow) {
    openedWindow.opener = null;
    return;
  }

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
