import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const Bookmark = {
  create: async function (chatId) {
    return await fetch(`${API_BASE}/bookmark`, {
      method: "POST",
      headers: { ...baseHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ chatId }),
    })
      .then((res) => res.json())
      .catch((e) => ({ bookmark: null, error: e.message }));
  },

  getAll: async function () {
    return await fetch(`${API_BASE}/bookmarks`, {
      method: "GET",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res.bookmarks || [])
      .catch(() => []);
  },

  delete: async function (bookmarkId) {
    return await fetch(`${API_BASE}/bookmark/${bookmarkId}`, {
      method: "DELETE",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .catch((e) => ({ success: false, error: e.message }));
  },

  isBookmarked: async function (chatId) {
    const bookmarks = await this.getAll();
    return bookmarks.some((b) => b.chat_id === Number(chatId));
  },
};

export default Bookmark;
