const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { handleAttachmentUpload } = require("../utils/files/multer");
const { validatedRequest } = require("../utils/middleware/validatedRequest");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");
const { validWorkspaceSlug } = require("../utils/middleware/validWorkspace");

/**
 * Resolve the attachments storage directory based on environment.
 * @returns {string}
 */
function attachmentsPath() {
  return process.env.NODE_ENV === "development"
    ? path.resolve(__dirname, "../storage/attachments")
    : path.resolve(process.env.STORAGE_DIR, "attachments");
}

/**
 * Set of MIME types considered as text-readable for direct content extraction.
 */
const TEXT_MIME_TYPES = new Set([
  "text/plain",
  "text/csv",
  "text/html",
  "text/css",
  "text/javascript",
  "text/markdown",
  "application/json",
  "application/xml",
  "application/javascript",
  "application/x-yaml",
  "application/x-sh",
]);

/**
 * Set of file extensions considered text-readable.
 */
const TEXT_EXTENSIONS = new Set([
  ".txt",
  ".csv",
  ".md",
  ".json",
  ".xml",
  ".yaml",
  ".yml",
  ".html",
  ".css",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".rb",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".sh",
  ".sql",
  ".log",
  ".env",
  ".ini",
  ".cfg",
  ".conf",
  ".toml",
]);

/**
 * Determine if a file is text-readable based on its MIME type and extension.
 * @param {string} mime
 * @param {string} originalName
 * @returns {boolean}
 */
function isTextFile(mime, originalName) {
  if (TEXT_MIME_TYPES.has(mime)) return true;
  const ext = path.extname(originalName).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

/**
 * Read text content from a file, truncated to a max length.
 * @param {string} filePath
 * @param {number} maxLength
 * @returns {string|null}
 */
function readTextContent(filePath, maxLength = 100000) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return content.length > maxLength
      ? content.substring(0, maxLength) + "\n...[truncated]"
      : content;
  } catch {
    return null;
  }
}

function chatAttachmentEndpoints(app) {
  if (!app) return;

  // Upload a file as a direct chat attachment (bypasses collector/embedding pipeline)
  app.post(
    "/workspace/:slug/upload-attachment",
    [
      validatedRequest,
      flexUserRoleValid([ROLES.all]),
      handleAttachmentUpload,
      validWorkspaceSlug,
    ],
    async (request, response) => {
      try {
        const { file } = request;
        if (!file) {
          return response
            .status(400)
            .json({ success: false, error: "No file uploaded." });
        }

        const storedName = request.randomFileName || file.filename;
        const originalName = file.originalname;
        const mime = file.mimetype;
        const filePath = path.join(attachmentsPath(), storedName);

        let contentString = null;

        // For images, convert to base64 data URI for inline preview
        if (mime.startsWith("image/")) {
          const fileBuffer = fs.readFileSync(filePath);
          contentString = `data:${mime};base64,${fileBuffer.toString("base64")}`;
        }
        // For text-readable files, extract content as context for the LLM
        else if (isTextFile(mime, originalName)) {
          contentString = readTextContent(filePath);
        }

        return response.status(200).json({
          success: true,
          attachment: {
            name: originalName,
            mime,
            storedName,
            contentString,
            url: `/api/attachments/${encodeURIComponent(storedName)}`,
          },
        });
      } catch (e) {
        console.error(e.message, e);
        return response
          .status(500)
          .json({ success: false, error: e.message });
      }
    }
  );

  // Serve stored attachment files
  app.get(
    "/attachments/:filename",
    [validatedRequest],
    async (request, response) => {
      try {
        const { filename } = request.params;
        const safeName = path.basename(filename);
        const filePath = path.join(attachmentsPath(), safeName);

        if (!fs.existsSync(filePath)) {
          return response
            .status(404)
            .json({ success: false, error: "Attachment not found." });
        }

        return response.sendFile(filePath);
      } catch (e) {
        console.error(e.message, e);
        return response
          .status(500)
          .json({ success: false, error: e.message });
      }
    }
  );
}

module.exports = { chatAttachmentEndpoints };
