const { validatedRequest } = require("../utils/middleware/validatedRequest");
const { Notification } = require("../models/notifications");
const { reqBody } = require("../utils/http");

function notificationEndpoints(app) {
  if (!app) return;

  /**
   * GET /api/notifications
   * Returns recent notifications and the unread count for the current user.
   */
  app.get("/notifications", [validatedRequest], async (request, response) => {
    try {
      const userId = response.locals?.user?.id ?? null;
      const notifications = await Notification.getForUser(userId, 20);
      const unreadCount = await Notification.unreadCount(userId);
      response.status(200).json({ notifications, unreadCount });
    } catch (error) {
      console.error("[GET /notifications]", error.message);
      response.status(500).json({ error: error.message });
    }
  });

  /**
   * PUT /api/notifications/:id/read
   * Mark a single notification as read.
   */
  app.put(
    "/notifications/:id/read",
    [validatedRequest],
    async (request, response) => {
      try {
        const { id } = request.params;
        const userId = response.locals?.user?.id ?? null;
        const success = await Notification.markRead(id, userId);
        response.status(200).json({ success });
      } catch (error) {
        console.error("[PUT /notifications/:id/read]", error.message);
        response.status(500).json({ error: error.message });
      }
    }
  );

  /**
   * POST /api/notifications/dismiss-all
   * Mark all notifications as read for the current user.
   */
  app.post(
    "/notifications/dismiss-all",
    [validatedRequest],
    async (request, response) => {
      try {
        const userId = response.locals?.user?.id ?? null;
        const success = await Notification.markAllRead(userId);
        response.status(200).json({ success });
      } catch (error) {
        console.error("[POST /notifications/dismiss-all]", error.message);
        response.status(500).json({ error: error.message });
      }
    }
  );

  /**
   * POST /api/notifications
   * Create a new notification (admin-only or system use).
   */
  app.post("/notifications", [validatedRequest], async (request, response) => {
    try {
      const { type, message, userId } = reqBody(request);
      if (!message) {
        return response.status(400).json({ error: "message is required" });
      }
      const { notification, message: errMsg } = await Notification.create(
        type || "info",
        message,
        userId ?? null
      );
      if (errMsg)
        return response.status(500).json({ error: errMsg });
      response.status(201).json({ notification });
    } catch (error) {
      console.error("[POST /notifications]", error.message);
      response.status(500).json({ error: error.message });
    }
  });
}

module.exports = { notificationEndpoints };
