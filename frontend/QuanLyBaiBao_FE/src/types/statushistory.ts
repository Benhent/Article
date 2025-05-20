export type ArticleStatus = 
  | 'draft'
  | 'submitted'
  | 'underReview'
  | 'revisionRequired'
  | 'resubmitted'
  | 'accepted'
  | 'rejected'
  | 'published';

export interface StatusHistory {
  status: ArticleStatus;
  changedBy: string;
  reason?: string;
  timestamp: Date;
  _id?: string;
}