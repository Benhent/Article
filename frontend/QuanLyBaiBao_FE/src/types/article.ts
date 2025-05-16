export interface ArticleAuthor {
    _id?: string
    articleId?: string
    userId?: string | { _id: string; name: string; email: string }
    hasAccount: boolean
    fullName: string
    email: string
    institution: string
    country: string
    isCorresponding: boolean
    order?: number
    orcid?: string
    createdAt?: string
    updatedAt?: string
}
  
export interface ArticleFile {
    _id: string
    articleId: string
    fileCategory: string
    fileName: string
    originalName?: string
    fileSize: number
    fileType: string
    fileUrl: string
    uploadedBy: string | { _id: string; fullName: string; email: string }
    isActive: boolean
    round?: number
    fileVersion?: number
    createdAt: string
    updatedAt: string
}
  
export interface StatusHistory {
    _id: string
    status: string
    changedBy: string | { _id: string; fullName: string; email: string }
    timestamp: string
    reason: string
}
  
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
    status: string
    statusHistory: StatusHistory[] | string[]
    field: { _id: string; name: string } | string
    secondaryFields?: { _id: string; name: string }[] | string[]
    submitterId: { _id: string; fullName: string; email: string; institution?: string; country?: string } | string
    editorId?: { _id: string; fullName: string; email: string } | string
    createdAt: string
    updatedAt: string
    viewCount: number
    doi?: string
    issueId?: string
    pageStart?: number
    pageEnd?: number
    submitterNote?: string
    files?: ArticleFile[]
}
  
export interface Issue {
    _id: string
    title: string
    volumeNumber: number
    issueNumber: number
    publicationDate: string
    isPublished: boolean
    articles: string[]
}
  
export interface Journal {
    _id: string
    name: string
    issn: string
    description: string
    coverImageUrl?: string
}
  
export interface Field {
    _id: string
    name: string
    code: string
    parent?: string | { _id: string; name: string; code: string }
    level: number
    isActive: boolean
}
  
export interface Review {
    _id: string
    articleId: string | Article
    reviewerId: string | { _id: string; fullName: string; email: string }
    status: string
    responseDeadline: string
    reviewDeadline: string
    completedAt?: string
    recommendation?: string
    commentsForAuthor?: string
    commentsForEditor?: string
    declineReason?: string
    round: number
    createdAt: string
    updatedAt: string
}
  
export interface Discussion {
    _id: string
    articleId: string | Article
    subject: string
    initiatorId: string | { _id: string; fullName: string; email: string }
    participants: string[] | { _id: string; fullName: string; email: string }[]
    messages: {
      senderId: string | { _id: string; fullName: string; email: string }
      content: string
      attachments: string[]
      timestamp: string
      readBy: { userId: string; timestamp: string }[]
    }[]
    type: string
    round: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}  