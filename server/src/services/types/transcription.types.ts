export interface ListOptions  {
    page?: number;
    limit?: number;
    status?: string; // 'pending'|'processing'|'completed'|'failed' or undefined
    sort?: string;   // e.g. '-createdAt' or 'createdAt'
    search?: string; // optional  search url string (if you add text index)
    from?: Date;   // optional createdAt >= from
    to?: Date; 
}

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
