const prisma = require("../utils/prisma");

const PromptTemplate = {
  writable: ["title", "content", "description"],

  get: async function (clause = {}) {
    try {
      const template = await prisma.prompt_templates.findFirst({
        where: clause,
      });
      return template || null;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  },

  where: async function (clause = {}, limit) {
    try {
      const templates = await prisma.prompt_templates.findMany({
        where: clause,
        take: limit || undefined,
      });
      return templates;
    } catch (error) {
      console.error(error.message);
      return [];
    }
  },

  // Title + userId must be unique combination.
  create: async function (userId = null, templateData = {}) {
    try {
      const existingTemplate = await this.get({
        userId: userId ? Number(userId) : null,
        title: String(templateData.title),
      });

      if (existingTemplate) {
        console.log(
          "PromptTemplate.create - template already exists - will not create"
        );
        return existingTemplate;
      }

      const template = await prisma.prompt_templates.create({
        data: {
          ...templateData,
          uid: userId ? Number(userId) : 0,
          userId: userId ? Number(userId) : null,
        },
      });
      return template;
    } catch (error) {
      console.error("Failed to create prompt template", error.message);
      return null;
    }
  },

  getUserTemplates: async function (userId = null) {
    try {
      return (
        await prisma.prompt_templates.findMany({
          where: { userId: !!userId ? Number(userId) : null },
          orderBy: { createdAt: "asc" },
        })
      )?.map((template) => ({
        id: template.id,
        title: template.title,
        content: template.content,
        description: template.description,
      }));
    } catch (error) {
      console.error("Failed to get user prompt templates", error.message);
      return [];
    }
  },

  update: async function (templateId = null, templateData = {}) {
    try {
      const template = await prisma.prompt_templates.update({
        where: { id: Number(templateId) },
        data: templateData,
      });
      return template;
    } catch (error) {
      console.error("Failed to update prompt template", error.message);
      return null;
    }
  },

  delete: async function (templateId = null) {
    try {
      await prisma.prompt_templates.delete({
        where: { id: Number(templateId) },
      });
      return true;
    } catch (error) {
      console.error("Failed to delete prompt template", error.message);
      return false;
    }
  },
};

module.exports.PromptTemplate = PromptTemplate;
