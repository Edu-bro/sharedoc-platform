export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Document {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  tags: string[];
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Share {
  docId: string;
  linkId: string;
  permission: 'view' | 'comment';
  passwordHash?: string;
  expireAt?: string;
  isActive: boolean;
}

export interface ViewLog {
  id: string;
  docId: string;
  userId?: string;
  page: number;
  timestamp: string;
  userAgent?: string;
}

export interface AIResult {
  id: string;
  docId: string;
  runId: string;
  scores: {
    market: number;
    story: number;
    design: number;
    finance: number;
  };
  suggestions: string[];
  createdAt: string;
}

export interface ReviewRequest {
  id: string;
  docId: string;
  purpose: 'ir' | 'proposal' | 'other';
  items: Array<{
    id: string;
    label: string;
    required: boolean;
  }>;
  overallRequired: boolean;
  dueAt: string;
  invitees: string[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  reviewerId?: string;
  scores: Array<{
    itemId: string;
    score: number;
  }>;
  comments: Array<{
    itemId: string;
    body: string;
  }>;
  overall?: string;
  submittedAt: string;
}

export interface Comment {
  id: string;
  docId: string;
  authorId?: string;
  authorName?: string;
  page: number;
  body: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}