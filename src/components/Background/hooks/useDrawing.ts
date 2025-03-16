import { useCallback, useRef } from 'react'
import { PathData, Point } from '../types'
import { findNearestDotGridAligned } from '../utils/pathUtils'
import { generatePathFromPoints } from '../utils/pathUtils'
import { createDotAt } from '../utils/gridUtils'
import { throttle } from '../utils/throttle'

/**
 * Hook for managing drawing functionality
 * @param dimensions Canvas dimensions
 * @param dotSpacing Spacing between dots
 * @param lineWidth Width of the drawing lines
 * @param getRandomColor Function to get a random color
 * @param setIsDrawing Function to update drawing state
 * @param setStartDot Function to update start dot state
 * @param setCurrentPoints Function to update current points state
 * @param setCurrentPath Function to update current path state
 * @param setCoveredDots Function to update covered dots state
 * @param setPaths Function to update paths state
 * @returns Drawing-related functions and refs
 */
export const useDrawing = (
  dimensions: { width: number; height: number },
  dotSpacing: number,
  lineWidth: number,
  getRandomColor: () => string,
  setIsDrawing: (value: boolean) => void,
  setStartDot: (value: Point | null) => void,
  setCurrentPoints: (value: Point[]) => void,
  setCurrentPath: (updater: ((prev: PathData | null) => PathData | null) | PathData | null) => void,
  setCoveredDots: (updater: (prev: Set<string>) => Set<string>) => void,
  setPaths: (updater: (prev: PathData[]) => PathData[]) => void
) => {
  // Refs for better performance
  const isDrawingRef = useRef<boolean>(false)
  const currentPathRef = useRef<PathData | null>(null)
  const currentPointsRef = useRef<Point[]>([])
  const startDotRef = useRef<Point | null>(null)

  // Helper function to get a dot at a specific row/col
  const getDotAt = useCallback(
    (row: number, col: number): Point => {
      return createDotAt(row, col, dotSpacing)
    },
    [dotSpacing]
  )

  // Throttled mouse move handler to reduce render cycles
  const handleThrottledMouseMove = useCallback(
    throttle((x: number, y: number) => {
      if (
        !isDrawingRef.current ||
        !startDotRef.current ||
        currentPointsRef.current.length === 0
      ) {
        return
      }

      try {
        const lastPoint =
          currentPointsRef.current[currentPointsRef.current.length - 1]
        const nearestDot = findNearestDotGridAligned(
          x,
          y,
          lastPoint,
          dotSpacing,
          dimensions,
          getDotAt
        )

        if (
          nearestDot &&
          (nearestDot.x !== lastPoint.x || nearestDot.y !== lastPoint.y)
        ) {
          const newPoints = [...currentPointsRef.current, nearestDot]

          // Update refs for performance
          currentPointsRef.current = newPoints

          // Generate new path with rounded corners
          const pathData = generatePathFromPoints(newPoints, 12)

          if (currentPathRef.current) {
            currentPathRef.current = {
              ...currentPathRef.current,
              d: pathData,
              points: newPoints,
            }
          }

          // Batch state updates
          setCurrentPoints(newPoints)
          setCurrentPath((prev) =>
            prev
              ? {
                  ...prev,
                  d: pathData,
                  points: newPoints,
                }
              : null
          )

          // Mark the dot as covered
          setCoveredDots((prev) => {
            const newSet = new Set(prev)
            newSet.add(nearestDot.id)

            // Also mark dots between the last point and current point as covered
            if (lastPoint.row === nearestDot.row) {
              // Horizontal line
              const minCol = Math.min(lastPoint.col, nearestDot.col)
              const maxCol = Math.max(lastPoint.col, nearestDot.col)

              for (let col = minCol; col <= maxCol; col++) {
                newSet.add(`dot-${lastPoint.row}-${col}`)
              }
            } else if (lastPoint.col === nearestDot.col) {
              // Vertical line
              const minRow = Math.min(lastPoint.row, nearestDot.row)
              const maxRow = Math.max(lastPoint.row, nearestDot.row)

              for (let row = minRow; row <= maxRow; row++) {
                newSet.add(`dot-${row}-${lastPoint.col}`)
              }
            }

            return newSet
          })
        }
      } catch (error) {
        console.error('Error in throttled mouse move:', error)
      }
    }, 16), // Throttle to ~60fps
    [dimensions, dotSpacing, getDotAt, setCurrentPoints, setCurrentPath, setCoveredDots]
  )

  // Start drawing at a specific point
  const startDrawing = useCallback(
    (row: number, col: number) => {
      try {
        // Ensure within bounds
        const maxCol = Math.floor(dimensions.width / dotSpacing)
        const maxRow = Math.floor(dimensions.height / dotSpacing)

        if (col < 0 || col > maxCol || row < 0 || row > maxRow) {
          return
        }

        const nearestDot = getDotAt(row, col)

        if (nearestDot) {
          // Generate a random color for this new path
          const newColor = getRandomColor()

          // Update refs for performance
          isDrawingRef.current = true
          startDotRef.current = nearestDot
          currentPointsRef.current = [nearestDot]

          const newPath = {
            id: `path-${Date.now()}`,
            color: newColor,
            width: lineWidth,
            d: `M ${nearestDot.x} ${nearestDot.y}`,
            points: [nearestDot],
          }

          currentPathRef.current = newPath

          // Update state
          setIsDrawing(true)
          setStartDot(nearestDot)
          setCurrentPoints([nearestDot])
          setCurrentPath(newPath)

          // Mark the starting dot as covered
          setCoveredDots((prev) => {
            const newSet = new Set(prev)
            newSet.add(nearestDot.id)
            return newSet
          })
        }
      } catch (error) {
        console.error('Error starting drawing:', error)
      }
    },
    [
      dimensions,
      dotSpacing,
      getRandomColor,
      lineWidth,
      getDotAt,
      setIsDrawing,
      setStartDot,
      setCurrentPoints,
      setCurrentPath,
      setCoveredDots,
    ]
  )

  // End drawing and finalize the path
  const endDrawing = useCallback(() => {
    if (!isDrawingRef.current || !currentPathRef.current) return

    try {
      if (currentPointsRef.current.length > 1) {
        // Add the current path to the paths list
        const finalPath = {
          ...currentPathRef.current,
          // Ensure valid data
          d: currentPathRef.current.d || '',
          points: [...currentPointsRef.current],
        }

        setPaths((prev) => [...prev, finalPath])
      }

      // Reset state and refs
      isDrawingRef.current = false
      currentPathRef.current = null
      currentPointsRef.current = []
      startDotRef.current = null

      setIsDrawing(false)
      setCurrentPath(null)
      setCurrentPoints([])
      setStartDot(null)
    } catch (error) {
      console.error('Error ending drawing:', error)

      // Reset state even on error
      setIsDrawing(false)
      setCurrentPath(null)
      setCurrentPoints([])
      setStartDot(null)
    }
  }, [setPaths, setIsDrawing, setCurrentPath, setCurrentPoints, setStartDot])

  // Clear all paths
  const clearDrawing = useCallback(() => {
    setPaths([])
    setCurrentPath(null)
    setCurrentPoints([])
    setStartDot(null)
    setCoveredDots(new Set())

    // Reset refs
    currentPathRef.current = null
    currentPointsRef.current = []
    startDotRef.current = null
    isDrawingRef.current = false
  }, [setPaths, setCurrentPath, setCurrentPoints, setStartDot, setCoveredDots])

  return {
    isDrawingRef,
    currentPathRef,
    currentPointsRef,
    startDotRef,
    startDrawing,
    endDrawing,
    clearDrawing,
    handleThrottledMouseMove,
    getDotAt,
  }
}
