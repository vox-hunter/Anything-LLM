import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell, X, Check } from "@phosphor-icons/react";
import Notifications from "@/models/notifications";

const POLL_INTERVAL_MS = 30_000;

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

const TYPE_STYLES = {
  info: "bg-blue-500/20 text-blue-400",
  success: "bg-green-500/20 text-green-400",
  warning: "bg-yellow-500/20 text-yellow-400",
  error: "bg-red-500/20 text-red-400",
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    const data = await Notifications.getAll();
    setNotifications(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleMarkRead(id) {
    const notification = notifications.find((n) => n.id === id);
    const wasUnread = notification?.status === "unread";
    await Notifications.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
    );
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function handleDismissAll() {
    await Notifications.dismissAll();
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
    setUnreadCount(0);
  }

  return (
    <div className="relative flex w-fit" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="transition-all duration-300 p-2 rounded-full bg-theme-sidebar-footer-icon hover:bg-theme-sidebar-footer-icon-hover relative"
        aria-label="Notifications"
        data-tooltip-id="footer-item"
        data-tooltip-content="Notifications"
      >
        <Bell
          weight="fill"
          className="h-5 w-5 text-white light:text-slate-800"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 z-50 w-80 rounded-xl bg-theme-bg-sidebar border border-theme-sidebar-border shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-theme-sidebar-border">
            <span className="text-sm font-semibold text-white light:text-slate-800">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleDismissAll}
                className="flex items-center gap-1 text-xs text-theme-text-secondary hover:text-white transition-colors"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-theme-text-secondary">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-theme-sidebar-border last:border-b-0 transition-colors ${
                    n.status === "unread"
                      ? "bg-white/5 light:bg-slate-100"
                      : ""
                  }`}
                >
                  {/* Type badge */}
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                      TYPE_STYLES[n.type] ?? TYPE_STYLES.info
                    }`}
                  >
                    {n.type}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white light:text-slate-800 break-words">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-theme-text-secondary mt-0.5">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>

                  {/* Mark read button */}
                  {n.status === "unread" && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                      aria-label="Mark as read"
                    >
                      <X
                        size={12}
                        className="text-theme-text-secondary hover:text-white"
                      />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
