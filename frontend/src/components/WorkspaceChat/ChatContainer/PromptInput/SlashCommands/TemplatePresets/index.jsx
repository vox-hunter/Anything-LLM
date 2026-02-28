import { useEffect, useState } from "react";
import { useIsAgentSessionActive } from "@/utils/chat/agent";
import { useModal } from "@/hooks/useModal";
import System from "@/models/system";
import { FileText } from "@phosphor-icons/react";
import FillVariablesModal from "./FillVariablesModal";

export default function TemplatePresets({ setShowing, sendCommand, promptRef }) {
  const isActiveAgentSession = useIsAgentSessionActive();
  const {
    isOpen: isFillModalOpen,
    openModal: openFillModal,
    closeModal: closeFillModal,
  } = useModal();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  if (isActiveAgentSession) return null;

  const fetchTemplates = async () => {
    const templates = await System.getPromptTemplates();
    setTemplates(templates);
  };

  const handleUseTemplate = (template) => {
    const variables = template.content.match(/\{\{(\w+)\}\}/g);
    if (variables && variables.length > 0) {
      // Has variables - show modal to fill them in
      setSelectedTemplate(template);
      setShowing(false);
      openFillModal();
    } else {
      // No variables - insert directly
      setShowing(false);
      sendCommand({ text: template.content });
      promptRef?.current?.focus();
    }
  };

  const handleInsert = (filledContent) => {
    sendCommand({ text: filledContent });
    promptRef?.current?.focus();
  };

  if (templates.length === 0) return null;

  return (
    <>
      <div className="border-t border-theme-modal-border w-full pt-2 mt-1">
        <div className="px-2 py-1 text-xs text-theme-text-secondary font-medium uppercase">
          Templates
        </div>
      </div>
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          data-slash-command={`/template:${template.title}`}
          onClick={() => handleUseTemplate(template)}
          className="border-none w-full hover:cursor-pointer hover:bg-theme-action-menu-item-hover px-2 py-2 rounded-xl flex flex-row justify-start items-center"
        >
          <FileText
            size={24}
            weight="fill"
            className="text-theme-text-primary flex-shrink-0 mr-2"
          />
          <div className="flex-col text-left flex pointer-events-none flex-1 min-w-0">
            <div className="text-theme-text-primary text-sm font-bold truncate">
              {template.title}
            </div>
            <div className="text-theme-text-secondary text-sm truncate">
              {template.description || template.content.slice(0, 60)}
            </div>
          </div>
        </button>
      ))}
      {selectedTemplate && (
        <FillVariablesModal
          isOpen={isFillModalOpen}
          onClose={() => {
            closeFillModal();
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onInsert={handleInsert}
        />
      )}
    </>
  );
}
