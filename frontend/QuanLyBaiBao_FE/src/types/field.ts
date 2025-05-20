export interface Field {
    _id?: string;
    name: string;
    description?: string;
    code?: string;
    parent?: string;
    level?: number;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: Field[]; // nếu có dùng populate virtual
  }