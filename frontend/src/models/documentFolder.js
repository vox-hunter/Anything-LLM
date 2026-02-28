import { API_BASE } from "@/utils/constants";
import { baseHeaders } from "@/utils/request";

const DocumentFolder = {
  list: async (workspaceSlug) => {
    return await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/document-folders`,
      {
        method: "GET",
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .then((data) => data.folders || [])
      .catch(() => []);
  },

  create: async (workspaceSlug, name, parentId = null) => {
    return await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/document-folders`,
      {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify({ name, parentId }),
      }
    )
      .then((res) => res.json())
      .catch((e) => ({ folder: null, error: e.message }));
  },

  update: async (workspaceSlug, folderId, data) => {
    return await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/document-folders/${folderId}`,
      {
        method: "PUT",
        headers: baseHeaders(),
        body: JSON.stringify(data),
      }
    )
      .then((res) => res.json())
      .catch((e) => ({ folder: null, error: e.message }));
  },

  delete: async (workspaceSlug, folderId) => {
    return await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/document-folders/${folderId}`,
      {
        method: "DELETE",
        headers: baseHeaders(),
      }
    )
      .then((res) => res.json())
      .catch((e) => ({ success: false, error: e.message }));
  },

  moveDocument: async (workspaceSlug, documentId, folderId) => {
    return await fetch(
      `${API_BASE}/workspace/${workspaceSlug}/document-folders/move-document`,
      {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify({ documentId, folderId }),
      }
    )
      .then((res) => res.json())
      .catch((e) => ({ success: false, error: e.message }));
  },
};

export default DocumentFolder;
