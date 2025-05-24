"use client"

import type React from "react"
import { Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { ScrollArea } from "../../components/ui/scroll-area"
import type { Discussion } from "../../types/discussion"

interface DiscussionListProps {
  discussions: Discussion[]
  selectedDiscussionId: string | null
  onSelectDiscussion: (discussionId: string) => void
  searchText: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  getTypeColor: (type: string) => "default" | "secondary" | "outline" | "destructive"
}

export const DiscussionList: React.FC<DiscussionListProps> = ({
  discussions,
  selectedDiscussionId,
  onSelectDiscussion,
  searchText,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  getTypeColor,
}) => {
  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesSearch = discussion.subject.toLowerCase().includes(searchText.toLowerCase())
    const matchesType = typeFilter === "all" || discussion.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Discussions</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={searchText} onChange={onSearchChange} className="pl-8" />
          </div>
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="revision">Revision</SelectItem>
              <SelectItem value="editorial">Editorial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredDiscussions.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">No discussions found.</div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <div
              key={discussion._id}
              className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                selectedDiscussionId === discussion._id ? "bg-gray-100" : ""
              }`}
              onClick={() => onSelectDiscussion(discussion._id!)}
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold truncate mr-2">{discussion.subject}</div>
                <Badge variant={getTypeColor(discussion.type)} className="text-xs shrink-0">
                  {discussion.type}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {discussion.messages && discussion.messages.length > 0
                  ? discussion.messages[discussion.messages.length - 1].content
                  : `${discussion.participants.length} participants`}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {discussion.createdAt && formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  )
}