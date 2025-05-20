export interface ArticleFile {
    _id?: string;
    articleId: string;
    fileName?: string;
    originalName: string;
    fileType: string;
    fileSize?: number;
    filePath?: string;
    fileUrl: string;
    fileVersion: number;
    round: number;
    fileCategory: 'manuscript' | 'cover' | 'figure' | 'supplement' | 'revision' | 'responseToReviewer';
    uploadedBy: string;
    uploadedAt?: Date | string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }