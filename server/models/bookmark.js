const prisma = require("../utils/prisma");

const Bookmark = {
  create: async function ({ chatId, userId = null }) {
    try {
      // Check if a bookmark already exists for this chat and user
      const existing = await prisma.bookmarks.findFirst({
        where: {
          chat_id: Number(chatId),
          user_id: userId ? Number(userId) : null,
        },
      });
      if (existing) return { bookmark: existing, message: null };

      const bookmark = await prisma.bookmarks.create({
        data: {
          chat_id: Number(chatId),
          user_id: userId ? Number(userId) : null,
        },
      });
      return { bookmark, message: null };
    } catch (error) {
      console.error(error.message);
      return { bookmark: null, message: error.message };
    }
  },

  get: async function (clause = {}) {
    try {
      const bookmark = await prisma.bookmarks.findFirst({
        where: clause,
      });
      return bookmark || null;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  },

  where: async function (clause = {}, orderBy = null) {
    try {
      const bookmarks = await prisma.bookmarks.findMany({
        where: clause,
        ...(orderBy !== null ? { orderBy } : { orderBy: { id: "desc" } }),
      });
      return bookmarks;
    } catch (error) {
      console.error(error.message);
      return [];
    }
  },

  /**
   * Get all bookmarks for a user with associated chat data and workspace info.
   */
  whereWithData: async function (clause = {}) {
    const { WorkspaceChats } = require("./workspaceChats");
    const { Workspace } = require("./workspace");

    try {
      const bookmarks = await this.where(clause);
      const results = [];

      for (const bookmark of bookmarks) {
        const chat = await WorkspaceChats.get({ id: bookmark.chat_id });
        if (!chat) continue;

        const workspace = await Workspace.get({ id: chat.workspaceId });
        results.push({
          ...bookmark,
          chat: {
            id: chat.id,
            prompt: chat.prompt,
            response: chat.response,
            workspaceId: chat.workspaceId,
            thread_id: chat.thread_id,
            createdAt: chat.createdAt,
          },
          workspace: workspace
            ? { name: workspace.name, slug: workspace.slug }
            : { name: "deleted workspace", slug: null },
        });
      }

      return results;
    } catch (error) {
      console.error(error.message);
      return [];
    }
  },

  delete: async function (clause = {}) {
    try {
      await prisma.bookmarks.deleteMany({
        where: clause,
      });
      return true;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  },

  forUser: async function (userId = null) {
    try {
      return await this.whereWithData({
        user_id: userId ? Number(userId) : null,
      });
    } catch (error) {
      console.error(error.message);
      return [];
    }
  },
};

module.exports = { Bookmark };
