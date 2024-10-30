import React from "react";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { User } from "@/types";

interface TypingIndicatorProps {
  currentUser: User;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  currentUser,
}) => {
  const { typingUsers } = useTypingIndicator(currentUser);

  if (typingUsers.length === 0) return null;

  return (
    <div className="h-6 px-4 text-sm text-gray-500 flex items-center gap-2">
      <div className="flex gap-1">
        <span
          className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span>
        {typingUsers.length === 1 && (
          <>{typingUsers[0].username} is typing...</>
        )}
        {typingUsers.length === 2 && (
          <>
            {typingUsers[0].username} and {typingUsers[1].username} are
            typing...
          </>
        )}
        {typingUsers.length > 2 && <>Several people are typing...</>}
      </span>
    </div>
  );
};
