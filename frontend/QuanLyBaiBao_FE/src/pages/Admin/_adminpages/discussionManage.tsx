import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import useDiscussionStore from "../../../store/discussionStore"
import useArticleStore from "../../../store/articleStore"
import useUIStore from "../../../store/uiStore"
import useAuthStore from "../../../store/authStore"
import useSocketStore from "../../../store/socketStore"
import { useMobile } from "../../../hooks/useMobile"
import { DiscussionList } from "../../../components/discussion/discussion-list"
import { MessageList } from "../../../components/discussion/message-list"
import { MessageInput } from "../../../components/discussion/message-input"
import { DiscussionHeader } from "../../../components/discussion/discussion-header"
import { DiscussionSidebar } from "../../../components/discussion/discussion-sidebar"
import { ResponsiveLayout } from "../../../components/discussion/responsive-layout"
import { EmptyState } from "../../../components/discussion/empty-state"
import type { DiscussionAttachment, Message } from "../../../types/discussion"

const DiscussionManage: React.FC = () => {
  const navigate = useNavigate()
  const { articleId } = useParams<{ articleId: string }>()
  const { discussions, discussion, fetchDiscussions, fetchDiscussionById, addMessage } = useDiscussionStore()
  const { article, fetchArticleById, changeArticleStatus } = useArticleStore()
  const { user, users, fetchUsers } = useAuthStore()
  const { loading, setLoading, showErrorToast, showSuccessToast } = useUIStore()
  const { socket, connect, joinDiscussion, leaveDiscussion } = useSocketStore()
  const isMobile = useMobile()

  const [searchText, setSearchText] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [showSidebar, setShowSidebar] = useState(!isMobile)
  const [activeTab, setActiveTab] = useState("participants")
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [publishReason, setPublishReason] = useState("")
  const [socketConnected, setSocketConnected] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  // Connect to socket when component mounts
  useEffect(() => {
    const connectToSocket = async () => {
      try {
        if (!socket) {
          await connect()
          setSocketConnected(true)
        }
      } catch (error) {
        console.log("Socket connection failed, real-time features will be disabled")
        showErrorToast("Real-time chat features are currently unavailable")
        setSocketConnected(false)
      }
    }

    connectToSocket()

    return () => {
      if (selectedDiscussionId && socket) {
        leaveDiscussion(selectedDiscussionId)
      }
    }
  }, [])

  // Update socket connection status
  useEffect(() => {
    setSocketConnected(!!socket)
  }, [socket])

  // Load discussions, article data, and users
  useEffect(() => {
    loadDiscussions()
    if (articleId) {
      fetchArticleById(articleId)
    }
    fetchUsers()
  }, [articleId])

  // Join discussion room when a discussion is selected
  useEffect(() => {
    if (selectedDiscussionId) {
      fetchDiscussionById(selectedDiscussionId)
      if (socket) {
        joinDiscussion(selectedDiscussionId)
      }
    }
  }, [selectedDiscussionId, socket])

  // Update sidebar visibility based on mobile state
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false)
    }
  }, [isMobile])

  const loadDiscussions = async () => {
    try {
      setLoading("discussions", true)
      if (articleId) {
        await fetchDiscussions(articleId)
      } else {
        await fetchDiscussions("all")
      }
    } catch (error) {
      showErrorToast("Failed to load discussions")
    } finally {
      setLoading("discussions", false)
    }
  }

  const handleSelectDiscussion = (discussionId: string) => {
    if (selectedDiscussionId && socket) {
      leaveDiscussion(selectedDiscussionId)
    }
    setSelectedDiscussionId(discussionId)
  }

  const handleSendMessage = async () => {
    if ((!messageText.trim() && files.length === 0) || !selectedDiscussionId) return

    try {
      setIsUploading(files.length > 0)

      // Upload files if any
      const attachmentIds: string[] = []
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const progress = ((i + 1) / files.length) * 100
          setUploadProgress(progress)

          const formData = new FormData()
          formData.append("file", file)
          formData.append("discussionId", selectedDiscussionId)

          // Here we would normally call an API to upload the file
          // For now, we'll simulate it with a timeout
          await new Promise((resolve) => setTimeout(resolve, 500))

          // In a real implementation, you would get the attachment ID from the API response
          // attachmentIds.push(result.attachmentId)
        }
      }

      // Send message
      await addMessage(selectedDiscussionId, {
        content: messageText.trim(),
        attachments: attachmentIds,
      })

      // Reset state
      setMessageText("")
      setFiles([])
      setUploadProgress(0)
      setIsUploading(false)

      // Refresh discussion data
      await fetchDiscussionById(selectedDiscussionId)
    } catch (error) {
      showErrorToast("Failed to send message")
      setIsUploading(false)
    }
  }

  const handlePublishArticle = async () => {
    if (!articleId) return

    try {
      setLoading("publishArticle", true)
      await changeArticleStatus(articleId, "published", publishReason)
      showSuccessToast("Article has been published successfully")
      setPublishDialogOpen(false)
    } catch (error) {
      showErrorToast("Failed to publish article")
    } finally {
      setLoading("publishArticle", false)
    }
  }

  const getTypeColor = (type: string): "default" | "secondary" | "outline" | "destructive" => {
    const colors: { [key: string]: "default" | "secondary" | "outline" | "destructive" } = {
      general: "default",
      review: "secondary",
      revision: "outline",
      editorial: "destructive",
    }
    return colors[type] || "default"
  }

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getUserById = (userId: string) => {
    return users.find((u) => u._id === userId)
  }

  const isAdmin = user?.role === "admin"
  const isEditor = user?.role === "editor" || user?.role === "chiefEditor"
  const canPublish = isAdmin || isEditor

  // Get all attachments from the current discussion
  const allAttachments =
    discussion?.messages?.reduce((acc: DiscussionAttachment[], message: Message) => {
      if (message.attachments && message.attachments.length > 0) {
        return [...acc, ...message.attachments]
      }
      return acc
    }, []) || []

  // Render discussion list component
  const discussionListComponent = (
    <DiscussionList
      discussions={discussions}
      selectedDiscussionId={selectedDiscussionId}
      onSelectDiscussion={handleSelectDiscussion}
      searchText={searchText}
      onSearchChange={(e) => setSearchText(e.target.value)}
      typeFilter={typeFilter}
      onTypeFilterChange={setTypeFilter}
      getTypeColor={getTypeColor}
    />
  )

  // Render chat area component
  const chatAreaComponent =
    selectedDiscussionId && discussion ? (
      <>
        <DiscussionHeader
          discussion={discussion}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          canPublish={canPublish}
          articleStatus={article?.status}
          publishDialogOpen={publishDialogOpen}
          setPublishDialogOpen={setPublishDialogOpen}
          publishReason={publishReason}
          setPublishReason={setPublishReason}
          handlePublishArticle={handlePublishArticle}
          isPublishing={loading.publishArticle}
          socketConnected={socketConnected}
          getTypeColor={getTypeColor}
        />

        <MessageList
          messages={discussion.messages || []}
          currentUserId={user?._id}
          getUserById={getUserById}
          getInitials={getInitials}
        />

        <MessageInput
          onSendMessage={handleSendMessage}
          messageText={messageText}
          setMessageText={setMessageText}
          files={files}
          setFiles={setFiles}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />
      </>
    ) : (
      <EmptyState title="No discussion selected" description="Select a discussion from the list to view messages" />
    )

  // Render sidebar component
  const sidebarComponent = discussion && (
    <DiscussionSidebar
      discussion={discussion}
      article={article}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      getUserById={getUserById}
      getInitials={getInitials}
      allAttachments={allAttachments}
      canPublish={canPublish}
      setPublishDialogOpen={setPublishDialogOpen}
    />
  )

  return (
    <ResponsiveLayout
      discussionList={discussionListComponent}
      chatArea={chatAreaComponent}
      sidebar={sidebarComponent}
      showSidebar={showSidebar}
      selectedDiscussion={discussion}
      isMobile={isMobile}
    />
  )
}

export default DiscussionManage