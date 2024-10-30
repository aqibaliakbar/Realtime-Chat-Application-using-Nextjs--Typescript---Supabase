import React from "react";
import { FileText } from "lucide-react";

interface FilePreviewProps {
  url: string;
  type: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ url, type }) => {
  if (type.startsWith("image/")) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt="Attachment" className="max-h-48 rounded" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-2 bg-gray-100 rounded hover:bg-gray-200"
    >
      <FileText size={20} />
      <span>Download attachment</span>
    </a>
  );
};
