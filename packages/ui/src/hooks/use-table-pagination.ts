import { useState, useEffect, useRef } from "react"

export interface UseTablePaginationOptions {
  filterDeps?: unknown[]
}

export function useTablePagination(options?: UseTablePaginationOptions) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filterDeps = options?.filterDeps
  const serialized = JSON.stringify(filterDeps)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setPage(1)
  }, [serialized])

  const resetPage = () => setPage(1)

  return { page, pageSize, setPage, setPageSize, resetPage }
}
