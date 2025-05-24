import type React from "react"
import { Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import type { User } from "../../store/authStore"

interface ReadReceiptsProps {
  readBy: { userId: string; readAt: Date | string }[]
  getUserById: (userId: string) => User | undefined
  getInitials: (name: string) => string
  maxDisplayed?: number
}

export const ReadReceipts: React.FC<ReadReceiptsProps> = ({ readBy, getUserById, getInitials, maxDisplayed = 3 }) => {
  if (!readBy || readBy.length === 0) {
    return (
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <Check className="h-3 w-3 mr-1" /> Sent
      </div>
    )
  }

  const displayedUsers = readBy.slice(0, maxDisplayed)
  const remainingCount = readBy.length - maxDisplayed

  return (
    <div className="flex items-center text-xs text-muted-foreground mt-1">
      <Check className="h-3 w-3 mr-1" /> Read by
      <div className="flex -space-x-1 ml-1">
        <TooltipProvider>
          {displayedUsers.map(({ userId, readAt }) => {
            const user = getUserById(userId)
            const readTime = typeof readAt === "string" ? new Date(readAt) : readAt

            return (
              <Tooltip key={userId}>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Avatar className="h-4 w-4 border border-background">
                      {user?.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt={user.name} />
                      ) : (
                        <AvatarFallback className="text-[8px]">{user ? getInitials(user.name) : "UN"}</AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs p-2">
                  <p>{user?.name || "Unknown User"}</p>
                  <p className="text-muted-foreground">Read {readTime.toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}

          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[8px] cursor-help">
                  +{remainingCount}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs p-2">
                <p>And {remainingCount} more users</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  )
}