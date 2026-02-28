import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const StudySessionModel = {
  /**
   * Start a new study session for a workspace.
   * @param {string} slug - Workspace slug
   * @returns {Promise<{success: boolean, session: Object, response: Object, error: string|null}>}
   */
  start: async function (slug) {
    return fetch(`${API_BASE}/workspace/${slug}/study/start`, {
      method: "POST",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .catch((e) => ({
        success: false,
        session: null,
        response: null,
        error: e.message,
      }));
  },

  /**
   * Submit a student response in a study session.
   * @param {string} slug - Workspace slug
   * @param {Object} data - { session_id, component_id, student_input }
   * @returns {Promise<{success: boolean, session: Object, response: Object, error: string|null}>}
   */
  respond: async function (slug, data = {}) {
    return fetch(`${API_BASE}/workspace/${slug}/study/respond`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .catch((e) => ({
        success: false,
        session: null,
        response: null,
        error: e.message,
      }));
  },

  /**
   * Get an existing study session.
   * @param {string} slug - Workspace slug
   * @param {string} sessionId
   * @returns {Promise<{success: boolean, session: Object, error: string|null}>}
   */
  getSession: async function (slug, sessionId) {
    return fetch(
      `${API_BASE}/workspace/${slug}/study/session/${sessionId}`,
      {
        method: "GET",
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .catch((e) => ({
        success: false,
        session: null,
        error: e.message,
      }));
  },
};

export default StudySessionModel;
