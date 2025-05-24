"use client"

import type React from "react"
import { Users, Paperclip, FileText, Eye, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { ScrollArea } from "../../components/ui/scroll-area"
import type { Discussion, DiscussionAttachment } from "../../types/discussion"
import type { User } from "../../store/authStore"

interface DiscussionSidebarProps {
  discussion: Discussion
  article?: any
  activeTab: string
  setActiveTab: (tab: string) => void
  getUserById: (userId: string) => User | undefined
  getInitials: (name: string) => string
  allAttachments: DiscussionAttachment[]
  canPublish: boolean
  setPublishDialogOpen: (open: boolean) => void
}

export const DiscussionSidebar: React.FC<DiscussionSidebarProps> = ({
  discussion,
  article,
  activeTab,
  setActiveTab,
  getUserById,
  getInitials,
  allAttachments,
  canPublish,
  setPublishDialogOpen,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="p-4 border-b">
        <Tabs defaultValue="participants" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="attachments">
              <Paperclip className="h-4 w-4 mr-2" />
              Attachments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="mt-4">
            <h3 className="text-sm font-medium mb-2">Participants ({discussion.participants.length})</h3>
            <ScrollArea className="h-[calc(100vh-350px)] pr-2">
              <div className="space-y-2">
                {discussion.participants.map((participantId, index) => {
                  const participantUser = getUserById(participantId)
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                      <Avatar className="h-8 w-8">
                        {participantUser?.avatarUrl ? (
                          <AvatarImage
                            src={participantUser.avatarUrl || "/placeholder.svg"}
                            alt={participantUser.name}
                          />
                        ) : (
                          <AvatarFallback>
                            {participantUser ? getInitials(participantUser.name) : getInitials(participantId)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{participantUser?.name || "Unknown User"}</div>
                        {participantUser?.role && (
                          <div className="text-xs text-muted-foreground">
                            {participantUser.role.charAt(0).toUpperCase() + participantUser.role.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="attachments" className="mt-4">
            <h3 className="text-sm font-medium mb-2">Attachments ({allAttachments.length})</h3>
            <ScrollArea className="h-[calc(100vh-350px)] pr-2">
              {allAttachments.length > 0 ? (
                <div className="space-y-2">
                  {allAttachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 shrink-0" />
                        <div className="text-sm truncate">{attachment.originalName}</div>
                      </div>
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline ml-2 shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No attachments in this discussion.</div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Article information */}
      {article && (
        <div className="p-4 border-t mt-auto">
          <h3 className="text-sm font-medium mb-2">Article Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Title:</span> <span className="line-clamp-2">{article.title}</span>
            </div>
            <div>
              <span className="font-medium">Status:</span>{" "}
              <Badge variant={article.status === "published" ? "default" : "outline"}>{article.status}</Badge>
            </div>
            {article.submittedDate && (
              <div>
                <span className="font-medium">Submitted:</span> {new Date(article.submittedDate).toLocaleDateString()}
              </div>
            )}

            {/* Publish button in sidebar for easy access */}
            {canPublish && article?.status === "accepted" && (
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => setPublishDialogOpen(true)}>
                  <Check className="h-4 w-4 mr-2" />
                  Publish Article
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}