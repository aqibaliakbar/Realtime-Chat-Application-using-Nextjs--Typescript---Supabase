"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/types";
import { UserPlus } from "lucide-react";

interface ChatListProps {
  currentUser: User;
  onSelectChat: (chatId: number, otherUser: User) => void;
  selectedChatId?: number;
}

export const ChatList: React.FC<ChatListProps> = ({
  currentUser,
  onSelectChat,
  selectedChatId,
}) => {
  const [chats, setChats] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadChats = async () => {
    try {
      const { data } = await supabase
        .from("chats")
        .select(
          `
          *,
          user1:user1_id(*),
          user2:user2_id(*)
        `
        )
        .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
        .order("last_message_at", { ascending: false });

      setChats(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading chats:", error);
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", currentUser.id)
        .order("username");

      setAvailableUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  useEffect(() => {
    loadChats();
    const channel = supabase
      .channel("chat-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chats" },
        () => loadChats()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser.id]);

  useEffect(() => {
    if (showNewChat) {
      loadAvailableUsers();
    }
  }, [showNewChat]);

  const createNewChat = async (otherUser: User) => {
    try {
      // Check if chat already exists
      const existingChat = chats.find(
        (chat) =>
          (chat.user1_id === currentUser.id &&
            chat.user2_id === otherUser.id) ||
          (chat.user1_id === otherUser.id && chat.user2_id === currentUser.id)
      );

      if (existingChat) {
        onSelectChat(existingChat.id, otherUser);
        setShowNewChat(false);
        return;
      }

      // Create new chat
      const { data, error } = await supabase
        .from("chats")
        .insert([
          {
            user1_id: currentUser.id,
            user2_id: otherUser.id,
            last_message_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onSelectChat(data.id, otherUser);
        await loadChats();
      }
      setShowNewChat(false);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const getOtherUser = (chat: any): User => {
    return chat.user1.id === currentUser.id ? chat.user2 : chat.user1;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="font-medium">
          {showNewChat ? "New Chat" : "Conversations"}
        </h2>
        <button
          onClick={() => setShowNewChat(!showNewChat)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {showNewChat ? (
          availableUsers.length > 0 ? (
            availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => createNewChat(user)}
                className="w-full p-4 text-left hover:bg-gray-50 flex items-center gap-3 border-b"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {user.username[0].toUpperCase()}
                </div>
                <span>{user.username}</span>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No users available
            </div>
          )
        ) : chats.length > 0 ? (
          chats.map((chat) => {
            const otherUser = getOtherUser(chat);
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id, otherUser)}
                className={`w-full p-4 text-left hover:bg-gray-50 flex items-center gap-3 border-b
                  ${selectedChatId === chat.id ? "bg-blue-50" : ""}`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {otherUser.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{otherUser.username}</p>
                  <p className="text-sm text-gray-500">
                    {otherUser.is_online ? "Online" : "Offline"}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
};
