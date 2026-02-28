import React, { useEffect, useState } from "react";
import { BookmarkSimple, X, Trash } from "@phosphor-icons/react";
import Bookmark from "@/models/bookmark";
import { safeJsonParse } from "@/utils/request";
import paths from "@/utils/paths";
import { Link } from "react-router-dom";
import truncate from "truncate";

export default function BookmarksPanel({ onClose }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  async function fetchBookmarks() {
    setLoading(true);
    const data = await Bookmark.getAll();
    setBookmarks(data);
    setLoading(false);
  }

  async function removeBookmark(bookmarkId) {
    await Bookmark.delete(bookmarkId);
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
  }

  function getMessagePreview(bookmark) {
    const { chat } = bookmark;
    if (!chat) return "Unknown message";
    // response is stored as JSON string in the DB
    const parsed = safeJsonParse(chat.response, null);
    const responseText = parsed?.text || chat.prompt || "";
    return truncate(responseText, 100);
  }

  function getWorkspaceLink(bookmark) {
    const { workspace, chat } = bookmark;
    if (!workspace?.slug) return null;
    if (chat?.thread_id) {
      // We don't have the thread slug readily available, so link to workspace
      return paths.workspace.chat(workspace.slug);
    }
    return paths.workspace.chat(workspace.slug);
  }

  return (
    <div className="fixed inset-0 z-99 flex justify-end">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[350px] max-w-full h-full bg-theme-bg-sidebar border-l border-theme-sidebar-border overflow-y-auto animate-slideInFromRight">
        <div className="flex items-center justify-between p-4 border-b border-theme-sidebar-border">
          <div className="flex items-center gap-x-2">
            <BookmarkSimple
              size={20}
              weight="fill"
              className="text-theme-text-primary"
            />
            <h3 className="text-theme-text-primary font-semibold text-lg">
              Bookmarks
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-theme-text-secondary hover:text-theme-text-primary transition-colors"
            aria-label="Close bookmarks panel"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <p className="text-theme-text-secondary text-sm">Loading...</p>
          ) : bookmarks.length === 0 ? (
            <p className="text-theme-text-secondary text-sm">
              No bookmarks yet. Click the bookmark icon on any chat message to
              save it here.
            </p>
          ) : (
            <div className="flex flex-col gap-y-2">
              {bookmarks.map((bookmark) => {
                const link = getWorkspaceLink(bookmark);
                return (
                  <div
                    key={bookmark.id}
                    className="p-3 rounded-lg bg-theme-bg-primary border border-theme-sidebar-border hover:border-theme-text-secondary transition-colors"
                  >
                    <div className="flex justify-between items-start gap-x-2">
                      <div className="flex-1 min-w-0">
                        {link ? (
                          <Link
                            to={link}
                            onClick={onClose}
                            className="text-theme-text-primary text-sm hover:underline block truncate"
                          >
                            {getMessagePreview(bookmark)}
                          </Link>
                        ) : (
                          <span className="text-theme-text-primary text-sm block truncate">
                            {getMessagePreview(bookmark)}
                          </span>
                        )}
                        <p className="text-theme-text-secondary text-xs mt-1">
                          {bookmark.workspace?.name || "Unknown workspace"}
                        </p>
                      </div>
                      <button
                        onClick={() => removeBookmark(bookmark.id)}
                        className="text-theme-text-secondary hover:text-red-500 transition-colors flex-shrink-0"
                        aria-label="Remove bookmark"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
