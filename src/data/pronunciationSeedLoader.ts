import type { PronunciationItemType, PronunciationLanguage } from '../lib/pronunciation';

export type SeedFileEntry = {
  targetText: string;
  english?: string;
  romanization?: string;
};

function langSlug(language: PronunciationLanguage): string {
  if (language === 'English') return 'english';
  if (language === 'Hindi') return 'hindi';
  return 'bengali';
}

export async function loadPronunciationSeedFile(params: {
  language: PronunciationLanguage;
  type: PronunciationItemType;
}): Promise<SeedFileEntry[]> {
  if (params.type === 'letter') return [];

  const url = `/assets/data/pronunciation-seed/${langSlug(params.language)}/${params.type}.json`;

  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return [];
    const json = (await res.json()) as unknown;
    if (!Array.isArray(json)) return [];

    // Minimal runtime validation
    return json
      .filter((x) => x && typeof x === 'object')
      .map((x) => x as SeedFileEntry)
      .filter((x) => typeof x.targetText === 'string' && x.targetText.trim().length > 0)
      .map((x) => ({
        targetText: x.targetText,
        english: typeof x.english === 'string' ? x.english : undefined,
        romanization: typeof x.romanization === 'string' ? x.romanization : undefined,
      }));
  } catch {
    return [];
  }
}
