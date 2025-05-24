"use client"

import React, { useState } from "react"
import { X } from "lucide-react"
import { Button } from "../ui/button"
import type { Discussion } from "../../types/discussion"

interface ResponsiveLayoutProps {
  discussionList: React.ReactNode
  chatArea: React.ReactNode
  sidebar: React.ReactNode
  showSidebar: boolean
  selectedDiscussion: Discussion | null
  isMobile: boolean
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  discussionList,
  chatArea,
  sidebar,
  showSidebar,
  selectedDiscussion,
  isMobile,
}) => {
  const [showMobileList, setShowMobileList] = useState(true)

  // On mobile: if a discussion is selected, hide the list and show the chat
  React.useEffect(() => {
    if (isMobile && selectedDiscussion) {
      setShowMobileList(false)
    }
  }, [selectedDiscussion, isMobile])

  if (!isMobile) {
    // Desktop layout
    return (
      <div className="flex h-[calc(100vh-100px)] relative">
        <div className="w-1/3 border-r">{discussionList}</div>
        <div className="flex-grow flex flex-col">{chatArea}</div>
        {showSidebar && <div className="w-80 border-l">{sidebar}</div>}
      </div>
    )
  }

  // Mobile layout
  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">
      {showMobileList ? (
        // Show discussion list on mobile
        <div className="flex-1">{discussionList}</div>
      ) : (
        // Show chat area with back button on mobile
        <div className="flex flex-col h-full">
          <div className="p-2 border-b">
            <Button variant="ghost" size="sm" onClick={() => setShowMobileList(true)} className="flex items-center">
              <X className="h-4 w-4 mr-1" /> Back to Discussions
            </Button>
          </div>
          <div className="flex-1 flex flex-col">{chatArea}</div>
          {showSidebar && <div className="border-t">{sidebar}</div>}
        </div>
      )}
    </div>
  )
}