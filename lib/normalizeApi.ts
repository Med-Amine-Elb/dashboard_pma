export type PaginationMeta = {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export type NormalizedList<T> = {
  items: T[]
  pagination: PaginationMeta
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function getFirstArrayProperty(value: unknown, keys: string[]): unknown[] | null {
  if (!isObject(value)) return null
  for (const key of keys) {
    const v = (value as any)[key]
    if (Array.isArray(v)) return v
  }
  return null
}

function normalizePagination(value: unknown): PaginationMeta {
  if (!isObject(value)) return {}

  const page = typeof (value as any).page === "number" ? (value as any).page : undefined
  const limit = typeof (value as any).limit === "number" ? (value as any).limit : undefined
  const total = typeof (value as any).total === "number" ? (value as any).total : undefined
  const totalPages =
    typeof (value as any).totalPages === "number" ? (value as any).totalPages : undefined

  return { page, limit, total, totalPages }
}

/**
 * Normalize common backend pagination/list response shapes into:
 * { items, pagination }
 *
 * Supported shapes:
 * - Array payloads: []
 * - { success, data: { <listKey>: [], pagination } }
 * - { data: { <listKey>: [], pagination } }
 * - Spring Page: { content: [], totalElements, totalPages, size, pageable: { pageNumber } }
 * - { <listKey>: [], pagination }
 */
export function normalizeListResponse<T>(
  raw: unknown,
  listKeys: string[],
): NormalizedList<T> {
  // 1) Direct array
  if (Array.isArray(raw)) {
    return { items: raw as T[], pagination: { total: raw.length } }
  }

  if (!isObject(raw)) {
    return { items: [], pagination: {} }
  }

  // 2) success/data wrapper
  const rawAny = raw as any
  const dataLevel = isObject(rawAny.data) ? rawAny.data : undefined

  // Prefer `data` wrapper if present
  const candidate = dataLevel ?? raw

  // 3) Spring Page-like
  if (Array.isArray((candidate as any).content)) {
    const content = (candidate as any).content as T[]
    const totalElements =
      typeof (candidate as any).totalElements === "number" ? (candidate as any).totalElements : undefined
    const totalPages =
      typeof (candidate as any).totalPages === "number" ? (candidate as any).totalPages : undefined
    const size = typeof (candidate as any).size === "number" ? (candidate as any).size : undefined
    const pageNumber = typeof (candidate as any).pageable?.pageNumber === "number"
      ? (candidate as any).pageable.pageNumber + 1
      : undefined
    return {
      items: content,
      pagination: { page: pageNumber, limit: size, total: totalElements, totalPages },
    }
  }

  // 4) { data: { users/phones/simcards: [] } } or { users: [] }
  const list = getFirstArrayProperty(candidate, listKeys)
  if (list) {
    const pagination =
      normalizePagination((candidate as any).pagination) ||
      normalizePagination((candidate as any).data?.pagination)
    return { items: list as T[], pagination }
  }

  // 5) Sometimes backend returns { data: [] }
  if (Array.isArray(rawAny.data)) {
    return { items: rawAny.data as T[], pagination: { total: rawAny.data.length } }
  }

  return { items: [], pagination: {} }
}

