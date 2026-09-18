"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
  agentMode?: boolean;
}

export function ChatInput({ onSend, isLoading, onStop, agentMode }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [value]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-background shadow-sm p-2 focus-within:ring-1 focus-within:ring-ring transition-shadow">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
        title="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={agentMode ? "Describe a task for the agent…" : "Message AI…"}
        rows={1}
        className={cn(
          "flex-1 resize-none bg-transparent outline-none text-sm",
          "placeholder:text-muted-foreground py-1.5 max-h-[200px]"
        )}
      />

      {isLoading ? (
        <Button
          size="icon"
          variant="ghost"
          onClick={onStop}
          className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive"
          title="Stop generation"
        >
          <Square className="h-4 w-4 fill-current" />
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!value.trim()}
          className="h-8 w-8 flex-shrink-0 rounded-xl"
          title="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
