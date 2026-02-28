const { Bookmark } = require("../models/bookmark");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { multiUserMode, userFromSession } = require("../utils/http");

function bookmarkEndpoints(app) {
  if (!app) return;

  app.post(
    "/bookmark",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const { chatId } = request.body;
        if (!chatId) {
          response.status(400).json({ error: "chatId is required" });
          return;
        }
        const { bookmark, message } = await Bookmark.create({
          chatId: Number(chatId),
          userId: user?.id || null,
        });
        response.status(200).json({ bookmark, error: message });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/bookmarks",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const user = await userFromSession(request, response);
        const bookmarks = await Bookmark.forUser(user?.id || null);
        response.status(200).json({ bookmarks });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.delete(
    "/bookmark/:id",
    [validatedRequest, flexUserRoleValid([ROLES.all])],
    async (request, response) => {
      try {
        const { id } = request.params;
        const user = await userFromSession(request, response);
        await Bookmark.delete({
          id: Number(id),
          user_id: user?.id || null,
        });
        response.status(200).json({ success: true });
      } catch (e) {
        console.error(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );
}

module.exports = { bookmarkEndpoints };
