import useArticleStore from "./articleStore"
import useAuthorStore from "./authorStore"
import useFileStore from "./fileStore"
import useIssueStore from "./issueStore"
import useFieldStore from "./fieldStore"
import useReviewStore from "./reviewStore"
import useDiscussionStore from "./discussionStore"
import useAuthStore from "./authStore"
import useUIStore from "./uiStore"

// Export all stores for easy access
export {
  useArticleStore,
  useAuthorStore,
  useFileStore,
  useIssueStore,
  useFieldStore,
  useReviewStore,
  useDiscussionStore,
  useAuthStore,
  useUIStore,
}

// Create a combined hook for common operations
export const useArticleManagement = () => {
  const { articles, article, fetchArticles, fetchArticleById, createArticle, updateArticle, deleteArticle } =
    useArticleStore()
  const { authors, fetchArticleAuthors, createArticleAuthor, updateArticleAuthor, deleteArticleAuthor } =
    useAuthorStore()
  const { files, uploadArticleFile, getArticleFiles, deleteArticleFile } = useFileStore()
  const { loading, errors, showSuccessToast, showErrorToast } = useUIStore()

  // Helper function to load all article data
  const loadArticleData = async (articleId: string) => {
    await fetchArticleById(articleId)
    await fetchArticleAuthors(articleId)
    await getArticleFiles(articleId)
  }

  return {
    // State
    articles,
    article,
    authors,
    files,
    loading,
    errors,

    // Article operations
    fetchArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    deleteArticle,

    // Author operations
    fetchArticleAuthors,
    createArticleAuthor,
    updateArticleAuthor,
    deleteArticleAuthor,

    // File operations
    uploadArticleFile,
    getArticleFiles,
    deleteArticleFile,

    // Combined operations
    loadArticleData,

    // UI operations
    showSuccessToast,
    showErrorToast,
  }
}

// Create a combined hook for publishing workflow
export const usePublishingWorkflow = () => {
  const { article, changeArticleStatus, assignEditor } = useArticleStore()
  const { reviews, fetchReviews, createReview, createMultipleReviews } = useReviewStore()
  const { issues, fetchIssues, addArticleToIssue } = useIssueStore()
  const { loading, errors } = useUIStore()

  return {
    // State
    article,
    reviews,
    issues,
    loading,
    errors,

    // Article operations
    changeArticleStatus,
    assignEditor,

    // Review operations
    fetchReviews,
    createReview,
    createMultipleReviews,

    // Issue operations
    fetchIssues,
    addArticleToIssue,
  }
}