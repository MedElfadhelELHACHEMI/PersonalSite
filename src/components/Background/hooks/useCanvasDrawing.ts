import { useCallback } from 'react'
import { Point } from '../types'

/**
 * Hook for managing canvas drawing
 * @param canvasRef Reference to the canvas element
 * @param dotGrid Grid of dots to draw
 * @param coveredDots Set of dot IDs that are covered by paths
 * @param dotRadius Radius of each dot
 * @returns Function to draw dots on canvas
 */
export const useCanvasDrawing = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  dotGrid: Point[],
  coveredDots: Set<string>,
  dotRadius: number
) => {
  // Draw dots on canvas (much more efficient than SVG for large numbers of dots)
  const drawDotsOnCanvas = useCallback(() => {
    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set dot style
      ctx.fillStyle = '#666'

      // Draw only dots that aren't covered
      for (const dot of dotGrid) {
        if (!coveredDots.has(dot.id)) {
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } catch (error) {
      console.error('Error drawing dots on canvas:', error)
    }
  }, [dotGrid, coveredDots, dotRadius, canvasRef])

  return {
    drawDotsOnCanvas,
  }
}
