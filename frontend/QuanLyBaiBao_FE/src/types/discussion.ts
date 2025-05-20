export interface Discussion {
    _id?: string;
    articleId: string;
    subject: string;
    initiatorId: string;
    participants: string[];
    round?: number;
    messages?: Message[];
    type: 'general' | 'review' | 'revision' | 'editorial';
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }
  
  export interface Message {
    senderId: string;
    content: string;
    attachments?: DiscussionAttachment[];
    sentAt?: Date | string;
    readBy?: {
      userId: string;
      readAt: Date | string;
    }[];
  }
  
  export interface DiscussionAttachment {
    fileName: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    fileUrl?: string;
}  