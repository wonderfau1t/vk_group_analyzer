export const DEFAULT_GENERATION_COSTS = {
  post: null,
  image: null,
};

const toCost = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const COST_ALIASES = {
  post: ["post", "content", "text"],
  image: ["image", "picture"],
};

const readCost = (source, type) => {
  if (!source) {
    return null;
  }

  const directValue = COST_ALIASES[type].reduce((value, alias) => {
    if (value !== undefined && value !== null) {
      return value;
    }

    return (
      source[alias] ??
      source[`${alias}_cost`] ??
      source[`${alias}Cost`] ??
      source[`${alias}_tokens`] ??
      source[`${alias}Tokens`]
    );
  }, null);

  if (directValue && typeof directValue === "object") {
    return toCost(directValue.cost ?? directValue.tokens ?? directValue.value);
  }

  return toCost(directValue);
};

export const normalizeGenerationCosts = (data) => {
  const source = data?.costs ?? data?.data ?? data;

  if (Array.isArray(source)) {
    return source.reduce((acc, item) => {
      const rawType = item.type ?? item.task_type ?? item.name;
      const type = Object.entries(COST_ALIASES).find(([, aliases]) => aliases.includes(rawType))?.[0];

      if (type === "post" || type === "image") {
        acc[type] = toCost(item.cost ?? item.tokens ?? item.value);
      }

      return acc;
    }, { ...DEFAULT_GENERATION_COSTS });
  }

  return {
    post: readCost(source, "post"),
    image: readCost(source, "image"),
  };
};

const pluralizeToken = (value) => {
  const absoluteValue = Math.abs(Math.trunc(value));
  const lastDigit = absoluteValue % 10;
  const lastTwoDigits = absoluteValue % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return "токен";
  }

  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    return "токена";
  }

  return "токенов";
};

export const formatGenerationCost = (cost) => {
  if (cost === null || cost === undefined) {
    return null;
  }

  const formattedCost = Number.isInteger(cost) ? String(cost) : cost.toString();
  return `${formattedCost} ${pluralizeToken(cost)}`;
};
