'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

// Define TypeScript interfaces
interface Point {
  x: number
  y: number
  row: number
  col: number
  id: string
}

interface PathData {
  id: string
  color: string
  width: number
  d: string
  points: Point[]
}

interface AnimationSegment {
  points: Point[]
  color: string
}

interface ViewportRect {
  top: number
  left: number
  bottom: number
  right: number
}

// Throttle utility function to limit function calls
const throttle = (func: Function, delay: number) => {
  let lastCall = 0
  return (...args: any[]) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

const Background: React.FC = () => {
  const { theme } = useTheme()

  // Refs for better performance
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isDrawingRef = useRef<boolean>(false)
  const currentPathRef = useRef<PathData | null>(null)
  const currentPointsRef = useRef<Point[]>([])
  const startDotRef = useRef<Point | null>(null)
  const lastTimeRef = useRef<number>(0)

  // State
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  })
  const [paths, setPaths] = useState<PathData[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<PathData | null>(null)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const [startDot, setStartDot] = useState<Point | null>(null)
  const [coveredDots, setCoveredDots] = useState<Set<string>>(new Set())
  const [animationComplete, setAnimationComplete] = useState(false)
  const [animationSegments, setAnimationSegments] = useState<
    AnimationSegment[]
  >([])
  const [viewport, setViewport] = useState<ViewportRect>({
    top: 0,
    left: 0,
    bottom: typeof window !== 'undefined' ? window.innerHeight : 800,
    right: typeof window !== 'undefined' ? window.innerWidth : 1000,
  })

  // Constants
  const dotSpacing = 23
  const dotRadius = 0.5
  const lineWidth = 7
  const cornerRadius = 12
  const viewportMargin = 0 // Extra margin around viewport for smoother experience

  // Custom colors as specified
  const customColors = useMemo(
    () => ({
      vermilion: '#f24236ff',
      blueNcs: '#2e86abff',
      jade: '#04a777ff',
      saffron: '#e1bc29ff',
    }),
    [],
  )

  // Colors array for user drawing using the custom colors
  const colors = useMemo(
    () => [
      customColors.vermilion,
      customColors.blueNcs,
      customColors.jade,
      customColors.saffron,
    ],
    [customColors],
  )

  // Generate a random color
  const getRandomColor = useCallback(() => {
    return colors[Math.floor(Math.random() * colors.length)]
  }, [colors])

  // Generate virtualized dot grid data - only dots in or near the viewport
  const dotGrid = useMemo(() => {
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
        const x = col * dotSpacing + dotSpacing / 2
        const y = row * dotSpacing + dotSpacing / 2
        const id = `dot-${row}-${col}`
        grid.push({ x, y, row, col, id })
      }
    }

    return grid
  }, [dimensions, dotSpacing, viewport, viewportMargin])

  // For calculations requiring full grid, use this function to get a dot at a specific row/col
  const getDotAt = useCallback(
    (row: number, col: number): Point => {
      const x = col * dotSpacing + dotSpacing / 2
      const y = row * dotSpacing + dotSpacing / 2
      const id = `dot-${row}-${col}`
      return { x, y, row, col, id }
    },
    [dotSpacing],
  )

  // Generate a path with rounded corners
  const generatePathFromPoints = useCallback(
    (points: Point[]): string => {
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
            pathData += ` L ${current.x - hSign * cornerRadius} ${current.y - vSign * cornerRadius}`
            pathData += ` Q ${current.x} ${current.y}, ${current.x + nextHSign * cornerRadius} ${current.y + nextVSign * cornerRadius}`
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
    },
    [cornerRadius],
  )

  // Find nearest dot horizontally or vertically - more efficient implementation
  const findNearestDotGridAligned = useCallback(
    (x: number, y: number, startDot: Point): Point | null => {
      if (!startDot) return null

      try {
        // Faster calculation using grid position directly
        const closestCol = Math.round((x - dotSpacing / 2) / dotSpacing)
        const closestRow = Math.round((y - dotSpacing / 2) / dotSpacing)

        // Determine if we should snap horizontally or vertically based on distance
        const horizontalDistance = Math.abs(
          x - (closestCol * dotSpacing + dotSpacing / 2),
        )
        const verticalDistance = Math.abs(
          y - (closestRow * dotSpacing + dotSpacing / 2),
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
    },
    [dimensions, dotSpacing, getDotAt],
  )

  // Create abstract line animation paths
  const createAnimationSegments = useCallback(() => {
    try {
      const width = dimensions.width
      const height = dimensions.height
      const segments: AnimationSegment[] = []
      const numLines = 4 // Number of abstract lines

      // Calculate center of the screen
      const centerX = width / 2
      const centerY = height / 2

      // Define a central area (center third of the screen)
      const centralAreaMinX = width / 3
      const centralAreaMaxX = (width / 3) * 2
      const centralAreaMinY = height / 3
      const centralAreaMaxY = (height / 3) * 2

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
        const segmentCount = Math.floor(Math.random() * 4) + 4 // 4-7 segments

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
  }, [dotGrid, coveredDots, dotRadius])

  // Initial animation with requestAnimationFrame
  const runInitialAnimation = useCallback(() => {
    if (animationSegments.length === 0 || animationComplete) return

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
            '[data-anim-path="true"]',
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
                  'path',
                )
                path.setAttribute('data-anim-path', 'true')
                path.setAttribute('d', generatePathFromPoints(segment.points))
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
                  Math.floor(segment.points.length * segmentProgress),
                )
                const visiblePoints = segment.points.slice(0, pointsToShow)

                const path = document.createElementNS(
                  'http://www.w3.org/2000/svg',
                  'path',
                )
                path.setAttribute('data-anim-path', 'true')
                path.setAttribute('d', generatePathFromPoints(visiblePoints))
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
              const path = generatePathFromPoints(segment.points)
              return {
                id: `path-initial-animation-${index}`,
                color: segment.color,
                width: lineWidth,
                d: path,
                points: segment.points,
              }
            },
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
    animationComplete,
    generatePathFromPoints,
    lineWidth,
    setAnimationComplete,
    setPaths,
    setCoveredDots,
  ])

  // Set up animation segments
  useEffect(() => {
    if (
      !animationComplete &&
      dotGrid.length > 0 &&
      animationSegments.length === 0
    ) {
      try {
        const segments = createAnimationSegments()
        if (segments && segments.length > 0) {
          setAnimationSegments(segments)
        }
      } catch (error) {
        console.error('Error setting up animation:', error)
        setAnimationComplete(true) // Prevent infinite loop on error
      }
    }
  }, [
    dotGrid.length,
    animationComplete,
    createAnimationSegments,
    animationSegments.length,
    setAnimationSegments,
    setAnimationComplete,
  ])

  // Start animation when segments are ready
  useEffect(() => {
    if (animationSegments.length > 0 && !animationComplete) {
      return runInitialAnimation()
    }
  }, [animationSegments, animationComplete, runInitialAnimation])

  // Update canvas when dot grid or covered dots change
  useEffect(() => {
    drawDotsOnCanvas()
  }, [drawDotsOnCanvas])

  // Handle window resize with debounce and update viewport
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
  }, [drawDotsOnCanvas])

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
  }, [])

  // Update covered dots when a new path is added
  useEffect(() => {
    if (paths.length === 0) {
      setCoveredDots(new Set())
      return
    }

    // Get the most recently added path
    const latestPath = paths[paths.length - 1]
    if (!latestPath || !latestPath.points) return

    // Update covered dots
    setCoveredDots((prevCovered) => {
      const newCovered = new Set(prevCovered)

      // Add all points in the path to covered dots
      latestPath.points.forEach((point) => {
        if (point && point.id) {
          newCovered.add(point.id)
        }
      })

      // Find and add any dots near the path segments
      for (let i = 0; i < latestPath.points.length - 1; i++) {
        const currentPoint = latestPath.points[i]
        const nextPoint = latestPath.points[i + 1]

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
    })
  }, [paths])

  // Clear all paths
  const clearPaths = useCallback(() => {
    setPaths([])
    setCurrentPath(null)
    setCurrentPoints([])
    setStartDot(null)
    setCoveredDots(new Set())

    currentPathRef.current = null
    currentPointsRef.current = []
    startDotRef.current = null
    isDrawingRef.current = false
  }, [setPaths, setCurrentPath, setCurrentPoints, setStartDot, setCoveredDots])

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        clearPaths()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearPaths])

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
        const nearestDot = findNearestDotGridAligned(x, y, lastPoint)

        if (
          nearestDot &&
          (nearestDot.x !== lastPoint.x || nearestDot.y !== lastPoint.y)
        ) {
          const newPoints = [...currentPointsRef.current, nearestDot]

          // Update refs for performance
          currentPointsRef.current = newPoints

          // Generate new path with rounded corners
          const pathData = generatePathFromPoints(newPoints)

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
              : null,
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
    [
      findNearestDotGridAligned,
      generatePathFromPoints,
      setCurrentPoints,
      setCurrentPath,
      setCoveredDots,
    ],
  )

  // Handle mouse events for drawing
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return

      try {
        const rect = svgRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Find the nearest dot via direct grid calculation
        const col = Math.round((x - dotSpacing / 2) / dotSpacing)
        const row = Math.round((y - dotSpacing / 2) / dotSpacing)

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
        console.error('Error in mouse down:', error)
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
    ],
  )

  // Handle document-wide mouse move
  const handleDocumentMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!svgRef.current || !isDrawingRef.current) return

      try {
        const rect = svgRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        handleThrottledMouseMove(x, y)
      } catch (error) {
        console.error('Error in document mouse move:', error)
      }
    },
    [handleThrottledMouseMove],
  )

  // Handle document-wide mouse up
  const handleDocumentMouseUp = useCallback(() => {
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
      console.error('Error in document mouse up:', error)

      // Reset state even on error
      setIsDrawing(false)
      setCurrentPath(null)
      setCurrentPoints([])
      setStartDot(null)
    }
  }, [setPaths, setIsDrawing, setCurrentPath, setCurrentPoints, setStartDot])

  // Handle Document mouse down event
  const handleDocumentMouseDown = useCallback(
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

          // Update refs
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
        console.error('Error in document mouse down:', error)
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
    ],
  )

  // Setup document-wide mouse event listeners
  useEffect(() => {
    // Only add document-wide listeners when drawing
    if (isDrawing) {
      document.addEventListener('mousemove', handleDocumentMouseMove)
      document.addEventListener('mouseup', handleDocumentMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    }
  }, [isDrawing, handleDocumentMouseMove, handleDocumentMouseUp])

  // Setup document-wide mouse down listener
  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown)
    }
  }, [handleDocumentMouseDown])

  // Direct SVG mouse move handler - uses the throttled version
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || !isDrawingRef.current) return

      try {
        const rect = svgRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        handleThrottledMouseMove(x, y)
      } catch (error) {
        console.error('Error in SVG mouse move:', error)
      }
    },
    [handleThrottledMouseMove],
  )

  // Direct SVG mouse up handler
  const handleMouseUp = useCallback(() => {
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

      // Reset refs
      isDrawingRef.current = false
      currentPathRef.current = null
      currentPointsRef.current = []
      startDotRef.current = null

      // Reset state
      setIsDrawing(false)
      setCurrentPath(null)
      setCurrentPoints([])
      setStartDot(null)
    } catch (error) {
      console.error('Error in mouse up:', error)

      // Reset state even on error
      setIsDrawing(false)
      setCurrentPath(null)
      setCurrentPoints([])
      setStartDot(null)
    }
  }, [setPaths, setIsDrawing, setCurrentPath, setCurrentPoints, setStartDot])

  // Mouse leave handler - no longer needed
  const handleMouseLeave = useCallback(() => {
    // handleMouseUp will be called by document mouseup event
  }, [])

  // Custom cursor CSS style with theme support
  const cursorStyle = useMemo(
    () => ({
      backgroundColor: theme === 'light' ? '#EDEADE' : 'rgb(33, 33, 33)',
      transition: 'background-color 0.62s ease',
    }),
    [theme],
  )

  // Check if a dot is covered by a line
  const isDotCovered = useCallback(
    (dotId: string) => {
      return coveredDots.has(dotId)
    },
    [coveredDots],
  )

  // Render the component with Canvas optimization
  return (
    <div
      className="fixed inset-0 -z-10 h-screen w-full overflow-hidden"
      style={cursorStyle}
    >
      {/* Canvas for efficiently rendering dots */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute left-0 top-0 h-full w-full"
      />

      {/* SVG for paths and interaction */}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute left-0 top-0 h-full w-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={clearPaths}
      >
        {/* Animation paths are created by requestAnimationFrame */}

        {/* Render permanent drawing paths */}
        {paths
          .filter((path) => path && path.d)
          .map((path) => (
            <path
              key={path.id}
              d={path.d}
              stroke={path.color}
              strokeWidth={path.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="1"
              fill="none"
            />
          ))}

        {/* Render temporary path during drawing */}
        {currentPath && currentPath.d && (
          <path
            d={currentPath.d}
            stroke={currentPath.color}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.8"
            fill="none"
          />
        )}

        {/* Render only visible dots */}
        {dotGrid.map(
          (dot) =>
            !isDotCovered(dot.id) && (
              <circle
                key={dot.id}
                cx={dot.x}
                cy={dot.y}
                r={dotRadius}
                fill="#666"
              />
            ),
        )}
      </svg>

      {/* Hidden info text */}
      <div className="absolute bottom-5 right-5 rounded bg-black bg-opacity-70 p-2 text-xs text-white opacity-30 transition-opacity hover:opacity-100">
        Double-click to clear | Press C to clear
      </div>
    </div>
  )
}

export default React.memo(Background) // Optimize with memo
