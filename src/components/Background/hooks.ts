import { useState, useEffect, useCallback, useRef, RefObject } from 'react'

/**
 * Custom hook to handle window resize with debounce
 * @returns Current window dimensions
 */
export const useWindowSize = (debounceMs = 200) => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  })

  // Use a ref to store the timeout ID
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initialize dimensions on mount
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleResize = () => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout for debounce
      timeoutRef.current = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, debounceMs)
    }

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [debounceMs])

  return dimensions
}

/**
 * Custom hook to handle keyboard shortcuts
 * @param keyMap Object mapping keys to handler functions
 */
export const useKeyboardShortcuts = (keyMap: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const handler = keyMap[e.key]
      if (handler) {
        handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyMap])
}

/**
 * Custom hook to observe element dimensions using ResizeObserver
 * More efficient than listening to window resize events
 * @param ref Reference to the element to observe
 */
export const useResizeObserver = (ref: RefObject<Element>) => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  })

  useEffect(() => {
    if (!ref.current) return

    // Initialize dimensions to window size initially
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Create the observer
    const observer = new ResizeObserver((entries) => {
      // Get the first entry (there should only be one)
      const entry = entries[0]

      if (entry) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    // Start observing
    observer.observe(ref.current)

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [ref])

  return dimensions
}

/**
 * Custom hook to create an off-screen canvas for drawing operations
 * Can be used for performance-intensive operations
 * @param width Canvas width
 * @param height Canvas height
 */
export const useOffscreenCanvas = (width: number, height: number) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    // Create canvas element if it doesn't exist
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }

    // Update dimensions when they change
    if (canvasRef.current) {
      canvasRef.current.width = width
      canvasRef.current.height = height
    }
  }, [width, height])

  const getContext = useCallback(() => {
    if (canvasRef.current) {
      return canvasRef.current.getContext('2d')
    }
    return null
  }, [])

  return { canvasRef, getContext }
}

/**
 * Custom hook for efficient request animation frame loop
 * @param callback Function to call on each animation frame
 * @param dependencies Dependencies that trigger loop restart
 */
export const useAnimationFrame = (
  callback: (deltaTime: number) => void,
  dependencies: any[] = [],
) => {
  // Use refs for values that shouldn't trigger rerenders
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        callback(deltaTime)
      }

      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    },
    [callback],
  )

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [animate, ...dependencies])
}
