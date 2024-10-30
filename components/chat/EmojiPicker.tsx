import React from "react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  // Common emojis for reactions
  const emojis = ["👍", "❤️", "😄", "😮", "😢", "😡", "🎉", "👏"];

  return (
    <div className="bg-white p-2 rounded-lg shadow-lg border">
      <div className="grid grid-cols-4 gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
