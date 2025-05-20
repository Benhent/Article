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
    order: number
    orcid?: string
    createdAt?: string
    updatedAt?: string
}