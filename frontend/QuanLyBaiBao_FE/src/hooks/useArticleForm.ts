import type React from "react"

import { useState, useEffect } from "react"
import { useArticleStore, useFieldStore, useAuthorStore, useFileStore } from "../store/rootStore"
import type { Article, ArticleAuthor } from "../types/article"

interface UseArticleFormProps {
  articleId?: string
}

export const useArticleForm = ({ articleId }: UseArticleFormProps = {}) => {
  const [formData, setFormData] = useState<Partial<Article>>({
    title: "",
    abstract: "",
    keywords: [],
    articleLanguage: "en",
    field: "",
    secondaryFields: [],
  })

  const { article, fetchArticleById, createArticle, updateArticle } = useArticleStore()
  const { fields, fetchFields } = useFieldStore()
  const { authors, fetchArticleAuthors, createArticleAuthor } = useAuthorStore()
  const { uploadArticleFile } = useFileStore()

  // Load article data if editing
  useEffect(() => {
    if (articleId) {
      fetchArticleById(articleId)
    }

    // Load fields for dropdown
    fetchFields({ isActive: true })
  }, [articleId, fetchArticleById, fetchFields])

  // Update form data when article is loaded
  useEffect(() => {
    if (article && articleId) {
      setFormData({
        title: article.title,
        titlePrefix: article.titlePrefix,
        subtitle: article.subtitle,
        thumbnail: article.thumbnail,
        abstract: article.abstract,
        keywords: article.keywords,
        articleLanguage: article.articleLanguage,
        otherLanguage: article.otherLanguage,
        field: typeof article.field === "string" ? article.field : article.field._id,
        secondaryFields: Array.isArray(article.secondaryFields)
          ? article.secondaryFields.map((f) => (typeof f === "string" ? f : f._id))
          : [],
        submitterNote: article.submitterNote,
      })

      // Load authors
      fetchArticleAuthors(articleId)
    }
  }, [article, articleId, fetchArticleAuthors])

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleKeywordsChange = (keywords: string[]) => {
    setFormData((prev) => ({ ...prev, keywords }))
  }

  const handleFieldChange = (fieldId: string) => {
    setFormData((prev) => ({ ...prev, field: fieldId }))
  }

  const handleSecondaryFieldsChange = (fieldIds: string[]) => {
    setFormData((prev) => ({ ...prev, secondaryFields: fieldIds }))
  }

  const handleAuthorAdd = async (author: Partial<ArticleAuthor>) => {
    if (!articleId) return

    await createArticleAuthor({
      ...author,
      // articleId,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (articleId) {
      // Update existing article
      await updateArticle(articleId, formData)
    } else {
      // Create new article
      const newArticleId = await createArticle(formData)
      return newArticleId
    }
  }

  const handleFileUpload = async (file: File, fileCategory: string) => {
    if (!articleId) return

    await uploadArticleFile(articleId, fileCategory, file)
  }

  return {
    formData,
    article,
    fields,
    authors,
    handleChange,
    handleKeywordsChange,
    handleFieldChange,
    handleSecondaryFieldsChange,
    handleAuthorAdd,
    handleSubmit,
    handleFileUpload,
  }
}