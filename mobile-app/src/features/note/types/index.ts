export interface NoteModel {
  noteId: number;
  title: string;
  adminId: number;
  content: string;
  isLocked: boolean;
  isDeleted: boolean;
  createdAt: string; // Use `string` for ISO date format from API, can be `Date` if parsed
  updatedAt: string;
  version: number;
}
export interface EditNoteDto {
  noteId?: number;
  userId?: number;
  title?: string;
  content?: string;
}

export interface Note {
  noteId: string;
  content: string | undefined;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
  votedBy: number[]; // Array of user IDs who voted for this option
}

export interface Poll {
  id: number;
  noteId: number;
  question: string;
  options: PollOption[];
  createdBy: number;
  createdAt: string;
  expiresAt?: string;
  allowMultipleVotes: boolean;
  isActive: boolean;
  totalVotes: number;
}

export interface PollVote {
  pollId: number;
  optionId: string;
  userId: number;
  votedAt: string;
}

export interface CreatePollRequest {
  noteId: number;
  question: string;
  createdBy: number;
  options: string[];
  expiresAt?: string;
  allowMultipleVotes: boolean;
}
