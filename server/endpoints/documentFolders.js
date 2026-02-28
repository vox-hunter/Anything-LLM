const { DocumentFolder } = require("../models/documentFolders");
const { Document } = require("../models/documents");
const { Workspace } = require("../models/workspace");
const { reqBody } = require("../utils/http");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { validatedRequest } = require("../utils/middleware/validatedRequest");

function documentFolderEndpoints(app) {
  if (!app) return;

  app.get(
    "/workspace/:slug/document-folders",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const { slug } = request.params;
        const workspace = await Workspace.get({ slug });
        if (!workspace) {
          return response.status(404).json({ error: "Workspace not found" });
        }
        const tree = await DocumentFolder.treeForWorkspace(workspace.id);
        response.status(200).json({ folders: tree });
      } catch (e) {
        console.error(e);
        response.status(500).json({ error: "Failed to get folders" });
      }
    }
  );

  app.post(
    "/workspace/:slug/document-folders",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { slug } = request.params;
        const { name, parentId = null } = reqBody(request);
        if (!name || typeof name !== "string" || name.trim().length === 0) {
          return response.status(400).json({ error: "Folder name is required" });
        }

        const workspace = await Workspace.get({ slug });
        if (!workspace) {
          return response.status(404).json({ error: "Workspace not found" });
        }

        if (parentId !== null) {
          const parent = await DocumentFolder.get({
            id: parentId,
            workspaceId: workspace.id,
          });
          if (!parent) {
            return response
              .status(400)
              .json({ error: "Parent folder not found" });
          }
        }

        const { folder, error } = await DocumentFolder.create({
          name: name.trim(),
          workspaceId: workspace.id,
          parentId,
        });

        if (error) {
          return response
            .status(500)
            .json({ error: `Failed to create folder: ${error}` });
        }
        response.status(200).json({ folder });
      } catch (e) {
        console.error(e);
        response.status(500).json({ error: "Failed to create folder" });
      }
    }
  );

  app.put(
    "/workspace/:slug/document-folders/:folderId",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { slug } = request.params;
        const folderId = parseInt(request.params.folderId, 10);
        const data = reqBody(request);

        const workspace = await Workspace.get({ slug });
        if (!workspace) {
          return response.status(404).json({ error: "Workspace not found" });
        }

        const existing = await DocumentFolder.get({
          id: folderId,
          workspaceId: workspace.id,
        });
        if (!existing) {
          return response.status(404).json({ error: "Folder not found" });
        }

        const { folder, error } = await DocumentFolder.update(folderId, data);
        if (error) {
          return response
            .status(500)
            .json({ error: `Failed to update folder: ${error}` });
        }
        response.status(200).json({ folder });
      } catch (e) {
        console.error(e);
        response.status(500).json({ error: "Failed to update folder" });
      }
    }
  );

  app.delete(
    "/workspace/:slug/document-folders/:folderId",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { slug } = request.params;
        const folderId = parseInt(request.params.folderId, 10);

        const workspace = await Workspace.get({ slug });
        if (!workspace) {
          return response.status(404).json({ error: "Workspace not found" });
        }

        const existing = await DocumentFolder.get({
          id: folderId,
          workspaceId: workspace.id,
        });
        if (!existing) {
          return response.status(404).json({ error: "Folder not found" });
        }

        const success = await DocumentFolder.delete(folderId);
        if (!success) {
          return response
            .status(500)
            .json({ error: "Failed to delete folder" });
        }
        response.status(200).json({ success: true });
      } catch (e) {
        console.error(e);
        response.status(500).json({ error: "Failed to delete folder" });
      }
    }
  );

  app.post(
    "/workspace/:slug/document-folders/move-document",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const { slug } = request.params;
        const { documentId, folderId } = reqBody(request);

        if (!documentId) {
          return response
            .status(400)
            .json({ error: "documentId is required" });
        }

        const workspace = await Workspace.get({ slug });
        if (!workspace) {
          return response.status(404).json({ error: "Workspace not found" });
        }

        const document = await Document.get({
          id: documentId,
          workspaceId: workspace.id,
        });
        if (!document) {
          return response.status(404).json({ error: "Document not found" });
        }

        if (folderId !== null && folderId !== undefined) {
          const folder = await DocumentFolder.get({
            id: folderId,
            workspaceId: workspace.id,
          });
          if (!folder) {
            return response
              .status(400)
              .json({ error: "Target folder not found" });
          }
        }

        const success = await DocumentFolder.moveDocumentToFolder(
          documentId,
          folderId ?? null
        );
        if (!success) {
          return response
            .status(500)
            .json({ error: "Failed to move document" });
        }
        response.status(200).json({ success: true });
      } catch (e) {
        console.error(e);
        response.status(500).json({ error: "Failed to move document" });
      }
    }
  );
}

module.exports = { documentFolderEndpoints };
