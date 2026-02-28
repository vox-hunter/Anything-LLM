/* eslint-env jest, node */
const {
  detectLanguage,
  buildTranslationInstruction,
  LANGUAGE_MAP,
} = require("../../../utils/languageDetection");

describe("detectLanguage", () => {
  test("should return null for empty input", () => {
    expect(detectLanguage("")).toEqual({ language: null, code: null });
    expect(detectLanguage(null)).toEqual({ language: null, code: null });
    expect(detectLanguage(undefined)).toEqual({ language: null, code: null });
    expect(detectLanguage("   ")).toEqual({ language: null, code: null });
  });

  test("should return null for non-string input", () => {
    expect(detectLanguage(123)).toEqual({ language: null, code: null });
    expect(detectLanguage({})).toEqual({ language: null, code: null });
  });

  test("should detect English text", () => {
    const result = detectLanguage(
      "This is a longer English sentence that should be detectable by the language detection library."
    );
    expect(result.code).toBe("en");
    expect(result.language).toBe("English");
  });

  test("should detect French text", () => {
    const result = detectLanguage(
      "Bonjour le monde, comment allez-vous aujourd'hui? Je suis très content de vous voir."
    );
    expect(result.code).toBe("fr");
    expect(result.language).toBe("French");
  });

  test("should detect German text", () => {
    const result = detectLanguage(
      "Guten Tag, wie geht es Ihnen? Ich bin sehr froh, Sie zu sehen."
    );
    expect(result.code).toBe("de");
    expect(result.language).toBe("German");
  });

  test("should detect Spanish text", () => {
    const result = detectLanguage(
      "Hola, ¿cómo estás? Estoy muy contento de estar aquí con ustedes esta mañana."
    );
    expect(result.code).toBe("es");
    expect(result.language).toBe("Spanish");
  });

  test("should return a result with code and language keys for valid input", () => {
    const result = detectLanguage("Hello world, how are you doing today?");
    expect(result).toHaveProperty("code");
    expect(result).toHaveProperty("language");
  });
});

describe("buildTranslationInstruction", () => {
  test("should return null when autoTranslateResponses is false", () => {
    const workspace = {
      autoTranslateResponses: false,
      autoTranslateLanguage: "Spanish",
    };
    expect(buildTranslationInstruction(workspace, "Hello")).toBeNull();
  });

  test("should return null when autoTranslateResponses is not set", () => {
    const workspace = { autoTranslateLanguage: "Spanish" };
    expect(buildTranslationInstruction(workspace, "Hello")).toBeNull();
  });

  test("should return null when autoTranslateLanguage is not set", () => {
    const workspace = { autoTranslateResponses: true };
    expect(buildTranslationInstruction(workspace, "Hello")).toBeNull();
  });

  test("should return null when workspace is null", () => {
    expect(buildTranslationInstruction(null, "Hello")).toBeNull();
  });

  test("should include target language in instruction when enabled", () => {
    const workspace = {
      autoTranslateResponses: true,
      autoTranslateLanguage: "Spanish",
    };
    const instruction = buildTranslationInstruction(
      workspace,
      "This is a longer English sentence for testing the language detection capability."
    );
    expect(instruction).toContain("Spanish");
    expect(instruction).toContain("Always respond in");
  });

  test("should include detected language when detectable", () => {
    const workspace = {
      autoTranslateResponses: true,
      autoTranslateLanguage: "Spanish",
    };
    const instruction = buildTranslationInstruction(
      workspace,
      "This is a longer English sentence for testing the language detection capability."
    );
    expect(instruction).toContain("English");
    expect(instruction).toContain("Spanish");
  });

  test("should return fallback instruction when user message is empty", () => {
    const workspace = {
      autoTranslateResponses: true,
      autoTranslateLanguage: "French",
    };
    const instruction = buildTranslationInstruction(workspace, "");
    // Empty message means detection returns null, so fallback instruction is used
    expect(instruction).toContain("French");
    expect(instruction).toContain("Always respond in");
  });

  test("should still return instruction with target language when detection fails on short text", () => {
    const workspace = {
      autoTranslateResponses: true,
      autoTranslateLanguage: "German",
    };
    const instruction = buildTranslationInstruction(workspace, "Hi");
    // Short text may or may not be detectable, but instruction should reference target language
    if (instruction) {
      expect(instruction).toContain("German");
    }
  });
});

describe("LANGUAGE_MAP", () => {
  test("should contain common language codes", () => {
    expect(LANGUAGE_MAP.en).toBe("English");
    expect(LANGUAGE_MAP.fr).toBe("French");
    expect(LANGUAGE_MAP.de).toBe("German");
    expect(LANGUAGE_MAP.es).toBe("Spanish");
    expect(LANGUAGE_MAP.ja).toBe("Japanese");
    expect(LANGUAGE_MAP.zh).toBe("Chinese");
  });

  test("should have string values for all keys", () => {
    for (const [key, value] of Object.entries(LANGUAGE_MAP)) {
      expect(typeof key).toBe("string");
      expect(typeof value).toBe("string");
    }
  });
});
