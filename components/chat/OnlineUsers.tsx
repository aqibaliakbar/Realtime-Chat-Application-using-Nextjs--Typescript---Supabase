import React from "react";
import { User } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface OnlineUsersProps {
  users: User[];
}

export const OnlineUsers: React.FC<OnlineUsersProps> = ({ users }) => {
  return (
    <div className="w-64 bg-white p-4 border-l">
      <h2 className="font-semibold mb-4">Online Users</h2>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                user.is_online ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span className="flex-1">{user.username}</span>
            {!user.is_online && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(user.last_seen), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
