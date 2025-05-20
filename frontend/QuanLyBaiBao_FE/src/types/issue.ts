import { Article } from "./article";

export interface Issue {
    _id?: string;
    title: string;
    volumeNumber: number;
    issueNumber: number;
    publicationDate: Date | string;
    isPublished: boolean;
    articles?: string[];
    articleDetails?: Article[]; // hoặc Article[] nếu có populate
    createdAt?: Date | string;
    updatedAt?: Date | string;
}