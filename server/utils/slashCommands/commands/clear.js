async function clearMemory(
  _workspace,
  _message,
  msgUUID,
  _user = null,
  _thread = null
) {
  return {
    uuid: msgUUID,
    type: "textResponse",
    textResponse: "Chat history cleared from view.",
    sources: [],
    close: true,
    error: false,
    action: "clear_chat",
  };
}

module.exports = {
  clearMemory,
};
