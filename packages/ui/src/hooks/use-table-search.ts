import { useState, useRef, useEffect, useCallback } from "react"

export function useTableSearch(delay = 300) {
  const [search, setSearchValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setSearch = useCallback(
    (value: string) => {
      setSearchValue(value)

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setDebouncedSearch(value)
        timeoutRef.current = null
      }, delay)
    },
    [delay],
  )

  const resetSearch = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setSearchValue("")
    setDebouncedSearch("")
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { search, debouncedSearch, setSearch, resetSearch }
}
