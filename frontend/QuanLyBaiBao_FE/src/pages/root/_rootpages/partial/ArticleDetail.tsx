import React from "react"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Separator } from "../../../../components/ui/separator"
import type { Article, ArticleAuthor } from "../../../../types/article"

interface ArticleDetailProps {
  article: Article
  onBack: () => void
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack }) => {
  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="relative h-64 md:h-80 w-full bg-gray-100">
        <img
          src={article.thumbnail || "/placeholder.svg?height=400&width=1200"}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {article.keywords?.map((keyword, idx) => (
            <Badge key={idx} variant="secondary">
              {keyword}
            </Badge>
          ))}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>

        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6">
          <span>Xuất bản: {new Date(article.createdAt).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span>DOI: {article.doi || "Chưa có"}</span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Tóm tắt</h2>
          <p className="text-gray-700 whitespace-pre-line">{article.abstract}</p>
        </div>

        <Separator className="my-6" />

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Tác giả</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(article.authors as ArticleAuthor[])?.map((author, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <div className="font-medium">{author.fullName}</div>
                <div className="text-sm text-gray-500">{author.email}</div>
                <div className="text-sm text-gray-500">
                  {author.institution}, {author.country}
                </div>
                {author.isCorresponding && (
                  <Badge className="mt-1" variant="outline">
                    Tác giả liên hệ
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button className="mt-4" onClick={onBack}>
          Quay lại danh sách
        </Button>
      </div>
    </div>
  )
}

export default ArticleDetail
