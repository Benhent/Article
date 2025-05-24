"use client"

import React from "react"
import { formatDistanceToNow } from "date-fns"
import { Paperclip } from "lucide-react"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import type { Message } from "../../types/discussion"
import type { User } from "../../store/authStore"

interface MessageListProps {
  messages: Message[]
  currentUserId?: string
  getUserById: (userId: string) => User | undefined
  getInitials: (name: string) => string
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, getUserById, getInitials }) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No messages yet. Start the conversation!
      </div>
    )
  }

  return (
    <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
      {messages.map((message, index) => {
        const sender = getUserById(message.senderId)
        const isCurrentUser = message.senderId === currentUserId

        return (
          <div key={index} className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] md:max-w-[70%] rounded-lg p-3 ${
                isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="h-6 w-6">
                  {sender?.avatarUrl ? (
                    <AvatarImage src={sender.avatarUrl || "/placeholder.svg"} alt={sender.name} />
                  ) : (
                    <AvatarFallback>{sender ? getInitials(sender.name) : "UN"}</AvatarFallback>
                  )}
                </Avatar>
                <div className="text-sm font-semibold">{isCurrentUser ? "You" : sender?.name || "Unknown User"}</div>
              </div>
              <div className="break-words">{message.content}</div>

              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((attachment, idx) => (
                    <div key={idx} className="flex items-center text-sm">
                      <Paperclip className="h-3 w-3 mr-1 shrink-0" />
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline truncate"
                      >
                        {attachment.originalName}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs mt-1 opacity-70">
                {message.sentAt && formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        )
      })}
    </ScrollArea>
  )
}