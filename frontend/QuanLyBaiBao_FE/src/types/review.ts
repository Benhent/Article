export interface Review {
    _id?: string;
    articleId: string;
    reviewerId: string;
    round: number;
    invitedAt?: Date | string;
    responseDeadline?: Date | string;
    reviewDeadline?: Date | string;
    responseDate?: Date | string;
    submittedDate?: Date | string;
    status?: 'invited' | 'accepted' | 'declined' | 'completed' | 'expired';
    recommendation?: 'accept' | 'minorRevision' | 'majorRevision' | 'resubmit' | 'rejectSuggestElsewhere' | 'reject' | 'seeComments';
    comments?: {
      forAuthor?: string;
      forEditor?: string;
      attachments?: ReviewAttachment[];
    };
    reminderCount?: number;
    lastReminderDate?: Date | string;
    declineReason?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }
  
export interface ReviewAttachment {
    fileName: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    fileUrl?: string;
    uploadedAt?: Date | string;
} 