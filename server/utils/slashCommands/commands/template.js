async function applyTemplate(
  _workspace,
  _message,
  msgUUID,
  _user = null,
  _thread = null
) {
  return {
    uuid: msgUUID,
    type: "textResponse",
    textResponse:
      "Template applied to your prompt input. Edit the text and press send.",
    sources: [],
    close: true,
    error: false,
    action: "apply_template",
    templateContent:
      "You are a helpful assistant. Please respond to the following request:\n\n[Describe your task here]",
  };
}

module.exports = {
  applyTemplate,
};
