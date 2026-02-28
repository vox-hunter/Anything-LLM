import { saveAs } from "file-saver";
import { userFromStorage } from "@/utils/request";

/**
 * Formats a Unix timestamp into a readable date/time string.
 * @param {number} sentAt - Unix timestamp
 * @returns {string} Formatted date string
 */
function formatTimestamp(sentAt) {
  if (!sentAt) return "";
  const date = new Date(sentAt * 1000);
  return date.toLocaleString();
}

/**
 * Returns a display name for the given role.
 * @param {string} role
 * @param {object} workspace
 * @returns {string}
 */
function displayName(role, workspace) {
  if (role === "user") {
    return userFromStorage()?.username || "You";
  }
  return workspace?.name || "Assistant";
}

/**
 * Formats citation sources into a readable string.
 * @param {Array} sources
 * @returns {string}
 */
function formatCitations(sources = []) {
  if (!sources.length) return "";
  const titles = [...new Set(sources.map((s) => s.title).filter(Boolean))];
  if (!titles.length) return "";
  return titles.map((t) => `- ${t}`).join("\n");
}

/**
 * Filters chat history to only exportable messages (user/assistant with content).
 * @param {Array} history
 * @returns {Array}
 */
function exportableMessages(history) {
  return history.filter(
    (msg) =>
      msg.content &&
      (msg.role === "user" || msg.role === "assistant") &&
      msg.type !== "statusResponse"
  );
}

/**
 * Export chat history as Markdown.
 * @param {Array} history - Chat history array
 * @param {object} workspace - Workspace object
 */
export function exportAsMarkdown(history, workspace) {
  const messages = exportableMessages(history);
  const lines = [`# Chat Export — ${workspace?.name || "Workspace"}`, ""];

  for (const msg of messages) {
    const name = displayName(msg.role, workspace);
    const time = formatTimestamp(msg.sentAt);
    lines.push(`### ${name}${time ? ` — _${time}_` : ""}`);
    lines.push("");
    lines.push(msg.content);
    lines.push("");

    if (msg.role === "assistant" && msg.sources?.length) {
      const citations = formatCitations(msg.sources);
      if (citations) {
        lines.push("**Citations:**");
        lines.push(citations);
        lines.push("");
      }
    }
    lines.push("---");
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  saveAs(blob, `chat-export-${Date.now()}.md`);
}

/**
 * Export chat history as plain text.
 * @param {Array} history - Chat history array
 * @param {object} workspace - Workspace object
 */
export function exportAsPlainText(history, workspace) {
  const messages = exportableMessages(history);
  const lines = [`Chat Export — ${workspace?.name || "Workspace"}`, ""];

  for (const msg of messages) {
    const name = displayName(msg.role, workspace);
    const time = formatTimestamp(msg.sentAt);
    lines.push(`[${name}]${time ? ` (${time})` : ""}`);
    lines.push(msg.content);

    if (msg.role === "assistant" && msg.sources?.length) {
      const citations = formatCitations(msg.sources);
      if (citations) {
        lines.push("");
        lines.push("Citations:");
        lines.push(citations);
      }
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  saveAs(blob, `chat-export-${Date.now()}.txt`);
}

/**
 * Export chat history as PDF.
 * @param {Array} history - Chat history array
 * @param {object} workspace - Workspace object
 */
export async function exportAsPDF(history, workspace) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const addPageIfNeeded = (requiredSpace = 10) => {
    if (y + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = 20;
    }
  };

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`Chat Export — ${workspace?.name || "Workspace"}`, margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const messages = exportableMessages(history);

  for (const msg of messages) {
    const name = displayName(msg.role, workspace);
    const time = formatTimestamp(msg.sentAt);

    // Speaker header
    addPageIfNeeded(20);
    doc.setFont("helvetica", "bold");
    const header = `${name}${time ? `  (${time})` : ""}`;
    doc.text(header, margin, y);
    y += 6;

    // Message body
    doc.setFont("helvetica", "normal");
    const bodyLines = doc.splitTextToSize(msg.content, maxWidth);
    for (const line of bodyLines) {
      addPageIfNeeded(6);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 2;

    // Citations
    if (msg.role === "assistant" && msg.sources?.length) {
      const titles = [
        ...new Set(msg.sources.map((s) => s.title).filter(Boolean)),
      ];
      if (titles.length) {
        addPageIfNeeded(10);
        doc.setFont("helvetica", "italic");
        doc.text("Citations:", margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        for (const title of titles) {
          addPageIfNeeded(6);
          const citLines = doc.splitTextToSize(`• ${title}`, maxWidth);
          for (const cl of citLines) {
            addPageIfNeeded(6);
            doc.text(cl, margin + 3, y);
            y += 5;
          }
        }
        y += 2;
      }
    }

    // Separator
    addPageIfNeeded(6);
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  }

  doc.save(`chat-export-${Date.now()}.pdf`);
}
