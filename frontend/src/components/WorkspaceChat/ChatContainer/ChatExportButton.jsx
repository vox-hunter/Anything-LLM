import { useState, useRef, useEffect } from "react";
import { Download, CaretDown } from "@phosphor-icons/react";
import {
  exportAsMarkdown,
  exportAsPlainText,
  exportAsPDF,
} from "@/utils/chatExport";
import showToast from "@/utils/toast";

const exportOptions = {
  markdown: { name: "Markdown (.md)" },
  plaintext: { name: "Plain Text (.txt)" },
  pdf: { name: "PDF (.pdf)" },
};

export default function ChatExportButton({ history, workspace }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setShowMenu(false);
    try {
      if (format === "markdown") {
        exportAsMarkdown(history, workspace);
      } else if (format === "plaintext") {
        exportAsPlainText(history, workspace);
      } else if (format === "pdf") {
        await exportAsPDF(history, workspace);
      }
      showToast("Chat exported successfully.", "success");
    } catch (e) {
      console.error("Export failed:", e);
      showToast("Failed to export chat.", "error");
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-x-1 px-3 py-1 rounded-lg bg-theme-sidebar-footer-icon hover:bg-theme-sidebar-footer-icon-hover text-white text-xs font-medium h-[30px]"
        aria-label="Export chat"
      >
        <Download size={16} weight="bold" />
        Export
        <CaretDown size={14} weight="bold" />
      </button>
      <div
        ref={menuRef}
        className={`${
          showMenu ? "slide-down" : "slide-up hidden"
        } z-20 w-fit rounded-lg absolute top-full right-0 bg-secondary light:bg-theme-bg-secondary mt-2 shadow-md`}
      >
        <div className="py-2">
          {Object.entries(exportOptions).map(([key, data]) => (
            <button
              key={key}
              onClick={() => handleExport(key)}
              className="w-full text-left px-4 py-2 text-white text-sm hover:bg-[#3D4147] light:hover:bg-theme-sidebar-item-hover whitespace-nowrap"
            >
              {data.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
