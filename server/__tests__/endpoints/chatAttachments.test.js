/* eslint-env jest, node */
const path = require("path");
const fs = require("fs");

// Test helpers from chatAttachments endpoint
const {
  chatAttachmentEndpoints,
} = require("../../endpoints/chatAttachments");

// Since the module uses require for middleware, we mock them
jest.mock("../../utils/files/multer", () => ({
  handleAttachmentUpload: jest.fn((req, res, next) => next()),
}));

jest.mock("../../utils/middleware/validatedRequest", () => ({
  validatedRequest: (req, res, next) => next(),
}));

jest.mock("../../utils/middleware/multiUserProtected", () => ({
  flexUserRoleValid: () => (req, res, next) => next(),
  ROLES: { all: "all" },
}));

jest.mock("../../utils/middleware/validWorkspace", () => ({
  validWorkspaceSlug: (req, res, next) => {
    res.locals.workspace = { id: 1, slug: "test" };
    next();
  },
}));

describe("chatAttachmentEndpoints", () => {
  it("should export a function", () => {
    expect(typeof chatAttachmentEndpoints).toBe("function");
  });

  it("should register routes when called with an app", () => {
    const mockApp = {
      post: jest.fn(),
      get: jest.fn(),
    };

    chatAttachmentEndpoints(mockApp);

    // Should register upload endpoint
    expect(mockApp.post).toHaveBeenCalledWith(
      "/workspace/:slug/upload-attachment",
      expect.any(Array),
      expect.any(Function)
    );

    // Should register serve endpoint
    expect(mockApp.get).toHaveBeenCalledWith(
      "/attachments/:filename",
      expect.any(Array),
      expect.any(Function)
    );
  });

  it("should not register routes when app is null", () => {
    expect(() => chatAttachmentEndpoints(null)).not.toThrow();
  });
});
