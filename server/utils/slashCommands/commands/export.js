const { WorkspaceChats } = require("../../../models/workspaceChats");

async function exportChatHistory(
  workspace,
  _message,
  msgUUID,
  user = null,
  thread = null
) {
  const history = await WorkspaceChats.where(
    {
      workspaceId: workspace.id,
      user_id: user?.id || null,
      thread_id: thread?.id || null,
      include: true,
    },
    null,
    { id: "asc" }
  );

  const lines = history.map((msg) => {
    const role = msg.role === "user" ? "User" : "Assistant";
    return `${role}: ${msg.prompt || msg.response || ""}`;
  });

  return {
    uuid: msgUUID,
    type: "textResponse",
    textResponse: "Chat history exported successfully. Check your downloads.",
    sources: [],
    close: true,
    error: false,
    action: "export_chat",
    exportContent: lines.join("\n"),
  };
}

module.exports = {
  exportChatHistory,
};
