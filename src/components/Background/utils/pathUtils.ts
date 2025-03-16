import { Point } from '../types'

/**
 * Generate a path with rounded corners from a series of points
 * @param points Array of points to create a path from
 * @param cornerRadius The radius for rounded corners
 * @returns SVG path data string
 */
export const generatePathFromPoints = (
  points: Point[],
  cornerRadius: number
): string => {
  if (!points || points.length < 2) return ''

  try {
    let pathData = `M ${points[0].x} ${points[0].y}`

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1]
      const current = points[i]
      const next = points[i + 1]

      if (!prev || !current || !next) continue

      // Check if this is a corner (direction change)
      const prevDirH = current.x !== prev.x
      const nextDirH = next.x !== current.x

      if (prevDirH !== nextDirH) {
        // Calculate curve approach direction
        const hSign = prevDirH ? (prev.x < current.x ? 1 : -1) : 0
        const vSign = !prevDirH ? (prev.y < current.y ? 1 : -1) : 0
        const nextHSign = nextDirH ? (next.x > current.x ? 1 : -1) : 0
        const nextVSign = !nextDirH ? (next.y > current.y ? 1 : -1) : 0

        // Create the curve
        pathData += ` L ${current.x - hSign * cornerRadius} ${
          current.y - vSign * cornerRadius
        }`
        pathData += ` Q ${current.x} ${current.y}, ${
          current.x + nextHSign * cornerRadius
        } ${current.y + nextVSign * cornerRadius}`
      } else {
        // Just a straight line
        pathData += ` L ${current.x} ${current.y}`
      }
    }

    // Add the final point
    const lastPoint = points[points.length - 1]
    if (lastPoint) {
      pathData += ` L ${lastPoint.x} ${lastPoint.y}`
    }

    return pathData
  } catch (error) {
    console.error('Error generating path:', error)
    return ''
  }
}

/**
 * Find nearest dot horizontally or vertically from a starting point
 * @param x X coordinate of the target point
 * @param y Y coordinate of the target point
 * @param startDot Starting point to align with
 * @param dotSpacing Spacing between dots
 * @param dimensions Canvas dimensions
 * @param getDotAt Function to get a dot at specific row/column
 * @returns The nearest dot that aligns with the starting point
 */
export const findNearestDotGridAligned = (
  x: number,
  y: number,
  startDot: Point,
  dotSpacing: number,
  dimensions: { width: number; height: number },
  getDotAt: (row: number, col: number) => Point
): Point | null => {
  if (!startDot) return null

  try {
    // Faster calculation using grid position directly
    const closestCol = Math.round((x - dotSpacing / 2) / dotSpacing)
    const closestRow = Math.round((y - dotSpacing / 2) / dotSpacing)

    // Determine if we should snap horizontally or vertically based on distance
    const horizontalDistance = Math.abs(
      x - (closestCol * dotSpacing + dotSpacing / 2)
    )
    const verticalDistance = Math.abs(
      y - (closestRow * dotSpacing + dotSpacing / 2)
    )
    const isHorizontalCloser = horizontalDistance < verticalDistance

    // Prevent out of bounds
    const maxCol = Math.floor(dimensions.width / dotSpacing)
    const maxRow = Math.floor(dimensions.height / dotSpacing)
    const boundedCol = Math.max(0, Math.min(closestCol, maxCol))
    const boundedRow = Math.max(0, Math.min(closestRow, maxRow))

    // Get the dot directly without searching the array
    if (isHorizontalCloser) {
      // Snap to the same row as startDot, but change column
      return getDotAt(startDot.row, boundedCol)
    } else {
      // Snap to the same column as startDot, but change row
      return getDotAt(boundedRow, startDot.col)
    }
  } catch (error) {
    console.error('Error finding nearest dot:', error)
    return null
  }
}
