export interface ApiResponse<T> {
  data: T
  meta?: Record<string, unknown>
}

export interface ListResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
