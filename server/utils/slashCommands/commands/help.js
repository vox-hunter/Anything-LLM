async function showHelp(
  _workspace,
  _message,
  msgUUID,
  _user = null,
  _thread = null
) {
  // Lazy-require to avoid circular dependency with the parent registry.
  const { listCommands } = require("../index");
  const commands = listCommands();
  const helpText = commands
    .map((cmd) => `**${cmd.command}** — ${cmd.description}`)
    .join("\n");

  return {
    uuid: msgUUID,
    type: "textResponse",
    textResponse: `Available slash commands:\n${helpText}\n\nYou can also create custom slash commands from the slash command menu.`,
    sources: [],
    close: true,
    error: false,
  };
}

module.exports = {
  showHelp,
};
