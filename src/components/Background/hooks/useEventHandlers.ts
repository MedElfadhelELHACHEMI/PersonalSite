import { useCallback, useEffect } from 'react'
import { throttle } from '../utils/throttle'

/**
 * Hook for managing window event handlers
 * @param setDimensions Function to update dimensions state
 * @param setViewport Function to update viewport state
 * @param canvasRef Reference to the canvas element
 * @param drawDotsOnCanvas Function to draw dots on canvas
 * @returns Event handler setup functions
 */
export const useEventHandlers = (
  setDimensions: (dimensions: { width: number; height: number }) => void,
  setViewport: (viewport: {
    top: number
    left: number
    bottom: number
    right: number
  }) => void,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  drawDotsOnCanvas: () => void,
  clearDrawing: () => void
) => {
  // Handle window resize with debounce
  useEffect(() => {
    if (typeof window === 'undefined') return

    let resizeTimeoutId: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(resizeTimeoutId)
      resizeTimeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
        setViewport({
          top: window.scrollY,
          left: window.scrollX,
          bottom: window.scrollY + window.innerHeight,
          right: window.scrollX + window.innerWidth,
        })

        // Update canvas size
        if (canvasRef.current) {
          canvasRef.current.width = window.innerWidth
          canvasRef.current.height = window.innerHeight
          drawDotsOnCanvas()
        }
      }, 100) // Debounce resize events
    }

    window.addEventListener('resize', handleResize)

    // Initialize canvas size
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeoutId)
    }
  }, [canvasRef, drawDotsOnCanvas, setDimensions, setViewport])

  // Handle scroll events to update viewport
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = throttle(() => {
      setViewport({
        top: window.scrollY,
        left: window.scrollX,
        bottom: window.scrollY + window.innerHeight,
        right: window.scrollX + window.innerWidth,
      })
    }, 100) // Throttle to every 100ms

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setViewport])

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        clearDrawing()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearDrawing])

  // Setup document-wide mouse down handler
  const setupDocumentMouseDown = useCallback(
    (handler: (e: MouseEvent) => void) => {
      document.addEventListener('mousedown', handler)
      return () => {
        document.removeEventListener('mousedown', handler)
      }
    },
    []
  )

  // Setup document-wide mouse event listeners for active drawing
  const setupActiveDrawingHandlers = useCallback(
    (mouseMoveHandler: (e: MouseEvent) => void, mouseUpHandler: () => void) => {
      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)
      return () => {
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
      }
    },
    []
  )

  return {
    setupDocumentMouseDown,
    setupActiveDrawingHandlers,
  }
}
