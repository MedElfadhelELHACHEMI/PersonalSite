import { useCallback } from 'react'

/**
 * Hook for SVG mouse event handlers
 * @param svgRef Reference to the SVG element
 * @param handleMouseDown Function to handle mouse down events
 * @param handleThrottledMouseMove Function to handle throttled mouse move events
 * @param endDrawing Function to end drawing
 * @param clearDrawing Function to clear all paths
 * @returns Mouse event handlers for SVG element
 */
export const useMouseHandlers = (
  svgRef: React.RefObject<SVGSVGElement>,
  handleMouseDown: (row: number, col: number) => void,
  handleThrottledMouseMove: (x: number, y: number) => void,
  endDrawing: () => void,
  clearDrawing: () => void,
  dotSpacing: number
) => {
  // Handle mouse events for drawing
  const onMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return

      try {
        const rect = svgRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Find the nearest dot via direct grid calculation
        const col = Math.round((x - dotSpacing / 2) / dotSpacing)
        const row = Math.round((y - dotSpacing / 2) / dotSpacing)

        handleMouseDown(row, col)
      } catch (error) {
        console.error('Error in mouse down:', error)
      }
    },
    [svgRef, handleMouseDown, dotSpacing]
  )

  // Handle document-wide mouse move
  const onDocumentMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!svgRef.current) return

      try {
        const rect = svgRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        handleThrottledMouseMove(x, y)
      } catch (error) {
        console.error('Error in document mouse move:', error)
      }
    },
    [svgRef, handleThrottledMouseMove]
  )

  // Handle Document mouse down event
  const onDocumentMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!svgRef.current) return

      try {
        // Ignore clicks on interactive elements
        const target = e.target as HTMLElement
        if (target.closest('.interactive-element')) {
          return
        }

        const rect = svgRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Find the nearest dot via direct grid calculation
        const col = Math.round((x - dotSpacing / 2) / dotSpacing)
        const row = Math.round((y - dotSpacing / 2) / dotSpacing)

        handleMouseDown(row, col)
      } catch (error) {
        console.error('Error in document mouse down:', error)
      }
    },
    [svgRef, handleMouseDown, dotSpacing]
  )

  // Direct SVG mouse move handler - uses the throttled version
  const onMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return

      try {
        const rect = svgRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        handleThrottledMouseMove(x, y)
      } catch (error) {
        console.error('Error in SVG mouse move:', error)
      }
    },
    [svgRef, handleThrottledMouseMove]
  )

  // Direct SVG mouse up handler
  const onMouseUp = useCallback(() => {
    endDrawing()
  }, [endDrawing])

  // Mouse leave handler - no longer needed
  const onMouseLeave = useCallback(() => {
    // handleMouseUp will be called by document mouseup event
  }, [])

  // Double click handler to clear paths
  const onDoubleClick = useCallback(() => {
    clearDrawing()
  }, [clearDrawing])

  return {
    onMouseDown,
    onDocumentMouseDown,
    onDocumentMouseMove,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onDoubleClick,
  }
}
