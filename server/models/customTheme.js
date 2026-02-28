const prisma = require("../utils/prisma");

const CustomTheme = {
  tablename: "custom_themes",
  writable: ["name", "colors"],

  /**
   * The required color keys for a valid custom theme.
   */
  requiredColorKeys: [
    "primary-color",
    "secondary-color",
    "background",
    "text",
    "sidebar",
    "accent",
    "chat-bubble-user",
    "chat-bubble-assistant",
  ],

  /**
   * Validates that the colors object has all required keys and hex values.
   * @param {object} colors
   * @returns {boolean}
   */
  validateColors: function (colors) {
    if (!colors || typeof colors !== "object") return false;
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
    for (const key of this.requiredColorKeys) {
      if (!colors.hasOwnProperty(key)) return false;
      if (!hexRegex.test(colors[key])) return false;
    }
    return true;
  },

  create: async function ({ name, colors } = {}) {
    try {
      if (!name || !colors) throw new Error("Name and colors are required.");
      if (!this.validateColors(colors))
        throw new Error("Invalid color values.");

      const theme = await prisma.custom_themes.create({
        data: {
          name: String(name),
          colors: JSON.stringify(colors),
        },
      });
      return { theme: { ...theme, colors: JSON.parse(theme.colors) }, error: null };
    } catch (error) {
      console.error("FAILED TO CREATE CUSTOM THEME.", error.message);
      return { theme: null, error: error.message };
    }
  },

  get: async function (clause = {}) {
    try {
      const theme = await prisma.custom_themes.findFirst({ where: clause });
      if (!theme) return null;
      return { ...theme, colors: JSON.parse(theme.colors) };
    } catch (error) {
      console.error("FAILED TO GET CUSTOM THEME.", error.message);
      return null;
    }
  },

  where: async function (clause = {}, limit) {
    try {
      const themes = await prisma.custom_themes.findMany({
        where: clause,
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      return themes.map((t) => ({ ...t, colors: JSON.parse(t.colors) }));
    } catch (error) {
      console.error("FAILED TO GET CUSTOM THEMES.", error.message);
      return [];
    }
  },

  update: async function (id, data = {}) {
    try {
      const updateData = {};
      if (data.name) updateData.name = String(data.name);
      if (data.colors) {
        if (!this.validateColors(data.colors))
          throw new Error("Invalid color values.");
        updateData.colors = JSON.stringify(data.colors);
      }
      if (Object.keys(updateData).length === 0)
        throw new Error("No valid fields to update.");

      const theme = await prisma.custom_themes.update({
        where: { id: Number(id) },
        data: updateData,
      });
      return { theme: { ...theme, colors: JSON.parse(theme.colors) }, error: null };
    } catch (error) {
      console.error("FAILED TO UPDATE CUSTOM THEME.", error.message);
      return { theme: null, error: error.message };
    }
  },

  delete: async function (clause = {}) {
    try {
      await prisma.custom_themes.deleteMany({ where: clause });
      return true;
    } catch (error) {
      console.error("FAILED TO DELETE CUSTOM THEME.", error.message);
      return false;
    }
  },
};

module.exports = { CustomTheme };
