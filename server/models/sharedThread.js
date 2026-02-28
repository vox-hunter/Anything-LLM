const prisma = require("../utils/prisma");
const { v4: uuidv4 } = require("uuid");

const SharedThread = {
  /**
   * Create a new shared thread token for the given thread.
   * @param {number} threadId
   * @param {Date|null} expiresAt
   * @returns {Promise<{share: object|null, error: string|null}>}
   */
  create: async function (threadId, expiresAt = null) {
    try {
      const share = await prisma.shared_threads.create({
        data: {
          token: uuidv4(),
          threadId: Number(threadId),
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });
      return { share, error: null };
    } catch (error) {
      console.error(error.message);
      return { share: null, error: error.message };
    }
  },

  get: async function (clause = {}) {
    try {
      const share = await prisma.shared_threads.findFirst({ where: clause });
      return share || null;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  },

  delete: async function (clause = {}) {
    try {
      await prisma.shared_threads.deleteMany({ where: clause });
      return true;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  },

  where: async function (clause = {}) {
    try {
      return await prisma.shared_threads.findMany({ where: clause });
    } catch (error) {
      console.error(error.message);
      return [];
    }
  },

  /**
   * Check whether a share token is valid (exists and not expired).
   * @param {string} token
   * @returns {Promise<object|null>} the share record or null
   */
  valid: async function (token) {
    const share = await this.get({ token });
    if (!share) return null;
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) return null;
    return share;
  },
};

module.exports = { SharedThread };
