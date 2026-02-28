const LanguageDetect = require("languagedetect");

const detector = new LanguageDetect();
detector.setLanguageType("iso2");

/**
 * Mapping from ISO 639-1 codes to human-readable language names.
 */
const LANGUAGE_MAP = {
  af: "Afrikaans",
  ar: "Arabic",
  bg: "Bulgarian",
  bn: "Bengali",
  cs: "Czech",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  es: "Spanish",
  et: "Estonian",
  fa: "Persian",
  fi: "Finnish",
  fr: "French",
  he: "Hebrew",
  hi: "Hindi",
  hr: "Croatian",
  hu: "Hungarian",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  lt: "Lithuanian",
  lv: "Latvian",
  ms: "Malay",
  nl: "Dutch",
  no: "Norwegian",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  sk: "Slovak",
  sl: "Slovenian",
  sq: "Albanian",
  sr: "Serbian",
  sv: "Swedish",
  th: "Thai",
  tl: "Tagalog",
  tr: "Turkish",
  uk: "Ukrainian",
  vi: "Vietnamese",
  zh: "Chinese",
};

/**
 * Detect the language of a given text string.
 * @param {string} text - The text to detect the language of.
 * @returns {{ language: string|null, code: string|null }} An object with the detected language name and ISO 639-1 code, or null if detection failed.
 */
function detectLanguage(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return { language: null, code: null };
  }

  try {
    const results = detector.detect(text);
    if (!results || results.length === 0) {
      return { language: null, code: null };
    }

    const [code] = results[0];
    const language = LANGUAGE_MAP[code] || null;
    return { language, code };
  } catch {
    return { language: null, code: null };
  }
}

/**
 * Build a translation instruction to append to the system prompt.
 * @param {Object} workspace - The workspace object with autoTranslateResponses and autoTranslateLanguage fields.
 * @param {string} userMessage - The user's message to detect language from.
 * @returns {string|null} A translation instruction string, or null if auto-translate is not enabled.
 */
function buildTranslationInstruction(workspace, userMessage) {
  if (
    !workspace?.autoTranslateResponses ||
    !workspace?.autoTranslateLanguage
  ) {
    return null;
  }

  const targetLanguage = workspace.autoTranslateLanguage;
  const detected = detectLanguage(userMessage);

  if (detected.language) {
    return `The user's message appears to be in ${detected.language}. Always respond in ${targetLanguage} regardless of the language the user writes in.`;
  }

  return `Always respond in ${targetLanguage} regardless of the language the user writes in.`;
}

module.exports = {
  detectLanguage,
  buildTranslationInstruction,
  LANGUAGE_MAP,
};
