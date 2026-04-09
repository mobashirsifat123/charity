const METAL_PRICE_REVALIDATE_SECONDS = 60 * 60 * 6;

export const ZAKAT_CURRENCY = 'GBP';
export const GOLD_NISAB_GRAMS = 87.48;
export const SILVER_NISAB_GRAMS = 612.36;

const FALLBACK_USD_TO_GBP = 0.79;
const FALLBACK_GOLD_USD_PER_TROY_OUNCE = 3035;
const FALLBACK_SILVER_USD_PER_TROY_OUNCE = 34.2;
const TROY_OUNCE_TO_GRAMS = 31.1034768;

async function fetchJson(url) {
  const response = await fetch(url, {
    next: { revalidate: METAL_PRICE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
}

function getGoldApiPrice(payload, symbol) {
  const payloadSymbol = String(payload?.metal || payload?.symbol || '').toUpperCase();

  if (!payload || payloadSymbol !== symbol) {
    throw new Error(`Unexpected metal payload for ${symbol}`);
  }

  const numericPrice = Number(payload.price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw new Error(`Invalid price returned for ${symbol}`);
  }

  return numericPrice;
}

function toPerGram(pricePerTroyOunce) {
  return pricePerTroyOunce / TROY_OUNCE_TO_GRAMS;
}

export async function getLiveMetalPrices() {
  let source = 'live';

  try {
    const [goldPayload, silverPayload, fxPayload] = await Promise.all([
      fetchJson('https://api.gold-api.com/price/XAU'),
      fetchJson('https://api.gold-api.com/price/XAG'),
      fetchJson('https://open.er-api.com/v6/latest/USD'),
    ]);

    const goldUsdPerTroyOunce = getGoldApiPrice(goldPayload, 'XAU');
    const silverUsdPerTroyOunce = getGoldApiPrice(silverPayload, 'XAG');
    const usdToGbp = Number(fxPayload?.rates?.GBP);

    if (!Number.isFinite(usdToGbp) || usdToGbp <= 0) {
      throw new Error('Invalid USD to GBP rate');
    }

    const goldPricePerGram = toPerGram(goldUsdPerTroyOunce) * usdToGbp;
    const silverPricePerGram = toPerGram(silverUsdPerTroyOunce) * usdToGbp;

    return {
      source,
      currency: ZAKAT_CURRENCY,
      usdToGbp,
      goldUsdPerTroyOunce,
      silverUsdPerTroyOunce,
      goldPricePerGram,
      silverPricePerGram,
      goldNisabValue: goldPricePerGram * GOLD_NISAB_GRAMS,
      silverNisabValue: silverPricePerGram * SILVER_NISAB_GRAMS,
      fetchedAt:
        goldPayload?.updatedAt ||
        (goldPayload?.timestamp ? new Date(goldPayload.timestamp * 1000).toISOString() : new Date().toISOString()),
    };
  } catch (error) {
    console.error('Falling back to static metal prices for zakat calculator:', error);
    source = 'fallback';

    const goldPricePerGram = toPerGram(FALLBACK_GOLD_USD_PER_TROY_OUNCE) * FALLBACK_USD_TO_GBP;
    const silverPricePerGram = toPerGram(FALLBACK_SILVER_USD_PER_TROY_OUNCE) * FALLBACK_USD_TO_GBP;

    return {
      source,
      currency: ZAKAT_CURRENCY,
      usdToGbp: FALLBACK_USD_TO_GBP,
      goldUsdPerTroyOunce: FALLBACK_GOLD_USD_PER_TROY_OUNCE,
      silverUsdPerTroyOunce: FALLBACK_SILVER_USD_PER_TROY_OUNCE,
      goldPricePerGram,
      silverPricePerGram,
      goldNisabValue: goldPricePerGram * GOLD_NISAB_GRAMS,
      silverNisabValue: silverPricePerGram * SILVER_NISAB_GRAMS,
      fetchedAt: new Date().toISOString(),
    };
  }
}
