"use client";

import React, { useEffect, useRef, useState } from "react";
import { Message, User } from "@/types";
import { supabase } from "@/lib/supabaseClient";

interface MessageListProps {
  currentUser: User;
  chatId: number;
  otherUser: User;
}

export const MessageList: React.FC<MessageListProps> = ({
  currentUser,
  chatId,
  otherUser,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          scrollToBottom();
          if (payload.new.sender_id !== currentUser.id) {
            await markMessagesAsRead();
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [chatId, currentUser.id]);

  // Mark messages as read
  useEffect(() => {
    if (!chatId || !otherUser?.id) return;
    markMessagesAsRead();
  }, [chatId, otherUser?.id]);

  const markMessagesAsRead = async () => {
    if (!chatId || !otherUser?.id) return;

    try {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("chat_id", chatId)
        .eq("sender_id", otherUser.id)
        .is("read_at", null);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === currentUser.id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender_id === currentUser.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              <div className="text-sm break-words">{message.content}</div>
              {message.read_at && message.sender_id === currentUser.id && (
                <div className="text-xs opacity-75 mt-1">Read</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          No messages yet. Start the conversation!
        </div>
      )}
    </div>
  );
};
