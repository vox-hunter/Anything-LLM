const prisma = require("../utils/prisma");

const VALID_REACTIONS = [
  "helpful",
  "inaccurate",
  "needs_more_detail",
  "perfect",
];

const MessageReaction = {
  validReactions: VALID_REACTIONS,

  create: async function ({ chatId, userId = null, reaction }) {
    if (!VALID_REACTIONS.includes(reaction)) return null;
    try {
      const existing = await prisma.message_reactions.findFirst({
        where: { chatId: Number(chatId), userId, reaction },
      });
      if (existing) return existing;

      const record = await prisma.message_reactions.create({
        data: {
          chatId: Number(chatId),
          userId,
          reaction,
        },
      });
      return record;
    } catch (error) {
      console.error("MessageReaction.create", error.message);
      return null;
    }
  },

  remove: async function ({ chatId, userId = null, reaction }) {
    try {
      await prisma.message_reactions.deleteMany({
        where: { chatId: Number(chatId), userId, reaction },
      });
      return true;
    } catch (error) {
      console.error("MessageReaction.remove", error.message);
      return false;
    }
  },

  reactionsForChat: async function (chatId) {
    try {
      const reactions = await prisma.message_reactions.findMany({
        where: { chatId: Number(chatId) },
      });
      return reactions;
    } catch (error) {
      console.error("MessageReaction.reactionsForChat", error.message);
      return [];
    }
  },

  /**
   * Aggregates reaction counts grouped by workspace.
   * Joins with workspace_chats to resolve workspace info.
   */
  aggregateByWorkspace: async function () {
    try {
      const results = await prisma.$queryRaw`
        SELECT
          wc."workspaceId" as workspaceId,
          mr."reaction" as reaction,
          COUNT(mr."id") as count
        FROM message_reactions mr
        JOIN workspace_chats wc ON mr."chatId" = wc."id"
        GROUP BY wc."workspaceId", mr."reaction"
        ORDER BY wc."workspaceId", COUNT(mr."id") DESC
      `;

      const grouped = {};
      for (const row of results) {
        const wsId = row.workspaceId;
        if (!grouped[wsId]) grouped[wsId] = {};
        grouped[wsId][row.reaction] = Number(row.count);
      }
      return grouped;
    } catch (error) {
      console.error("MessageReaction.aggregateByWorkspace", error.message);
      return {};
    }
  },
};

module.exports = { MessageReaction };
