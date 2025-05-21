export interface Field {
    _id?: string;
    name: string;
    description?: string;
    code?: string;
    parent?: string | Field;
    level?: number;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: Field[];
  }