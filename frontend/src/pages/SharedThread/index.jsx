import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FullScreenLoader } from "@/components/Preloader";
import SharedThreadModel from "@/models/sharedThread";
import renderMarkdown from "@/utils/chat/markdown";
import DOMPurify from "@/utils/chat/purify";

export default function SharedThread() {
  const { token } = useParams();
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    if (!token) {
      setState({
        status: "error",
        data: { error: "No share token provided." },
      });
      return;
    }
    SharedThreadModel.get(token).then((res) => {
      if (res?.error || !res?.thread) {
        setState({
          status: "error",
          data: { error: res?.error || "Share link not found or has expired." },
        });
      } else {
        setState({ status: "loaded", data: res });
      }
    });
  }, [token]);

  if (state.status === "loading") {
    return (
      <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex">
        <FullScreenLoader />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="w-screen h-screen overflow-hidden bg-theme-bg-container flex items-center justify-center">
        <p className="text-red-400 text-lg">
          {state.data?.error || "Something went wrong."}
        </p>
      </div>
    );
  }

  const { thread, workspace, history, expiresAt } = state.data;

  return (
    <div className="w-screen min-h-screen bg-theme-bg-container flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-theme-text-secondary uppercase tracking-widest mb-1">
            {workspace?.name}
          </p>
          <h1 className="text-2xl font-semibold text-theme-text-primary">
            {thread?.name}
          </h1>
          {expiresAt && (
            <p className="text-xs text-theme-text-secondary mt-1">
              Shared link expires:{" "}
              {new Date(expiresAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          <div className="mt-3 border-b border-theme-sidebar-border" />
        </div>

        {/* Messages */}
        {history.length === 0 ? (
          <p className="text-theme-text-secondary text-center mt-8">
            This thread has no messages.
          </p>
        ) : (
          <div className="flex flex-col gap-y-6">
            {history.map((msg, idx) => (
              <SharedMessage key={msg.chatId ?? idx} message={msg} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 border-t border-theme-sidebar-border pt-4 text-center">
          <p className="text-xs text-theme-text-secondary">
            Shared via{" "}
            <span className="font-semibold text-theme-text-primary">
              AnythingLLM
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SharedMessage({ message }) {
  const isUser = message.role === "user";

  const content = DOMPurify.sanitize(
    isUser ? message.content : renderMarkdown(message.content),
    { USE_PROFILES: { html: true } }
  );

  return (
    <div className={`flex gap-x-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-theme-sidebar-item-default text-theme-text-primary"
        }`}
      >
        {isUser ? "U" : "AI"}
      </div>
      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
          isUser
            ? "bg-blue-500/10 text-theme-text-primary"
            : "bg-theme-bg-chat text-theme-text-primary"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div
            className="markdown-body prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </div>
  );
}
