import { useCallback, useEffect, useRef, useState } from "react"

export function useInfiniteScroll<T>(
  allData: T[],
  filterFn: (item: T, query: string) => boolean,
  query: string,
  pageSize = 20
) {
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const q = query.trim().toLowerCase()
  const filtered = q.length > 1 ? allData.filter((item) => filterFn(item, q)) : allData
  const items = filtered.slice(0, page * pageSize)
  const hasMore = items.length < filtered.length

  const loadMore = useCallback(() => setPage((p) => p + 1), [])

  useEffect(() => {
    setPage(1)
  }, [query])

  useEffect(() => {
    const el = loaderRef.current
    if (!el || !hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  return { items, hasMore, loaderRef, total: filtered.length }
}
