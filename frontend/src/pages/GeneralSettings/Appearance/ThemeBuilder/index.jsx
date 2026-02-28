import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/SettingsSidebar";
import { isMobile } from "react-device-detect";
import { useTranslation } from "react-i18next";
import CustomTheme from "@/models/customTheme";
import showToast from "@/utils/toast";
import {
  DownloadSimple,
  UploadSimple,
  FloppyDisk,
  Trash,
} from "@phosphor-icons/react";

const DEFAULT_COLORS = {
  "primary-color": "#46c8ff",
  "secondary-color": "#1b1b1e",
  "background": "#0e0f0f",
  "text": "#ffffff",
  "sidebar": "#0e0f0f",
  "accent": "#3d4147",
  "chat-bubble-user": "#27282a",
  "chat-bubble-assistant": "#1b1b1e",
};

const COLOR_LABELS = {
  "primary-color": { label: "Primary Color", description: "Buttons and links" },
  "secondary-color": { label: "Secondary Color", description: "Panel backgrounds" },
  "background": { label: "Background", description: "Main page background" },
  "text": { label: "Text", description: "Primary text color" },
  "sidebar": { label: "Sidebar", description: "Sidebar background" },
  "accent": { label: "Accent", description: "Highlights and accents" },
  "chat-bubble-user": { label: "User Chat Bubble", description: "User message bubble" },
  "chat-bubble-assistant": { label: "Assistant Chat Bubble", description: "Assistant message bubble" },
};

