import { useIsAgentSessionActive } from "@/utils/chat/agent";
import { useTranslation } from "react-i18next";

export default function ClearCommand({ setShowing, sendCommand }) {
  const { t } = useTranslation();
  const isActiveAgentSession = useIsAgentSessionActive();
  if (isActiveAgentSession) return null;

  return (
    <button
      type="button"
      data-slash-command="/clear"
      onClick={() => {
        setShowing(false);
        sendCommand({ text: "/clear", autoSubmit: true });
      }}
      className="border-none w-full hover:cursor-pointer hover:bg-theme-action-menu-item-hover px-2 py-2 rounded-xl flex flex-col justify-start"
    >
      <div className="w-full flex-col text-left flex pointer-events-none">
        <div className="text-white text-sm font-bold">
          {t("chat_window.slash_clear")}
        </div>
        <div className="text-white text-opacity-60 text-sm">
          {t("chat_window.preset_clear_description")}
        </div>
      </div>
    </button>
  );
}
