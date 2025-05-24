import type React from "react"
import { useRef } from "react"
import { Send, Upload, X, FileText } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Progress } from "../../components/ui/progress"

interface MessageInputProps {
  onSendMessage: () => Promise<void>
  messageText: string
  setMessageText: (text: string) => void
  files: File[]
  setFiles: (files: File[] | ((prevFiles: File[]) => File[])) => void
  isUploading: boolean
  uploadProgress: number
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  messageText,
  setMessageText,
  files,
  setFiles,
  isUploading,
  uploadProgress,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prevFiles: File[]) => [...prevFiles, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles: File[]) => prevFiles.filter((_: File, i: number) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      if (messageText.trim() !== "" || files.length > 0) {
        onSendMessage()
      }
    }
  }

  return (
    <div className="border-t p-4">
      {/* File attachments preview */}
      {files.length > 0 && (
        <div className="mb-3">
          <div className="text-sm font-medium mb-2">Attachments ({files.length})</div>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-1 bg-muted rounded-md p-1 pr-2 text-sm">
                <FileText className="h-3 w-3 shrink-0" />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-muted-foreground hover:text-destructive"
                  type="button"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          {isUploading && (
            <div className="mt-2">
              <Progress value={uploadProgress} className="h-1" />
              <div className="text-xs text-muted-foreground mt-1">Uploading... {Math.round(uploadProgress)}%</div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here... (Ctrl+Enter to send)"
          className="min-h-[80px] resize-none flex-grow"
        />
        <div className="flex sm:flex-col gap-2 self-end">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
          <Button
            variant="outline"
            size="icon"
            onClick={handleOpenFileDialog}
            disabled={isUploading}
            className="shrink-0"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            onClick={onSendMessage}
            disabled={(messageText.trim() === "" && files.length === 0) || isUploading}
            className="shrink-0"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}