function ColorInput({ colorKey, value, onChange }) {
  const meta = COLOR_LABELS[colorKey] || { label: colorKey, description: "" };
  return (
    <div className="flex items-center justify-between gap-x-4 py-3 border-b border-white/10 last:border-b-0">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-white">{meta.label}</label>
        <p className="text-xs text-white/60">{meta.description}</p>
      </div>
      <div className="flex items-center gap-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(colorKey, e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(colorKey, e.target.value)}
          className="w-24 bg-theme-settings-input-bg text-white text-xs rounded-lg px-2 py-1.5 border-none outline-none focus:outline-primary-button"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function ThemePreview({ colors }) {
  return (
    <div
      className="rounded-lg border border-white/10 overflow-hidden"
      style={{ backgroundColor: colors["background"], minHeight: 280 }}
    >
      <div className="flex h-full" style={{ minHeight: 280 }}>
        {/* Sidebar preview */}
        <div
          className="w-1/4 p-3 flex flex-col gap-y-2"
          style={{ backgroundColor: colors["sidebar"] }}
        >
          <div
            className="w-full h-3 rounded"
            style={{ backgroundColor: colors["accent"], opacity: 0.6 }}
          />
          <div
            className="w-3/4 h-3 rounded"
            style={{ backgroundColor: colors["accent"], opacity: 0.4 }}
          />
          <div
            className="w-2/3 h-3 rounded"
            style={{ backgroundColor: colors["accent"], opacity: 0.3 }}
          />
        </div>
        {/* Main content preview */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: colors["text"] }}
            >
              Preview
            </p>
            <p className="text-xs" style={{ color: colors["text"], opacity: 0.6 }}>
              This is a preview of your custom theme.
            </p>
          </div>
          {/* Chat bubbles preview */}
          <div className="flex flex-col gap-y-2 mt-4">
            <div className="flex justify-end">
              <div
                className="rounded-lg px-3 py-2 text-xs max-w-[70%]"
                style={{
                  backgroundColor: colors["chat-bubble-user"],
                  color: colors["text"],
                }}
              >
                User message
              </div>
            </div>
            <div className="flex justify-start">
              <div
                className="rounded-lg px-3 py-2 text-xs max-w-[70%]"
                style={{
                  backgroundColor: colors["chat-bubble-assistant"],
                  color: colors["text"],
                }}
              >
                Assistant response
              </div>
            </div>
          </div>
          {/* Accent button */}
          <div className="mt-4 flex gap-x-2">
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: colors["primary-color"],
                color: colors["background"],
              }}
            >
              Primary Button
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                backgroundColor: colors["secondary-color"],
                color: colors["text"],
              }}
            >
              Secondary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThemeBuilder() {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [themeName, setThemeName] = useState("");
  const [colors, setColors] = useState({ ...DEFAULT_COLORS });
  const [savedThemes, setSavedThemes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemes();
  }, []);

  async function loadThemes() {
    setLoading(true);
    const themes = await CustomTheme.getAll();
    setSavedThemes(themes);
    setLoading(false);
  }

  function handleColorChange(key, value) {
    setColors((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!themeName.trim()) {
      showToast("Please enter a theme name.", "error");
      return;
    }

    if (editingId) {
      const { theme, error } = await CustomTheme.update(editingId, {
        name: themeName.trim(),
        colors,
      });
      if (error) {
        showToast(`Error: ${error}`, "error");
        return;
      }
      showToast("Theme updated successfully.", "success");
    } else {
      const { theme, error } = await CustomTheme.create({
        name: themeName.trim(),
        colors,
      });
      if (error) {
        showToast(`Error: ${error}`, "error");
        return;
      }
      showToast("Theme saved successfully.", "success");
    }

    setEditingId(null);
    setThemeName("");
    setColors({ ...DEFAULT_COLORS });
    await loadThemes();
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this theme?")) return;
    await CustomTheme.delete(id);
    showToast("Theme deleted.", "success");
    if (editingId === id) {
      setEditingId(null);
      setThemeName("");
      setColors({ ...DEFAULT_COLORS });
    }
    await loadThemes();
  }

  function handleEdit(theme) {
    setEditingId(theme.id);
    setThemeName(theme.name);
    setColors({ ...DEFAULT_COLORS, ...theme.colors });
  }

  function handleExport(theme) {
    const exportData = { name: theme.name, colors: theme.colors };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${theme.name.replace(/\s+/g, "-").toLowerCase()}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Theme exported.", "success");
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!data.name || !data.colors) {
          showToast("Invalid theme file format.", "error");
          return;
        }
        setThemeName(data.name);
        setColors({ ...DEFAULT_COLORS, ...data.colors });
        setEditingId(null);
        showToast("Theme imported. Click Save to persist.", "info");
      } catch {
        showToast("Failed to parse theme file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
      <Sidebar />
      <div
        style={{ height: isMobile ? "100%" : "calc(100% - 32px)" }}
        className="relative md:ml-[2px] md:mr-[16px] md:my-[16px] md:rounded-[16px] bg-theme-bg-secondary w-full h-full overflow-y-scroll p-4 md:p-0"
      >
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[86px] md:py-6 py-16">
          <div className="w-full flex flex-col gap-y-1 pb-6 border-white light:border-theme-sidebar-border border-b-2 border-opacity-10">
            <div className="items-center">
              <p className="text-lg leading-6 font-bold text-white">
                {t("customization.theme_builder.title", "Theme Builder")}
              </p>
            </div>
            <p className="text-xs leading-[18px] font-base text-white text-opacity-60">
              {t(
                "customization.theme_builder.description",
                "Create and manage custom color themes for your instance."
              )}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 mt-6">
            {/* Editor panel */}
            <div className="flex-1">
              <div className="flex items-center gap-x-3 mb-4">
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="Theme name"
                  className="flex-1 bg-theme-settings-input-bg text-white text-sm rounded-lg px-4 py-2 border-none outline-none focus:outline-primary-button"
                />
                <button
                  onClick={handleSave}
                  className="flex items-center gap-x-1.5 px-4 py-2 rounded-lg bg-primary-button text-xs font-medium text-white hover:opacity-80 transition-opacity"
                >
                  <FloppyDisk className="h-4 w-4" />
                  {editingId ? "Update" : "Save"}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-x-1.5 px-4 py-2 rounded-lg bg-theme-action-menu-bg text-xs font-medium text-white hover:opacity-80 transition-opacity"
                >
                  <UploadSimple className="h-4 w-4" />
                  Import
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>

              {/* Color editors */}
              <div className="bg-theme-bg-primary rounded-lg p-4">
                {Object.keys(DEFAULT_COLORS).map((key) => (
                  <ColorInput
                    key={key}
                    colorKey={key}
                    value={colors[key]}
                    onChange={handleColorChange}
                  />
                ))}
              </div>
            </div>

            {/* Preview + Saved Themes panel */}
            <div className="flex-1 flex flex-col gap-y-6">
              <div>
                <p className="text-sm font-semibold text-white mb-3">
                  Live Preview
                </p>
                <ThemePreview colors={colors} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-3">
                  Saved Themes
                </p>
                {loading ? (
                  <p className="text-xs text-white/60">Loading...</p>
                ) : savedThemes.length === 0 ? (
                  <p className="text-xs text-white/60">
                    No custom themes saved yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-y-2">
                    {savedThemes.map((theme) => (
                      <div
                        key={theme.id}
                        className="flex items-center justify-between bg-theme-bg-primary rounded-lg p-3"
                      >
                        <div className="flex items-center gap-x-3">
                          {/* Color swatches */}
                          <div className="flex gap-x-1">
                            {Object.values(theme.colors)
                              .slice(0, 5)
                              .map((c, i) => (
                                <div
                                  key={i}
                                  className="w-4 h-4 rounded-full border border-white/20"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                          </div>
                          <span className="text-sm text-white">
                            {theme.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-x-2">
                          <button
                            onClick={() => handleEdit(theme)}
                            className="text-xs text-white/60 hover:text-white transition-colors px-2 py-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleExport(theme)}
                            className="text-white/60 hover:text-white transition-colors p-1"
                            title="Export theme"
                          >
                            <DownloadSimple className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(theme.id)}
                            className="text-white/60 hover:text-red-400 transition-colors p-1"
                            title="Delete theme"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
