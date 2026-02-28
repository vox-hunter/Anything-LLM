const prisma = require("../utils/prisma");

const Notification = {
  // Supported type values
  TYPES: {
    INFO: "info",
    WARNING: "warning",
    ERROR: "error",
    SUCCESS: "success",
  },

  // Supported status values
  STATUS: {
    READ: "read",
    UNREAD: "unread",
  },

  /**
   * Create a new notification.
   * @param {string} type
   * @param {string} message
   * @param {number|null} userId
   * @returns {Promise<{notification: object|null, message: string|null}>}
   */
  create: async function (type = "info", message = "", userId = null) {
    try {
      const notification = await prisma.notifications.create({
        data: {
          type,
          message,
          status: "unread",
          userId: userId ? Number(userId) : null,
        },
      });
      return { notification, message: null };
    } catch (error) {
      console.error("[Notification.create]", error.message);
      return { notification: null, message: error.message };
    }
  },

  /**
   * Get notifications for a user (and system-wide notifications).
   * In single-user mode pass userId as null to get only system-wide notifications.
   * @param {number|null} userId
   * @param {number} limit
   * @returns {Promise<object[]>}
   */
  getForUser: async function (userId = null, limit = 20) {
    try {
      const where = userId
        ? { OR: [{ userId: Number(userId) }, { userId: null }] }
        : { userId: null };
      const notifications = await prisma.notifications.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return notifications;
    } catch (error) {
      console.error("[Notification.getForUser]", error.message);
      return [];
    }
  },

  /**
   * Count unread notifications for a user.
   * @param {number|null} userId
   * @returns {Promise<number>}
   */
  unreadCount: async function (userId = null) {
    try {
      const where = userId
        ? {
            status: "unread",
            OR: [{ userId: Number(userId) }, { userId: null }],
          }
        : { status: "unread", userId: null };
      return await prisma.notifications.count({ where });
    } catch (error) {
      console.error("[Notification.unreadCount]", error.message);
      return 0;
    }
  },

  /**
   * Mark a single notification as read.
   * @param {number} id
   * @param {number|null} userId
   * @returns {Promise<boolean>}
   */
  markRead: async function (id, userId = null) {
    try {
      const where = { id: Number(id) };
      if (userId) where.userId = Number(userId);
      await prisma.notifications.updateMany({
        where,
        data: { status: "read", lastUpdatedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error("[Notification.markRead]", error.message);
      return false;
    }
  },

  /**
   * Mark all notifications as read for a user.
   * @param {number|null} userId
   * @returns {Promise<boolean>}
   */
  markAllRead: async function (userId = null) {
    try {
      const where = userId
        ? {
            status: "unread",
            OR: [{ userId: Number(userId) }, { userId: null }],
          }
        : { status: "unread" };
      await prisma.notifications.updateMany({
        where,
        data: { status: "read", lastUpdatedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error("[Notification.markAllRead]", error.message);
      return false;
    }
  },
};

module.exports = { Notification };
