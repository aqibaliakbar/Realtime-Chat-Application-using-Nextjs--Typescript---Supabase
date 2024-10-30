"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ChatList } from "@/components/chat/ChatList";
import { User } from "@/types";
import { LogOut } from "lucide-react";

export default function ChatPage() {
  const { user, signOut } = useAuth();
  const [selectedChat, setSelectedChat] = useState<{
    chatId: number;
    otherUser: User;
  } | null>(null);

  const handleChatSelect = useCallback((chatId: number, otherUser: User) => {
    setSelectedChat({ chatId, otherUser });
  }, []);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Chat App</h1>
            <p className="text-sm text-gray-500">{user.username}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <LogOut size={20} />
          </button>
        </div>

        <ChatList
          currentUser={user}
          onSelectChat={handleChatSelect}
          selectedChatId={selectedChat?.chatId}
        />
      </div>

      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-white border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                {selectedChat.otherUser.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="font-semibold">
                  {selectedChat.otherUser.username}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedChat.otherUser.is_online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </div>
          {selectedChat.chatId && selectedChat.otherUser && (
            <div className="flex-1 flex flex-col">
              <MessageList
                currentUser={user}
                chatId={selectedChat.chatId}
                otherUser={selectedChat.otherUser}
              />
              <MessageInput currentUser={user} chatId={selectedChat.chatId} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center text-gray-500">
            <p className="text-xl font-semibold">Welcome to Chat</p>
            <p className="mt-2">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
