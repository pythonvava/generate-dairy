export type Role = 'general' | 'manager'

export type UserInfo = {
  id: number
  name: string
  email: string
  department: string
  position: string
  role: Role
}

export type AuthResponse = {
  token: string
  expires_at: string
  user: UserInfo
}

export type SalesPersonSummary = {
  id: number
  name: string
}

export type CustomerSummary = {
  id: number
  name: string
}

export type VisitRecord = {
  id: number
  customer: CustomerSummary
  visit_content: string
  sort_order: number
}

export type Comment = {
  id: number
  commenter: SalesPersonSummary
  body: string
  created_at: string
}

export type DailyReportSummary = {
  id: number
  report_date: string
  sales_person: SalesPersonSummary
  visit_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

export type DailyReportDetail = {
  id: number
  report_date: string
  sales_person: SalesPersonSummary
  visits: VisitRecord[]
  problem: string | null
  plan: string | null
  comments: Comment[]
  created_at: string
  updated_at: string
}

export type Customer = {
  id: number
  name: string
  address: string | null
  phone: string | null
  contact_person: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type SalesPerson = {
  id: number
  name: string
  department: string
  position: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type PaginationMeta = {
  page: number
  per_page: number
  total_count: number
  total_pages: number
}

/** API 共通レスポンスのラッパー型 */
export type ApiResponse<T> = {
  status: 'success'
  data: T
}

/** ページネーション付きレスポンスの型 */
export type PaginatedResponse<T> = {
  status: 'success'
  data: {
    items: T[]
  }
  pagination: PaginationMeta
}

/** API エラーレスポンスの型 */
export type ApiErrorDetail = {
  field: string
  message: string
}

export type ApiError = {
  status: 'error'
  error: {
    code: string
    message: string
    details?: ApiErrorDetail[]
  }
}
