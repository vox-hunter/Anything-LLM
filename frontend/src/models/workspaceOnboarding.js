import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const WorkspaceOnboarding = {
  getOnboarding: async function (slug) {
    return fetch(`${API_BASE}/workspace/${slug}/onboarding`, {
      method: "GET",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res.onboarding || null)
      .catch(() => null);
  },

  completeStep: async function (slug, step) {
    return fetch(`${API_BASE}/workspace/${slug}/onboarding/complete-step`, {
      method: "POST",
      body: JSON.stringify({ step }),
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res.onboarding || null)
      .catch(() => null);
  },

  skip: async function (slug) {
    return fetch(`${API_BASE}/workspace/${slug}/onboarding/skip`, {
      method: "POST",
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res.onboarding || null)
      .catch(() => null);
  },
};

export default WorkspaceOnboarding;
