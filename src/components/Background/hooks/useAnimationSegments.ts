import { useCallback } from 'react'
import { AnimationSegment, Point } from '../types'
import { createDotAt } from '../utils/gridUtils'

/**
 * Hook for creating animation segments
 * @param dimensions Canvas dimensions
 * @param dotSpacing Spacing between dots
 * @param getRandomColor Function to get a random color
 * @returns Function to create animation segments
 */
export const useAnimationSegments = (
  dimensions: { width: number; height: number },
  dotSpacing: number,
  getRandomColor: () => string,
) => {
  // Helper function to get a dot at a specific row/col
  const getDotAt = useCallback(
    (row: number, col: number): Point => {
      return createDotAt(row, col, dotSpacing)
    },
    [dotSpacing],
  )

  // Create abstract line animation paths
  const createAnimationSegments = useCallback(() => {
    try {
      const width = dimensions.width
      const height = dimensions.height
      const segments: AnimationSegment[] = []
      const numLines = 5 // Number of abstract lines

      // Calculate center of the screen
      const centerX = width / 2
      const centerY = height / 2

      // Helper function to get a dot from the central area - more efficient implementation
      const getCentralDot = (): Point => {
        // Calculate a central dot directly
        const centerCol = Math.floor(width / 2 / dotSpacing)
        const centerRow = Math.floor(height / 2 / dotSpacing)

        // Add some randomization around the center
        const randomOffsetCol =
          Math.floor(Math.random() * (width / 6 / dotSpacing)) -
          Math.floor(width / 12 / dotSpacing)
        const randomOffsetRow =
          Math.floor(Math.random() * (height / 6 / dotSpacing)) -
          Math.floor(height / 12 / dotSpacing)

        const col = Math.max(
          0,
          Math.min(
            centerCol + randomOffsetCol,
            Math.floor(width / dotSpacing) - 1,
          ),
        )
        const row = Math.max(
          0,
          Math.min(
            centerRow + randomOffsetRow,
            Math.floor(height / dotSpacing) - 1,
          ),
        )

        return getDotAt(row, col)
      }

      // Create multiple line segments with different colors
      for (let i = 0; i < numLines; i++) {
        const startDot = getCentralDot()
        const points: Point[] = [startDot]
        const segmentCount = Math.floor(Math.random() * 4) + 7 // 4-7 segments

        let currentPoint = startDot
        for (let j = 0; j < segmentCount; j++) {
          const isHorizontal = j % 2 === 0
          const segmentLength = Math.floor(Math.random() * 7) + 5

          // Direction logic for first segments
          let direction = 1
          if (j < 2) {
            if (isHorizontal) {
              direction = currentPoint.x < centerX ? -1 : 1
            } else {
              direction = currentPoint.y < centerY ? -1 : 1
            }
          } else {
            direction = Math.random() > 0.5 ? 1 : -1
          }

          // Generate points along the segment
          for (let k = 1; k <= segmentLength; k++) {
            let newRow = currentPoint.row
            let newCol = currentPoint.col

            if (isHorizontal) {
              newCol += direction
            } else {
              newRow += direction
            }

            // Check boundaries
            if (
              newCol < 0 ||
              newCol >= Math.floor(width / dotSpacing) ||
              newRow < 0 ||
              newRow >= Math.floor(height / dotSpacing)
            ) {
              break // Stop if we go out of bounds
            }

            const nextDot = getDotAt(newRow, newCol)
            points.push(nextDot)
            currentPoint = nextDot
          }
        }

        // Only add segments with enough points
        if (points.length > 2) {
          segments.push({
            points,
            color: getRandomColor(),
          })
        }
      }

      return segments
    } catch (error) {
      console.error('Error creating animation segments:', error)
      return []
    }
  }, [dimensions, dotSpacing, getRandomColor, getDotAt])

  return {
    createAnimationSegments,
    getDotAt,
  }
}
