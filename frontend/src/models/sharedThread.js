import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const SharedThread = {
  /**
   * Create a share link for a thread.
   * @param {string} workspaceSlug
   * @param {string} threadSlug
   * @param {string|null} expiresAt - ISO date string or null
   * @returns {Promise<{share: object|null, error: string|null}>}
   */
  create: async function (workspaceSlug, threadSlug, expiresAt = null) {
    return await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/thread/${threadSlug}/share`,
      {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify({ expiresAt }),
      }
    )
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return { share: null, error: e.message };
      });
  },

  /**
   * List all share links for a thread.
   * @param {string} workspaceSlug
   * @param {string} threadSlug
   * @returns {Promise<Array>}
   */
  list: async function (workspaceSlug, threadSlug) {
    return await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/thread/${threadSlug}/shares`,
      {
        method: "GET",
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .then((res) => res?.shares || [])
      .catch((e) => {
        console.error(e);
        return [];
      });
  },

  /**
   * Delete a share link by ID.
   * @param {string} workspaceSlug
   * @param {string} threadSlug
   * @param {number} shareId
   * @returns {Promise<{success: boolean}>}
   */
  delete: async function (workspaceSlug, threadSlug, shareId) {
    return await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/thread/${threadSlug}/share/${shareId}`,
      {
        method: "DELETE",
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return { success: false };
      });
  },

  /**
   * Fetch the public shared thread data (no auth required).
   * @param {string} token
   * @returns {Promise<{thread: object|null, workspace: object|null, history: Array, expiresAt: string|null, error: string|null}>}
   */
  get: async function (token) {
    return await fetch(`${API_BASE}/shared-thread/${token}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
        return {
          thread: null,
          workspace: null,
          history: [],
          expiresAt: null,
          error: e.message,
        };
      });
  },
};

export default SharedThread;
