import { useEffect, useState } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { PlusCircle, Trash, PencilSimple } from "@phosphor-icons/react";
import System from "@/models/system";
import ModalWrapper from "@/components/ModalWrapper";
import { useModal } from "@/hooks/useModal";
import CTAButton from "@/components/lib/CTAButton";
import showToast from "@/utils/toast";

export default function PromptTemplates() {
  const {
    isOpen: isAddOpen,
    openModal: openAddModal,
    closeModal: closeAddModal,
  } = useModal();
  const {
    isOpen: isEditOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const fetchTemplates = async () => {
    const templates = await System.getPromptTemplates();
    setTemplates(templates);
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (templateId) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;
    const success = await System.deletePromptTemplate(templateId);
    if (success) {
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      showToast("Template deleted successfully", "success");
    } else {
      showToast("Failed to delete template", "error");
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    openEditModal();
  };

  const closeEditAndReset = () => {
    closeEditModal();
    setSelectedTemplate(null);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
      >
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[50px] md:py-6 py-16">
          <div className="w-full flex flex-col gap-y-1 pb-6 border-white/10 border-b-2">
            <div className="items-center flex gap-x-4">
              <p className="text-lg leading-6 font-bold text-theme-text-primary">
                Prompt Templates
              </p>
            </div>
            <p className="text-xs leading-[18px] font-base text-theme-text-secondary mt-2">
              Create and manage reusable prompt templates with variable
              placeholders like {"{{topic}}"} or {"{{language}}"}.
              Templates can be quickly inserted into chat using the /template
              slash command.
            </p>
          </div>
          <div className="w-full justify-end flex">
            <CTAButton
              onClick={openAddModal}
              className="mt-3 mr-0 mb-4 md:-mb-14 z-10"
            >
              <PlusCircle className="h-4 w-4" weight="bold" /> Create Template
            </CTAButton>
          </div>
          <div className="overflow-x-auto mt-6">
            {loading ? (
              <Skeleton.default
                height="80vh"
                width="100%"
                highlightColor="var(--theme-bg-primary)"
                baseColor="var(--theme-bg-secondary)"
                count={1}
                className="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm"
                containerClassName="flex w-full"
              />
            ) : (
              <table className="w-full text-xs text-left rounded-lg min-w-[640px] border-spacing-0">
                <thead className="text-theme-text-secondary text-xs leading-[18px] font-bold uppercase border-white/10 border-b">
                  <tr>
                    <th scope="col" className="px-6 py-3 rounded-tl-lg">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Variables
                    </th>
                    <th scope="col" className="px-6 py-3 rounded-tr-lg">
                      {" "}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.length === 0 ? (
                    <tr className="bg-transparent text-theme-text-secondary text-sm font-medium">
                      <td colSpan="4" className="px-6 py-4 text-center">
                        No prompt templates found. Create one to get started.
                      </td>
                    </tr>
                  ) : (
                    templates.map((template) => (
                      <TemplateRow
                        key={template.id}
                        template={template}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <ModalWrapper isOpen={isAddOpen}>
          <AddTemplateModal
            closeModal={closeAddModal}
            onSuccess={fetchTemplates}
          />
        </ModalWrapper>
        <ModalWrapper isOpen={isEditOpen}>
          {selectedTemplate && (
            <EditTemplateModal
              closeModal={closeEditAndReset}
              onSuccess={fetchTemplates}
              template={selectedTemplate}
            />
          )}
        </ModalWrapper>
      </div>
    </div>
  );
}

function extractVariables(content) {
  const matches = content.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "")))];
}

function TemplateRow({ template, onEdit, onDelete }) {
  const variables = extractVariables(template.content);
  return (
    <tr className="bg-transparent text-theme-text-secondary text-sm font-medium border-b border-white/10">
      <td className="px-6 py-4 font-semibold text-theme-text-primary">
        {template.title}
      </td>
      <td className="px-6 py-4">{template.description || "—"}</td>
      <td className="px-6 py-4">
        {variables.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {variables.map((v) => (
              <span
                key={v}
                className="px-2 py-0.5 rounded-full text-xs bg-theme-bg-primary text-theme-text-primary"
              >
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        ) : (
          "None"
        )}
      </td>
      <td className="px-6 py-4 flex items-center gap-x-4 justify-end">
        <button
          onClick={() => onEdit(template)}
          className="border-none text-theme-text-secondary hover:text-theme-text-primary transition-colors cursor-pointer bg-transparent"
        >
          <PencilSimple size={20} />
        </button>
        <button
          onClick={() => onDelete(template.id)}
          className="border-none text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent"
        >
          <Trash size={20} />
        </button>
      </td>
    </tr>
  );
}

function AddTemplateModal({ closeModal, onSuccess }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const { error } = await System.createPromptTemplate({
      title: form.get("title"),
      content: form.get("content"),
      description: form.get("description"),
    });
    if (error) {
      showToast(error, "error");
      return;
    }
    showToast("Template created successfully", "success");
    onSuccess();
    closeModal();
  };

  return (
    <TemplateFormModal
      title="Create Prompt Template"
      onClose={closeModal}
      onSubmit={handleSubmit}
    />
  );
}

function EditTemplateModal({ closeModal, onSuccess, template }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const { error } = await System.updatePromptTemplate(template.id, {
      title: form.get("title"),
      content: form.get("content"),
      description: form.get("description"),
    });
    if (error) {
      showToast(error, "error");
      return;
    }
    showToast("Template updated successfully", "success");
    onSuccess();
    closeModal();
  };

  return (
    <TemplateFormModal
      title="Edit Prompt Template"
      onClose={closeModal}
      onSubmit={handleSubmit}
      initialData={template}
    />
  );
}

function TemplateFormModal({
  title,
  onClose,
  onSubmit,
  initialData = {},
}) {
  return (
    <div className="w-full max-w-2xl bg-theme-bg-secondary rounded-lg shadow border-2 border-theme-modal-border overflow-hidden">
      <div className="relative p-6 border-b rounded-t border-theme-modal-border">
        <div className="w-full flex gap-x-2 items-center">
          <h3 className="text-xl font-semibold text-white overflow-hidden overflow-ellipsis whitespace-nowrap">
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 transition-all duration-300 bg-transparent rounded-lg text-sm p-1 inline-flex items-center hover:bg-theme-modal-border hover:border-theme-modal-border hover:border-opacity-50 border-transparent border"
        >
          <span className="text-white text-lg font-bold">✕</span>
        </button>
      </div>
      <div
        className="h-full w-full overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        <form onSubmit={onSubmit}>
          <div className="py-7 px-9 space-y-2 flex-col">
            <div className="w-full flex flex-col gap-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block mb-2 text-sm font-medium text-white"
                >
                  Template Title
                </label>
                <input
                  name="title"
                  type="text"
                  id="title"
                  placeholder="e.g., Code Review, Translation Helper"
                  defaultValue={initialData.title || ""}
                  maxLength={100}
                  autoComplete="off"
                  required={true}
                  className="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                />
              </div>
              <div>
                <label
                  htmlFor="content"
                  className="block mb-2 text-sm font-medium text-white"
                >
                  Template Content
                </label>
                <p className="text-xs text-theme-text-secondary mb-2">
                  Use {"{{variableName}}"} for placeholders that users will
                  fill in when using the template.
                </p>
                <textarea
                  name="content"
                  id="content"
                  autoComplete="off"
                  placeholder={
                    'e.g., Explain {{topic}} in {{language}} for a {{audience}} audience.'
                  }
                  defaultValue={initialData.content || ""}
                  required={true}
                  rows={5}
                  className="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-white"
                >
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  placeholder="Brief description of what this template does"
                  defaultValue={initialData.description || ""}
                  maxLength={200}
                  autoComplete="off"
                  className="border-none bg-theme-settings-input-bg w-full text-white placeholder:text-theme-settings-input-placeholder text-sm rounded-lg focus:outline-primary-button active:outline-primary-button outline-none block w-full p-2.5"
                />
              </div>
            </div>
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
