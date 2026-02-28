const { resetMemory } = require("./commands/reset");
const { clearMemory } = require("./commands/clear");
const { exportChatHistory } = require("./commands/export");
const { showHelp } = require("./commands/help");
const { applyTemplate } = require("./commands/template");

/**
 * @typedef {Object} SlashCommandDefinition
 * @property {Function} handler - The async handler function for the command
 * @property {string} description - A short description of what the command does
 */

/** @type {Object<string, SlashCommandDefinition>} */
const builtInCommands = {
  "/reset": {
    handler: resetMemory,
    description: "Reset workspace chat memory and start fresh",
  },
  "/clear": {
    handler: clearMemory,
    description: "Clear visible chat history from the current view",
  },
  "/export": {
    handler: exportChatHistory,
    description: "Export the current chat history as text",
  },
  "/help": {
    handler: showHelp,
    description: "List all available slash commands",
  },
  "/template": {
    handler: applyTemplate,
    description: "Insert a reusable prompt template into the chat",
  },
};

/**
 * Check if a given command string is a registered built-in command.
 * @param {string} command
 * @returns {boolean}
 */
function isCommand(command) {
  return Object.hasOwn(builtInCommands, command);
}

/**
 * Retrieve the handler for a given built-in command.
 * @param {string} command
 * @returns {Function|null}
 */
function getCommandHandler(command) {
  return builtInCommands[command]?.handler ?? null;
}

/**
 * Return a plain list of all built-in commands with their descriptions.
 * @returns {{command: string, description: string}[]}
 */
function listCommands() {
  return Object.entries(builtInCommands).map(
    ([command, { description }]) => ({
      command,
      description,
    })
  );
}

module.exports = {
  builtInCommands,
  isCommand,
  getCommandHandler,
  listCommands,
};
