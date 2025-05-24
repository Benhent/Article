"use client"

import type React from "react"
import { ChevronRight, Check } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import type { Discussion } from "../../types/discussion"

interface DiscussionHeaderProps {
  discussion: Discussion
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  canPublish: boolean
  articleStatus?: string
  publishDialogOpen: boolean
  setPublishDialogOpen: (open: boolean) => void
  publishReason: string
  setPublishReason: (reason: string) => void
  handlePublishArticle: () => Promise<void>
  isPublishing: boolean
  socketConnected: boolean
  getTypeColor: (type: string) => "default" | "secondary" | "outline" | "destructive"
}

export const DiscussionHeader: React.FC<DiscussionHeaderProps> = ({
  discussion,
  showSidebar,
  setShowSidebar,
  canPublish,
  articleStatus,
  publishDialogOpen,
  setPublishDialogOpen,
  publishReason,
  setPublishReason,
  handlePublishArticle,
  isPublishing,
  socketConnected,
  getTypeColor,
}) => {
  return (
    <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div>
        <h2 className="text-xl font-bold">{discussion.subject}</h2>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant={getTypeColor(discussion.type)}>{discussion.type.toUpperCase()}</Badge>
          {!socketConnected && (
            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
              Offline Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Toggle button for sidebar and publish button */}
      <div className="flex gap-2 self-end sm:self-auto">
        {canPublish && articleStatus === "accepted" && (
          <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="hidden sm:flex">
                <Check className="h-4 w-4 mr-2" />
                Publish Article
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button variant="default" size="icon" className="sm:hidden">
                <Check className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Publish Article</DialogTitle>
                <DialogDescription>
                  This will change the article status from "accepted" to "published". This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <label className="block text-sm font-medium mb-2">Reason for publishing</label>
                <Textarea
                  value={publishReason}
                  onChange={(e) => setPublishReason(e.target.value)}
                  placeholder="Enter reason for publishing this article"
                  className="min-h-[100px]"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePublishArticle} disabled={isPublishing || !publishReason.trim()}>
                  {isPublishing ? "Publishing..." : "Publish Article"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
                <ChevronRight className={`h-5 w-5 transition-transform ${showSidebar ? "rotate-180" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showSidebar ? "Hide details" : "Show details"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}