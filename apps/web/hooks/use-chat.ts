"use client";

import { useChat as useAIChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useCallback, useMemo } from "react";
import type { ChatMessage } from "@ai-saas/shared";

function textFromParts(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function useChat(conversationId?: string) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        // The server expects { conversationId, message }, not the raw
        // UIMessage[] array the AI SDK sends by default — repack it here
        // so the client and /api/chat keep speaking the same protocol.
        prepareSendMessagesRequest: ({ messages, id }) => {
          const lastMessage = messages[messages.length - 1];
          return {
            body: {
              conversationId: id,
              message: lastMessage ? textFromParts(lastMessage.parts) : "",
            },
          };
        },
      }),
    []
  );

  const { messages, status, stop, error, setMessages, sendMessage } = useAIChat({
    id: conversationId,
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  const send = useCallback(
    (message: string) => {
      sendMessage({ text: message });
    },
    [sendMessage]
  );

  const clear = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  // Map AI SDK UIMessages (parts-based) to our shared ChatMessage type
  const chatMessages: ChatMessage[] = messages.map((m) => ({
    id: m.id,
    role: m.role as ChatMessage["role"],
    content: textFromParts(m.parts),
  }));

  return {
    messages: chatMessages,
    isLoading,
    error,
    send,
    clear,
    stop,
  };
}
