import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const CustomTheme = {
  getAll: async function () {
    return fetch(`${API_BASE}/custom-themes`, {
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res?.themes || [])
      .catch(() => []);
  },

  create: async function (data = {}) {
    return fetch(`${API_BASE}/custom-themes`, {
      method: "POST",
      headers: {
        ...baseHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((e) => ({ theme: null, error: e.message }));
  },

  update: async function (id, data = {}) {
    return fetch(`${API_BASE}/custom-themes/${id}`, {
      method: "PUT",
      headers: {
        ...baseHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((e) => ({ theme: null, error: e.message }));
  },

  delete: async function (id) {
    return fetch(`${API_BASE}/custom-themes/${id}`, {
      method: "DELETE",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .catch((e) => ({ success: false, error: e.message }));
  },
};

export default CustomTheme;
