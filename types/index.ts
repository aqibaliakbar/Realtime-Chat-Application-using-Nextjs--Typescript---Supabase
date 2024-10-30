export interface Message {
  id: number;
  content: string;
  user_id: string;
  created_at: string;
  file_url?: string;
  file_type?: string;
  reactions?: MessageReaction[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  last_seen: string;
  is_online: boolean;
}

export interface MessageReaction {
  id: number;
  message_id: number;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface TypingStatus {
  user_id: string;
  username: string;
  is_typing: boolean;
}

export type FileUpload = {
  file: File;
  previewUrl: string;
  type: string;
};



