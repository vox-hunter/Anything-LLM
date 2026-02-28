const prisma = require("../utils/prisma");

const DocumentFolder = {
  writable: ["name", "parentId"],

  create: async function ({ name, workspaceId, parentId = null }) {
    try {
      const folder = await prisma.document_folders.create({
        data: { name, workspaceId, parentId },
      });
      return { folder, error: null };
    } catch (error) {
      console.error("DocumentFolder.create", error.message);
      return { folder: null, error: error.message };
    }
  },

  get: async function (clause = {}) {
    try {
      const folder = await prisma.document_folders.findFirst({
        where: clause,
      });
      return folder || null;
    } catch (error) {
      console.error("DocumentFolder.get", error.message);
      return null;
    }
  },

  where: async function (clause = {}, orderBy = null) {
    try {
      const folders = await prisma.document_folders.findMany({
        where: clause,
        ...(orderBy !== null ? { orderBy } : {}),
      });
      return folders;
    } catch (error) {
      console.error("DocumentFolder.where", error.message);
      return [];
    }
  },

  update: async function (id, data = {}) {
    if (!id) throw new Error("No folder id provided for update");

    const validKeys = Object.keys(data).filter((key) =>
      this.writable.includes(key)
    );
    if (validKeys.length === 0)
      return { folder: { id }, message: "No valid fields to update!" };

    const validData = {};
    for (const key of validKeys) validData[key] = data[key];

    try {
      const folder = await prisma.document_folders.update({
        where: { id },
        data: validData,
      });
      return { folder, error: null };
    } catch (error) {
      console.error("DocumentFolder.update", error.message);
      return { folder: null, error: error.message };
    }
  },

  delete: async function (id) {
    try {
      // Set folderId to null for all documents in this folder
      await prisma.workspace_documents.updateMany({
        where: { folderId: id },
        data: { folderId: null },
      });
      // Move children folders up to this folder's parent
      const folder = await prisma.document_folders.findFirst({
        where: { id },
      });
      if (folder) {
        await prisma.document_folders.updateMany({
          where: { parentId: id },
          data: { parentId: folder.parentId },
        });
      }
      await prisma.document_folders.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error("DocumentFolder.delete", error.message);
      return false;
    }
  },

  /**
   * Build a folder tree for a workspace, including documents assigned to each folder.
   * @param {number} workspaceId
   * @returns {Promise<Array>} tree of folders with nested children and documents
   */
  treeForWorkspace: async function (workspaceId) {
    try {
      const folders = await prisma.document_folders.findMany({
        where: { workspaceId },
        include: { documents: true },
        orderBy: { name: "asc" },
      });

      const folderMap = {};
      for (const f of folders) {
        folderMap[f.id] = { ...f, children: [] };
      }

      const roots = [];
      for (const f of folders) {
        if (f.parentId && folderMap[f.parentId]) {
          folderMap[f.parentId].children.push(folderMap[f.id]);
        } else {
          roots.push(folderMap[f.id]);
        }
      }
      return roots;
    } catch (error) {
      console.error("DocumentFolder.treeForWorkspace", error.message);
      return [];
    }
  },

  moveDocumentToFolder: async function (documentId, folderId) {
    try {
      await prisma.workspace_documents.update({
        where: { id: documentId },
        data: { folderId: folderId },
      });
      return true;
    } catch (error) {
      console.error("DocumentFolder.moveDocumentToFolder", error.message);
      return false;
    }
  },
};

module.exports = { DocumentFolder };
