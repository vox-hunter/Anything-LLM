import { useState } from "react";

const SUPPORTED_LANGUAGES = [
  "Arabic",
  "Bengali",
  "Bulgarian",
  "Chinese",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Estonian",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Latvian",
  "Lithuanian",
  "Malay",
  "Norwegian",
  "Persian",
  "Polish",
  "Portuguese",
  "Romanian",
  "Russian",
  "Serbian",
  "Slovak",
  "Slovenian",
  "Spanish",
  "Swedish",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Vietnamese",
];

export default function ChatAutoTranslateSettings({
  workspace,
  setHasChanges,
}) {
  const [enabled, setEnabled] = useState(
    workspace?.autoTranslateResponses || false
  );

  return (
    <div>
      <div className="flex flex-col">
        <label htmlFor="autoTranslateResponses" className="block input-label">
          Auto-translate Responses
        </label>
        <p className="text-white text-opacity-60 text-xs font-medium py-1.5">
          Automatically detect the language of user messages and instruct the LLM
          to respond in the selected target language.
        </p>
      </div>

      <div className="flex flex-col gap-y-4 mt-2">
        <div className="w-fit flex gap-x-1 items-center p-1 rounded-lg bg-theme-settings-input-bg">
          <input type="hidden" name="autoTranslateResponses" value={enabled} />
          <button
            type="button"
            disabled={enabled === false}
            onClick={() => {
              setEnabled(false);
              setHasChanges(true);
            }}
            className="transition-bg duration-200 px-6 py-1 text-md text-white/60 disabled:text-white bg-transparent disabled:bg-[#687280] rounded-md"
          >
            Off
          </button>
          <button
            type="button"
            disabled={enabled === true}
            onClick={() => {
              setEnabled(true);
              setHasChanges(true);
            }}
            className="transition-bg duration-200 px-6 py-1 text-md text-white/60 disabled:text-white bg-transparent disabled:bg-[#687280] rounded-md"
          >
            On
          </button>
        </div>

        {enabled && (
          <div>
            <label
              htmlFor="autoTranslateLanguage"
              className="block input-label mb-2"
            >
              Target Language
            </label>
            <select
              name="autoTranslateLanguage"
              defaultValue={workspace?.autoTranslateLanguage || "English"}
              onChange={() => setHasChanges(true)}
              className="border-none bg-theme-settings-input-bg text-white text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
