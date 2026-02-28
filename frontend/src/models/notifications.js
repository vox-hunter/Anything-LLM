import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const Notifications = {
  /**
   * Fetch recent notifications and unread count.
   * @returns {Promise<{notifications: Array, unreadCount: number}>}
   */
  getAll: async function () {
    return fetch(`${API_BASE}/notifications`, {
      headers: baseHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch notifications.");
        return res.json();
      })
      .catch(() => ({ notifications: [], unreadCount: 0 }));
  },

  /**
   * Mark a single notification as read.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  markRead: async function (id) {
    return fetch(`${API_BASE}/notifications/${id}/read`, {
      method: "PUT",
      headers: baseHeaders(),
    })
      .then((res) => res.ok)
      .catch(() => false);
  },

  /**
   * Mark all notifications as read.
   * @returns {Promise<boolean>}
   */
  dismissAll: async function () {
    return fetch(`${API_BASE}/notifications/dismiss-all`, {
      method: "POST",
      headers: baseHeaders(),
    })
      .then((res) => res.ok)
      .catch(() => false);
  },
};

export default Notifications;
