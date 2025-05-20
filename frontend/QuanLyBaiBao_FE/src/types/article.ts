import { ArticleAuthor } from './author';
import { ArticleFile } from './file';
import { StatusHistory } from './statushistory';

export type ArticleStatus = 
  | 'submitted'
  | 'underReview'
  | 'revisionRequired'
  | 'resubmitted'
  | 'accepted'
  | 'rejected'
  | 'published';

export interface Article {
    _id: string
    titlePrefix?: string
    title: string
    subtitle?: string
    thumbnail?: string
    abstract: string
    keywords: string[]
    articleLanguage: string
    otherLanguage?: string
    authors: ArticleAuthor[] | string[]
    status: ArticleStatus
    statusHistory: StatusHistory[] | string[]
    field: { _id: string; name: string } | string
    secondaryFields?: { _id: string; name: string }[] | string[]
    submitterId: { _id: string; name: string; email: string; institution?: string; country?: string } | string
    editorId?: { _id: string; fullName: string; email: string } | string
    createdAt: string
    updatedAt: string
    viewCount: number
    doi?: string
    issueId?: string
    pageStart?: number
    pageEnd?: number
    submitterNote?: string
    articleFile: ArticleFile
    currentRound?: number
    submittedDate?: Date
    acceptedDate?: Date
    rejectedDate?: Date
    publishedDate?: Date
    editorNote?: string
    downloadCount?: number
    citationCount?: number
    slug?: string
}