import { useState } from "react";
import { X } from "@phosphor-icons/react";
import ModalWrapper from "@/components/ModalWrapper";

/**
 * Extracts {{variableName}} patterns from template content.
 */
function extractVariables(content) {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "")))];
}

/**
 * Modal that asks the user to fill in template variables before inserting.
 */
export default function FillVariablesModal({
  isOpen,
  onClose,
  template,
  onInsert,
}) {
  const variables = extractVariables(template?.content || "");
  const [values, setValues] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    let result = template.content;
    for (const variable of variables) {
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, "g");
      result = result.replace(regex, values[variable] || "");
    }
    onInsert(result);
    setValues({});
    onClose();
  };

  // If no variables, just insert content directly
  if (variables.length === 0 && template) {
    return (
      <ModalWrapper isOpen={isOpen}>
        <div className="w-full max-w-md bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
          <div className="relative p-6 border-b rounded-t border-theme-modal-border">
            <h3 className="text-xl font-semibold text-white">
              Insert Template: {template.title}
            </h3>
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border border-transparent border"
            >
              <X size={24} weight="bold" className="text-white" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-sm text-theme-text-secondary mb-4">
              This template has no variables. It will be inserted as-is.
            </p>
            <pre className="text-xs text-theme-text-primary bg-theme-bg-primary p-3 rounded-lg whitespace-pre-wrap mb-4">
              {template.content}
            </pre>
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                type="button"
                className="transition-all duration-300 bg-transparent text-white hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onInsert(template.content);
                  onClose();
                }}
                type="button"
                className="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper isOpen={isOpen}>
      <div className="w-full max-w-md bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
        <div className="relative p-6 border-b rounded-t border-theme-modal-border">
          <h3 className="text-xl font-semibold text-white">
            {template?.title || "Fill Template Variables"}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border border-transparent border"
          >
            <X size={24} weight="bold" className="text-white" />
          </button>
        </div>
        <div
          className="h-full w-full overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="py-7 px-9 space-y-4">
              {variables.map((variable) => (
                <div key={variable}>
                  <label
                    htmlFor={`var-${variable}`}
                    className="block mb-2 text-sm font-medium text-white"
                  >
                    {`{{${variable}}}`}
                  </label>
                  <input
                    id={`var-${variable}`}
                    type="text"
                    placeholder={`Enter value for ${variable}`}
                    value={values[variable] || ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [variable]: e.target.value,
                      }))
                    }
                    autoComplete="off"
                    required={true}
                    className="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                  />
                </div>
              ))}
            </div>
            <div className="flex w-full justify-end items-center p-6 space-x-2 border-t border-theme-modal-border rounded-b">
              <button
                onClick={onClose}
                type="button"
                className="transition-all duration-300 bg-transparent text-white hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="transition-all duration-300 bg-white text-black hover:opacity-60 px-4 py-2 rounded-lg text-sm"
              >
                Insert
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalWrapper>
  );
}
