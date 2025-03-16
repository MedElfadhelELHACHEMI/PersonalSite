import { Point, ViewportRect } from '../types'

/**
 * Creates a dot at a specific row and column
 * @param row Row index
 * @param col Column index
 * @param dotSpacing Spacing between dots
 * @returns A Point object representing the dot
 */
export const createDotAt = (
  row: number,
  col: number,
  dotSpacing: number
): Point => {
  const x = col * dotSpacing + dotSpacing / 2
  const y = row * dotSpacing + dotSpacing / 2
  const id = `dot-${row}-${col}`
  return { x, y, row, col, id }
}

/**
 * Generates a grid of dots visible within the viewport
 * @param dimensions Canvas dimensions
 * @param viewport Current viewport rectangle
 * @param dotSpacing Spacing between dots
 * @param viewportMargin Extra margin around viewport
 * @returns Array of Point objects within the viewport
 */
export const generateDotGrid = (
  dimensions: { width: number; height: number },
  viewport: ViewportRect,
  dotSpacing: number,
  viewportMargin: number
): Point[] => {
  const grid: Point[] = []

  // Calculate the range of rows and columns that are visible in the viewport
  const extendedViewport = {
    top: Math.max(0, viewport.top - viewportMargin),
    left: Math.max(0, viewport.left - viewportMargin),
    bottom: Math.min(dimensions.height, viewport.bottom + viewportMargin),
    right: Math.min(dimensions.width, viewport.right + viewportMargin),
  }

  const startRow = Math.floor(extendedViewport.top / dotSpacing)
  const endRow = Math.ceil(extendedViewport.bottom / dotSpacing)
  const startCol = Math.floor(extendedViewport.left / dotSpacing)
  const endCol = Math.ceil(extendedViewport.right / dotSpacing)

  // Only generate dots within this range
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      grid.push(createDotAt(row, col, dotSpacing))
    }
  }

  return grid
}

/**
 * Marks dots covered by a path segment
 * @param path Path data containing points
 * @param coveredDots Existing set of covered dot IDs
 * @returns Updated set of covered dot IDs
 */
export const updateCoveredDots = (
  path: { points: Point[] },
  coveredDots: Set<string>
): Set<string> => {
  const newCovered = new Set(coveredDots)

  // Add all points in the path to covered dots
  path.points.forEach((point) => {
    if (point && point.id) {
      newCovered.add(point.id)
    }
  })

  // Find and add any dots near the path segments
  for (let i = 0; i < path.points.length - 1; i++) {
    const currentPoint = path.points[i]
    const nextPoint = path.points[i + 1]

    if (!currentPoint || !nextPoint) continue

    // For horizontal segments
    if (currentPoint.row === nextPoint.row) {
      const minCol = Math.min(currentPoint.col, nextPoint.col)
      const maxCol = Math.max(currentPoint.col, nextPoint.col)

      for (let col = minCol; col <= maxCol; col++) {
        const dotId = `dot-${currentPoint.row}-${col}`
        newCovered.add(dotId)
      }
    }

    // For vertical segments
    if (currentPoint.col === nextPoint.col) {
      const minRow = Math.min(currentPoint.row, nextPoint.row)
      const maxRow = Math.max(currentPoint.row, nextPoint.row)

      for (let row = minRow; row <= maxRow; row++) {
        const dotId = `dot-${row}-${currentPoint.col}`
        newCovered.add(dotId)
      }
    }
  }

  return newCovered
}
