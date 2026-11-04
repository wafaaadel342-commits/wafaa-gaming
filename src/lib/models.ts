export interface ModelItem {
  id: string;
  label: string;
  isFree?: boolean;
}

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedData {
  timestamp: number;
  models: ModelItem[];
}

function getCached(key: string): ModelItem[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedData;
    if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS && Array.isArray(parsed.models)) {
      return parsed.models;
    }
  } catch {
    // ignore
  }
  return null;
}

function setCached(key: string, models: ModelItem[]) {
  try {
    const data: CachedData = { timestamp: Date.now(), models };
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/** Fetches FREE models from OpenRouter only (no API key needed for model catalogue). */
export async function fetchOpenRouterModels(forceRefresh = false): Promise<ModelItem[]> {
  const cacheKey = "tahaddi-models-openrouter";
  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached && cached.length > 0) return cached;
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models");
    if (!res.ok) {
      throw new Error("تعذّر تحميل القائمة");
    }

    const json = await res.json();
    const dataList = Array.isArray(json?.data) ? json.data : [];
    const models: ModelItem[] = [];

    for (const item of dataList) {
      const id = String(item.id || "");
      if (!id) continue;

      const modality = String(item.architecture?.modality || "");
      // Keep text-output models only
      if (modality && !modality.includes("->text")) {
        continue;
      }

      const isFree =
        id.endsWith(":free") ||
        (String(item.pricing?.prompt) === "0" && String(item.pricing?.completion) === "0");

      // ONLY include free models
      if (!isFree) continue;

      models.push({
        id,
        label: String(item.name || id),
        isFree: true,
      });
    }

    if (models.length > 0) {
      setCached(cacheKey, models);
    }
    return models;
  } catch (err: unknown) {
    if (err instanceof Error) throw err;
    throw new Error("تعذّر تحميل القائمة");
  }
}

/** Picks the best free model from OpenRouter. */
export function getBestFreeModel(models: ModelItem[]): string {
  if (models.length === 0) {
    // Fallback to a known free model
    return "meta-llama/llama-3.3-70b-instruct:free";
  }

  // Prefer models with "flash", "mini", or higher quality in name
  const preferredModel = models.find(
    (m) =>
      m.isFree &&
      (m.id.toLowerCase().includes("llama-3.3") ||
        m.id.toLowerCase().includes("gemini") ||
        m.id.toLowerCase().includes("flash") ||
        m.id.toLowerCase().includes("qwen")),
  );
  if (preferredModel) return preferredModel.id;

  // Return any free model
  const anyFree = models.find((m) => m.isFree);
  if (anyFree) return anyFree.id;

  // Final fallback
  return models[0]!.id;
}
