import { useState } from "react";
import { X, Copy, Check, ShareNetwork } from "@phosphor-icons/react";
import ModalWrapper from "@/components/ModalWrapper";
import SharedThreadModel from "@/models/sharedThread";
import paths from "@/utils/paths";
import showToast from "@/utils/toast";

/**
 * Modal to generate and display a shareable link for a thread.
 * @param {{workspace: object, thread: object, onClose: function}} props
 */
export default function ShareThreadModal({ workspace, thread, onClose }) {
  const [expiresIn, setExpiresIn] = useState("never");
  const [shareUrl, setShareUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const expiryOptions = [
    { label: "Never", value: "never" },
    { label: "1 day", value: "1d" },
    { label: "7 days", value: "7d" },
    { label: "30 days", value: "30d" },
  ];

  function computeExpiresAt(option) {
    if (option === "never") return null;
    const ms = { "1d": 86400000, "7d": 604800000, "30d": 2592000000 };
    return new Date(Date.now() + ms[option]).toISOString();
  }

  async function generateLink() {
    setLoading(true);
    const expiresAt = computeExpiresAt(expiresIn);
    const { share, error } = await SharedThreadModel.create(
      workspace.slug,
      thread.slug,
      expiresAt
    );
    setLoading(false);
    if (error || !share) {
      showToast(`Could not create share link: ${error}`, "error", {
        clear: true,
      });
      return;
    }
    const url = `${window.location.origin}${paths.sharedThread(share.token)}`;
    setShareUrl(url);
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Could not copy link to clipboard.", "error");
    }
  }

  return (
    <ModalWrapper isOpen={true}>
      <div className="bg-theme-bg-secondary text-theme-text-primary rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-theme-text-secondary hover:text-theme-text-primary"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-x-2 mb-4">
          <ShareNetwork size={22} className="text-blue-400" />
          <h2 className="text-lg font-semibold">Share Thread</h2>
        </div>

        <p className="text-sm text-theme-text-secondary mb-4">
          Generate a public link to share a read-only view of this conversation.
        </p>

        {/* Expiry selector */}
        {!shareUrl && (
          <>
            <label className="block text-sm font-medium mb-1">
              Link expiry
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full bg-theme-bg-container border border-theme-sidebar-border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {expiryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={loading}
              onClick={generateLink}
              className="w-full py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Generating…" : "Generate Link"}
            </button>
          </>
        )}

        {/* Share URL display */}
        {shareUrl && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Shareable link
            </label>
            <div className="flex items-center gap-x-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-theme-bg-container border border-theme-sidebar-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-2 rounded-lg bg-theme-bg-container border border-theme-sidebar-border hover:bg-blue-500/20 transition-colors"
                aria-label="Copy link"
              >
                {copied ? (
                  <Check size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} className="text-theme-text-secondary" />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setShareUrl(null);
                setCopied(false);
              }}
              className="mt-3 text-xs text-theme-text-secondary hover:text-theme-text-primary underline"
            >
              Generate another link
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
