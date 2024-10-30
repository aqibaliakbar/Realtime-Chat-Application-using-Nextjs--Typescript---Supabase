"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User, FileUpload } from "@/types";
import { Paperclip, Send, X } from "lucide-react";

interface MessageInputProps {
  currentUser: User;
  chatId: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  currentUser,
  chatId,
}) => {
  const [message, setMessage] = useState("");
  const [fileUpload, setFileUpload] = useState<FileUpload | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFileUpload({
        file,
        previewUrl,
        type: file.type,
      });
    }
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${currentUser.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-attachments")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("chat-attachments").getPublicUrl(filePath);

    return {
      url: publicUrl,
      type: file.type,
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = message.trim();
    if ((!messageText && !fileUpload) || sending) return;

    try {
      setSending(true);
      let fileData = null;

      if (fileUpload) {
        fileData = await uploadFile(fileUpload.file);
      }

      // First, send the message
      const { error: messageError } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: currentUser.id,
        content: messageText,
        file_url: fileData?.url,
        file_type: fileData?.type,
      });

      if (messageError) throw messageError;

      // Then update the chat's last_message_at
      const { error: chatError } = await supabase
        .from("chats")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", chatId);

      if (chatError) throw chatError;

      // Clear the input only after successful send
      setMessage("");
      setFileUpload(null);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as any);
    }
  };

  return (
    <form onSubmit={sendMessage} className="p-4 border-t bg-white">
      {fileUpload && (
        <div className="mb-2 relative inline-block">
          {fileUpload.type.startsWith("image/") ? (
            <img
              src={fileUpload.previewUrl}
              alt="Upload preview"
              className="max-h-32 rounded"
            />
          ) : (
            <div className="p-2 bg-gray-100 rounded">
              {fileUpload.file.name}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setFileUpload(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          disabled={sending}
        />

        <button
          type="submit"
          disabled={sending || (!message.trim() && !fileUpload)}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          {sending ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </form>
  );
};
