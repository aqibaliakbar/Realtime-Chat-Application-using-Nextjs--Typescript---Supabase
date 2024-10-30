"use client";

import { Message, User } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  otherUser: User;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  otherUser,
}) => {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="flex items-center gap-2 text-sm mb-1">
          <span className="font-medium">
            {isOwnMessage ? "You" : otherUser.username}
          </span>
          <span className="opacity-75 text-xs">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>

        <p className="text-sm">{message.content}</p>

        {message.file_url && (
          <div className="mt-2">
            {message.file_type?.startsWith("image/") ? (
              <img
                src={message.file_url}
                alt="Attachment"
                className="max-h-48 rounded"
              />
            ) : (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
              >
                View attachment
              </a>
            )}
          </div>
        )}

        {message.read_at && isOwnMessage && (
          <div className="text-xs opacity-75 mt-1">
            Read{" "}
            {formatDistanceToNow(new Date(message.read_at), {
              addSuffix: true,
            })}
          </div>
        )}
      </div>
    </div>
  );
};
