const { SharedThread } = require("../models/sharedThread");
const { WorkspaceThread } = require("../models/workspaceThread");
const { WorkspaceChats } = require("../models/workspaceChats");
const { Workspace } = require("../models/workspace");
const { convertToChatHistory } = require("../utils/helpers/chat/responses");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const {
  validWorkspaceAndThreadSlug,
} = require("../utils/middleware/validWorkspace");
const { reqBody } = require("../utils/http");

function sharedThreadEndpoints(app) {
  if (!app) return;

  // Public endpoint — no auth required
  // GET /api/shared-thread/:token
  app.get("/shared-thread/:token", async (request, response) => {
    try {
      const { token } = request.params;
      const share = await SharedThread.valid(token);
      if (!share) {
        return response
          .status(404)
          .json({ error: "Share link not found or has expired." });
      }

      const thread = await WorkspaceThread.get({ id: share.threadId });
      if (!thread) {
        return response.status(404).json({ error: "Thread not found." });
      }

      const workspace = await Workspace.get({ id: thread.workspace_id });
      if (!workspace) {
        return response.status(404).json({ error: "Workspace not found." });
      }

      const chats = await WorkspaceChats.where(
        {
          workspaceId: workspace.id,
          thread_id: thread.id,
          include: true,
        },
        null,
        { id: "asc" }
      );

      return response.status(200).json({
        thread: { name: thread.name, slug: thread.slug },
        workspace: { name: workspace.name },
        history: convertToChatHistory(chats),
        expiresAt: share.expiresAt,
      });
    } catch (e) {
      console.error(e.message, e);
      response.sendStatus(500).end();
    }
  });

  // Authenticated endpoint — create a share link for a thread
  // POST /api/workspace/:slug/thread/:threadSlug/share
  app.post(
    "/workspace/:slug/thread/:threadSlug/share",
    [
      validatedRequest,
      flexUserRoleValid([ROLES.all]),
      validWorkspaceAndThreadSlug,
    ],
    async (request, response) => {
      try {
        const thread = response.locals.thread;
        const { expiresAt = null } = reqBody(request);

        const { share, error } = await SharedThread.create(
          thread.id,
          expiresAt
        );
        if (error) {
          return response.status(500).json({ share: null, error });
        }
        return response.status(200).json({ share, error: null });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  // Authenticated endpoint — list share links for a thread
  // GET /api/workspace/:slug/thread/:threadSlug/shares
  app.get(
    "/workspace/:slug/thread/:threadSlug/shares",
    [
      validatedRequest,
      flexUserRoleValid([ROLES.all]),
      validWorkspaceAndThreadSlug,
    ],
    async (request, response) => {
      try {
        const thread = response.locals.thread;
        const shares = await SharedThread.where({ threadId: thread.id });
        return response.status(200).json({ shares });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  // Authenticated endpoint — delete a share link
  // DELETE /api/workspace/:slug/thread/:threadSlug/share/:shareId
  app.delete(
    "/workspace/:slug/thread/:threadSlug/share/:shareId",
    [
      validatedRequest,
      flexUserRoleValid([ROLES.all]),
      validWorkspaceAndThreadSlug,
    ],
    async (request, response) => {
      try {
        const thread = response.locals.thread;
        const { shareId } = request.params;
        await SharedThread.delete({
          id: Number(shareId),
          threadId: thread.id,
        });
        return response.status(200).json({ success: true });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );
}

module.exports = { sharedThreadEndpoints };
