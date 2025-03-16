import { useCallback, useRef } from 'react'
import { AnimationSegment, PathData } from '../types'
import { generatePathFromPoints } from '../utils/pathUtils'

/**
 * Hook for managing animation-related functionality
 * @param svgRef Reference to the SVG element
 * @param animationSegments Animation segments to animate
 * @param lineWidth Width of the animation lines
 * @param setAnimationComplete Function to set animation complete state
 * @param setPaths Function to update paths state
 * @param setCoveredDots Function to update covered dots state
 * @returns Function to run initial animation
 */
export const useAnimation = (
  svgRef: React.RefObject<SVGSVGElement>,
  animationSegments: AnimationSegment[],
  lineWidth: number,
  setAnimationComplete: (value: boolean) => void,
  setPaths: (updater: (prev: PathData[]) => PathData[]) => void,
  setCoveredDots: (updater: (prev: Set<string>) => Set<string>) => void
) => {
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Initial animation with requestAnimationFrame
  const runInitialAnimation = useCallback(() => {
    if (animationSegments.length === 0) return

    const totalDuration = 5000 // 5 seconds for full animation

    const easeInOutQuart = (t: number) => {
      return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2
    }

    const animate = (timestamp: number) => {
      try {
        if (!lastTimeRef.current) {
          lastTimeRef.current = timestamp
        }

        const elapsed = timestamp - lastTimeRef.current
        const rawProgress = Math.min(elapsed / totalDuration, 1)
        const easedProgress = easeInOutQuart(rawProgress)

        // Calculate visible segments
        const totalSegments = animationSegments.length
        const segmentsToShow = Math.ceil(totalSegments * easedProgress)

        // Update SVG element
        if (svgRef.current) {
          // Remove existing animation paths
          const existingPaths = svgRef.current.querySelectorAll(
            '[data-anim-path="true"]'
          )
          existingPaths.forEach((path) => path.remove())

          // Create new animation paths
          animationSegments
            .slice(0, segmentsToShow)
            .forEach((segment, index) => {
              if (index < segmentsToShow - 1) {
                // Show this segment fully
                const path = document.createElementNS(
                  'http://www.w3.org/2000/svg',
                  'path'
                )
                path.setAttribute('data-anim-path', 'true')
                path.setAttribute(
                  'd',
                  generatePathFromPoints(segment.points, 12)
                )
                path.setAttribute('stroke', segment.color || '#666')
                path.setAttribute('stroke-width', String(lineWidth))
                path.setAttribute('stroke-linecap', 'round')
                path.setAttribute('stroke-linejoin', 'round')
                path.setAttribute('fill', 'none')
                path.setAttribute('stroke-opacity', '0.8')
                svgRef.current?.appendChild(path)
              } else {
                // This is the currently animating segment
                const segmentProgress = (easedProgress * totalSegments) % 1
                const pointsToShow = Math.max(
                  2,
                  Math.floor(segment.points.length * segmentProgress)
                )
                const visiblePoints = segment.points.slice(0, pointsToShow)

                const path = document.createElementNS(
                  'http://www.w3.org/2000/svg',
                  'path'
                )
                path.setAttribute('data-anim-path', 'true')
                path.setAttribute(
                  'd',
                  generatePathFromPoints(visiblePoints, 12)
                )
                path.setAttribute('stroke', segment.color || '#666')
                path.setAttribute('stroke-width', String(lineWidth))
                path.setAttribute('stroke-linecap', 'round')
                path.setAttribute('stroke-linejoin', 'round')
                path.setAttribute('fill', 'none')
                path.setAttribute('stroke-opacity', '0.8')
                svgRef?.current?.appendChild(path)
              }
            })
        }

        // Continue animation or finish
        if (rawProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
        } else {
          // Animation complete
          setAnimationComplete(true)

          // Add the animation paths to the paths list
          const animationPaths: PathData[] = animationSegments.map(
            (segment, index) => {
              const path = generatePathFromPoints(segment.points, 12)
              return {
                id: `path-initial-animation-${index}`,
                color: segment.color,
                width: lineWidth,
                d: path,
                points: segment.points,
              }
            }
          )

          // Batch state updates
          setPaths((prev) => [...prev, ...animationPaths])

          // Mark dots as covered
          const covered = new Set<string>()
          animationSegments.forEach((segment) => {
            segment.points.forEach((point) => {
              covered.add(point.id)
            })
          })

          setCoveredDots((prev) => {
            const newCovered = new Set(prev)
            covered.forEach((id) => newCovered.add(id))
            return newCovered
          })
        }
      } catch (error) {
        console.error('Error in animation frame:', error)
        setAnimationComplete(true) // Ensure we don't get stuck
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [
    animationSegments,
    svgRef,
    lineWidth,
    setAnimationComplete,
    setPaths,
    setCoveredDots,
  ])

  return {
    runInitialAnimation,
    animationFrameRef,
  }
}
