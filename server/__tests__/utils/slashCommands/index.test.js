const {
  builtInCommands,
  isCommand,
  getCommandHandler,
  listCommands,
} = require("../../../utils/slashCommands");

describe("slashCommands framework", () => {
  it("should have all expected built-in commands registered", () => {
    const expected = ["/reset", "/clear", "/export", "/help", "/template"];
    for (const cmd of expected) {
      expect(builtInCommands).toHaveProperty(cmd);
    }
  });

  describe("isCommand", () => {
    it("returns true for registered commands", () => {
      expect(isCommand("/reset")).toBe(true);
      expect(isCommand("/clear")).toBe(true);
      expect(isCommand("/export")).toBe(true);
      expect(isCommand("/help")).toBe(true);
      expect(isCommand("/template")).toBe(true);
    });

    it("returns false for unknown commands", () => {
      expect(isCommand("/unknown")).toBe(false);
      expect(isCommand("reset")).toBe(false);
    });
  });

  describe("getCommandHandler", () => {
    it("returns a function for registered commands", () => {
      expect(typeof getCommandHandler("/reset")).toBe("function");
      expect(typeof getCommandHandler("/clear")).toBe("function");
      expect(typeof getCommandHandler("/export")).toBe("function");
      expect(typeof getCommandHandler("/help")).toBe("function");
      expect(typeof getCommandHandler("/template")).toBe("function");
    });

    it("returns null for unknown commands", () => {
      expect(getCommandHandler("/unknown")).toBeNull();
    });
  });

  describe("listCommands", () => {
    it("returns an array of command objects with command and description", () => {
      const commands = listCommands();
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBe(5);

      for (const cmd of commands) {
        expect(cmd).toHaveProperty("command");
        expect(cmd).toHaveProperty("description");
        expect(typeof cmd.command).toBe("string");
        expect(typeof cmd.description).toBe("string");
        expect(cmd.command.startsWith("/")).toBe(true);
      }
    });
  });

  describe("clear command handler", () => {
    it("returns a clear_chat action response", async () => {
      const handler = getCommandHandler("/clear");
      const result = await handler(null, "", "test-uuid");
      expect(result).toMatchObject({
        uuid: "test-uuid",
        type: "textResponse",
        action: "clear_chat",
        close: true,
        error: false,
      });
    });
  });

  describe("template command handler", () => {
    it("returns an apply_template action with template content", async () => {
      const handler = getCommandHandler("/template");
      const result = await handler(null, "", "test-uuid");
      expect(result).toMatchObject({
        uuid: "test-uuid",
        type: "textResponse",
        action: "apply_template",
        close: true,
        error: false,
      });
      expect(result.templateContent).toBeDefined();
      expect(typeof result.templateContent).toBe("string");
    });
  });

  describe("help command handler", () => {
    it("returns a help text listing all commands", async () => {
      const handler = getCommandHandler("/help");
      const result = await handler(null, "", "test-uuid");
      expect(result).toMatchObject({
        uuid: "test-uuid",
        type: "textResponse",
        close: true,
        error: false,
      });
      expect(result.textResponse).toContain("/reset");
      expect(result.textResponse).toContain("/clear");
      expect(result.textResponse).toContain("/export");
      expect(result.textResponse).toContain("/help");
      expect(result.textResponse).toContain("/template");
    });
  });
});
