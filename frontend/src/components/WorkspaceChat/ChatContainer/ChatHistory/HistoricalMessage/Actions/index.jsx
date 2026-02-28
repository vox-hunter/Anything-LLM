import React, { memo, useState } from "react";
import useCopyText from "@/hooks/useCopyText";
import {
  Check,
  ThumbsUp,
  ArrowsClockwise,
  Copy,
  Smiley,
} from "@phosphor-icons/react";
import Workspace from "@/models/workspace";
import { EditMessageAction } from "./EditMessage";
import RenderMetrics from "./RenderMetrics";
import ActionMenu from "./ActionMenu";
import { useTranslation } from "react-i18next";

const REACTION_OPTIONS = [
  { key: "helpful", label: "Helpful", emoji: "👍" },
  { key: "inaccurate", label: "Inaccurate", emoji: "❌" },
  { key: "needs_more_detail", label: "Needs More Detail", emoji: "🔍" },
  { key: "perfect", label: "Perfect", emoji: "⭐" },
];

const Actions = ({
  message,
  feedbackScore,
  chatId,
  slug,
  isLastMessage,
  regenerateMessage,
  forkThread,
  isEditing,
  role,
  metrics = {},
  alignmentCls = "",
}) => {
  const { t } = useTranslation();
  const [selectedFeedback, setSelectedFeedback] = useState(feedbackScore);
  const handleFeedback = async (newFeedback) => {
    const updatedFeedback =
      selectedFeedback === newFeedback ? null : newFeedback;
    await Workspace.updateChatFeedback(chatId, slug, updatedFeedback);
    setSelectedFeedback(updatedFeedback);
  };

  return (
    <div className={`flex w-full justify-between items-center ${alignmentCls}`}>
      <div className="flex justify-start items-center gap-x-[8px]">
        <CopyMessage message={message} />
        <div className="md:group-hover:opacity-100 transition-all duration-300 md:opacity-0 flex justify-start items-center gap-x-[8px]">
          <EditMessageAction
            chatId={chatId}
            role={role}
            isEditing={isEditing}
          />
          {isLastMessage && !isEditing && (
            <RegenerateMessage
              regenerateMessage={regenerateMessage}
              slug={slug}
              chatId={chatId}
            />
          )}
          {chatId && role !== "user" && !isEditing && (
            <FeedbackButton
              isSelected={selectedFeedback === true}
              handleFeedback={() => handleFeedback(true)}
              tooltipId="feedback-button"
              tooltipContent={t("chat_window.good_response")}
              IconComponent={ThumbsUp}
            />
          )}
          {chatId && role !== "user" && !isEditing && (
            <ReactionPicker chatId={chatId} slug={slug} />
          )}
          <ActionMenu
            chatId={chatId}
            forkThread={forkThread}
            isEditing={isEditing}
            role={role}
          />
        </div>
      </div>
      <RenderMetrics metrics={metrics} />
    </div>
  );
};

function FeedbackButton({
  isSelected,
  handleFeedback,
  tooltipContent,
  IconComponent,
}) {
  return (
    <div className="mt-3 relative">
      <button
        onClick={handleFeedback}
        data-tooltip-id="feedback-button"
        data-tooltip-content={tooltipContent}
        className="text-zinc-300"
        aria-label={tooltipContent}
      >
        <IconComponent
          color="var(--theme-sidebar-footer-icon-fill)"
          size={20}
          className="mb-1"
          weight={isSelected ? "fill" : "regular"}
        />
      </button>
    </div>
  );
}

function CopyMessage({ message }) {
  const { copied, copyText } = useCopyText();
  const { t } = useTranslation();

  return (
    <>
      <div className="mt-3 relative">
        <button
          onClick={() => copyText(message)}
          data-tooltip-id="copy-assistant-text"
          data-tooltip-content={t("chat_window.copy")}
          className="text-zinc-300"
          aria-label={t("chat_window.copy")}
        >
          {copied ? (
            <Check
              color="var(--theme-sidebar-footer-icon-fill)"
              size={20}
              className="mb-1"
            />
          ) : (
            <Copy
              color="var(--theme-sidebar-footer-icon-fill)"
              size={20}
              className="mb-1"
            />
          )}
        </button>
      </div>
    </>
  );
}

function RegenerateMessage({ regenerateMessage, chatId }) {
  const { t } = useTranslation();
  if (!chatId) return null;
  return (
    <div className="mt-3 relative">
      <button
        onClick={() => regenerateMessage(chatId)}
        data-tooltip-id="regenerate-assistant-text"
        data-tooltip-content={t("chat_window.regenerate_response")}
        className="border-none text-zinc-300"
        aria-label={t("chat_window.regenerate")}
      >
        <ArrowsClockwise
          color="var(--theme-sidebar-footer-icon-fill)"
          size={20}
          className="mb-1"
          weight="fill"
        />
      </button>
    </div>
  );
}

function ReactionPicker({ chatId, slug }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const { t } = useTranslation();

  const toggleReaction = async (reactionKey) => {
    if (selected.includes(reactionKey)) {
      await Workspace.removeChatReaction(chatId, slug, reactionKey);
      setSelected((prev) => prev.filter((r) => r !== reactionKey));
    } else {
      await Workspace.addChatReaction(chatId, slug, reactionKey);
      setSelected((prev) => [...prev, reactionKey]);
    }
  };

  return (
    <div className="mt-3 relative">
      <button
        onClick={() => setOpen(!open)}
        data-tooltip-id="reaction-picker"
        data-tooltip-content={t("chat_window.reactions")}
        className="text-zinc-300"
        aria-label={t("chat_window.reactions")}
      >
        <Smiley
          color="var(--theme-sidebar-footer-icon-fill)"
          size={20}
          className="mb-1"
          weight={open ? "fill" : "regular"}
        />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 flex gap-x-1 bg-theme-bg-secondary border border-white/10 rounded-lg p-1 z-10 shadow-lg">
          {REACTION_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleReaction(opt.key)}
              className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                selected.includes(opt.key)
                  ? "bg-primary-button text-white"
                  : "text-theme-text-secondary hover:bg-white/10"
              }`}
              title={opt.label}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(Actions);
