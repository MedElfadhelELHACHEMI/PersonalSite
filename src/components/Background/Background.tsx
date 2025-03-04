'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { generateRootPaths } from '@/components/Background/utils'

// Interfaces
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

interface GridConfig {
  dotSpacing?: number
  dotRadius?: number
  lineWidth?: number
  cornerRadius?: number
  backgroundColor?: string
  dotColor?: string
  initialText?: string
  initialTextColor?: string
}

// Sub-components
const DotGrid = ({
  dots,
  dotRadius,
  dotColor,
  coveredDots,
}: {
  dots: Point[]
  dotRadius: number
  dotColor: string
  coveredDots: Set<string>
}) => {
  // Only render dots that aren't covered by lines for better performance
  return dots.map(
    (dot) =>
      !coveredDots.has(dot.id) && (
        <circle
          key={dot.id}
          cx={dot.x}
          cy={dot.y}
          r={dotRadius}
          fill={dotColor}
        />
      ),
  )
}

const Paths = ({
  paths,
  lineWidth,
}: {
  paths: PathData[]
  lineWidth: number
}) => {
  return paths.map((path) => (
    <path
      key={path.id}
      d={path.d}
      stroke={path.color}
      strokeWidth={path.width || lineWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ))
}

// Main component
const InteractiveGridBackground = ({
  config = {},
}: {
  config?: GridConfig
}) => {
  // Default configuration
  const dotSpacing = config.dotSpacing || 20
  const dotRadius = config.dotRadius || 1
  const lineWidth = config.lineWidth || 6
  const cornerRadius = config.cornerRadius || 5
  const backgroundColor = config.backgroundColor || 'rgb(33, 33, 33)'
  const dotColor = config.dotColor || '#666'
  const initialText =
    config.initialText !== undefined ? config.initialText : 'Hi'

  // Custom colors
  const customColors = useMemo(
    () => ({
      pumpkin: '#fa8334',
      pear: '#d0e562',
      blueMunsell: '#388697',
      fuchsiaRose: '#c94277',
      vermilion: '#f24236',
      blueNcs: '#2e86abff',
      jade: '#04a777ff',
      saffron: '#e1bc29ff',
    }),
    [],
  )

  // Set initial text color
  const initialTextColor = config.initialTextColor || customColors.vermilion

  // References and state
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  })
  const [paths, setPaths] = useState<PathData[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<PathData | null>(null)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const [startDot, setStartDot] = useState<Point | null>(null)
  const [coveredDots, setCoveredDots] = useState<Set<string>>(new Set())
  const [animationProgress, setAnimationProgress] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)

  // Pencil cursor
  const pencilCursor = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`

  // Drawing colors
  const colors = useMemo(
    () => [
      customColors.pumpkin,
      customColors.pear,
      customColors.blueMunsell,
      customColors.fuchsiaRose,
      customColors.vermilion,
      customColors.blueNcs,
      customColors.jade,
      customColors.saffron,
    ],
    [customColors],
  )

  // Generate a random color
  const getRandomColor = useCallback((): string => {
    return colors[Math.floor(Math.random() * colors.length)]
  }, [colors])

  // Generate dot grid
  const dotGrid = useMemo<Point[]>(() => {
    const grid: Point[] = []
    const cols = Math.floor(dimensions.width / dotSpacing)
    const rows = Math.floor(dimensions.height / dotSpacing)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * dotSpacing + dotSpacing / 2
        const y = row * dotSpacing + dotSpacing / 2
        const id = `dot-${row}-${col}`
        grid.push({ x, y, row, col, id })
      }
    }

    return grid
  }, [dimensions, dotSpacing])

  // Generate path with rounded corners
  const generatePathFromPoints = useCallback(
    (points: Point[]): string => {
      if (points.length < 2) return ''

      let pathData = `M ${points[0].x} ${points[0].y}`

      for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1]
        const current = points[i]
        const next = points[i + 1]

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
      pathData += ` L ${lastPoint.x} ${lastPoint.y}`

      return pathData
    },
    [cornerRadius],
  )

  // Find nearest dot horizontally or vertically
  const findNearestDotGridAligned = useCallback(
    (x: number, y: number, startDot: Point | null): Point | null => {
      if (!startDot) return null

      // Find the actual nearest dot
      let nearestDot: Point | null = null
      let minDistance = Infinity

      for (const dot of dotGrid) {
        const distance = Math.hypot(dot.x - x, dot.y - y)
        if (distance < minDistance) {
          minDistance = distance
          nearestDot = dot
        }
      }

      if (!nearestDot) return null

      // Determine if we should snap horizontally or vertically
      const isHorizontalCloser =
        Math.abs(nearestDot.x - startDot.x) >
        Math.abs(nearestDot.y - startDot.y)

      // Find dots in the same row or column
      const sameRowDots = dotGrid.filter((d) => d.row === startDot.row)
      const sameColDots = dotGrid.filter((d) => d.col === startDot.col)

      // Find the dot with the closest x or y coordinate
      if (isHorizontalCloser && sameRowDots.length > 0) {
        return sameRowDots.reduce((closest, dot) =>
          Math.abs(dot.x - nearestDot.x) < Math.abs(closest.x - nearestDot.x)
            ? dot
            : closest,
        )
      } else if (sameColDots.length > 0) {
        return sameColDots.reduce((closest, dot) =>
          Math.abs(dot.y - nearestDot.y) < Math.abs(closest.y - nearestDot.y)
            ? dot
            : closest,
        )
      }

      return startDot // Fallback
    },
    [dotGrid],
  )

  // At the beginning of your component, update how dimensions are calculated
  useEffect(() => {
    // Force a recalculation of dimensions on first render
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Ensure we properly capture screen size
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        clearPaths()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle document-wide mouse events
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (
        !isDrawing ||
        !startDot ||
        !svgRef.current ||
        currentPoints.length === 0
      )
        return

      const rect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const lastPoint = currentPoints[currentPoints.length - 1]
      const nearestDot = findNearestDotGridAligned(x, y, lastPoint)

      if (
        nearestDot &&
        (nearestDot.x !== lastPoint.x || nearestDot.y !== lastPoint.y)
      ) {
        const newPoints = [...currentPoints, nearestDot]
        setCurrentPoints(newPoints)

        const pathData = generatePathFromPoints(newPoints)
        setCurrentPath((prev) =>
          prev ? { ...prev, d: pathData, points: newPoints } : null,
        )

        setCoveredDots((prev) => {
          const newSet = new Set(prev)
          newSet.add(nearestDot.id)

          // Mark dots between points as covered
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
    }

    const handleDocumentMouseUp = () => {
      if (!isDrawing || !currentPath) return

      if (currentPoints.length > 1) {
        setPaths((prev) => [...prev, currentPath])
      }

      setIsDrawing(false)
      setCurrentPath(null)
      setCurrentPoints([])
      setStartDot(null)
    }

    // Only add document-wide listeners when drawing
    if (isDrawing) {
      document.addEventListener('mousemove', handleDocumentMouseMove)
      document.addEventListener('mouseup', handleDocumentMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    }
  }, [
    isDrawing,
    startDot,
    currentPoints,
    svgRef,
    findNearestDotGridAligned,
    generatePathFromPoints,
    currentPath,
  ])

  // Clear all paths
  const clearPaths = useCallback(() => {
    setPaths([])
    setCurrentPath(null)
    setCurrentPoints([])
    setStartDot(null)
    setCoveredDots(new Set())
  }, [])

  // Handle mouse events for the SVG element
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (!svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Find the nearest dot
      let nearestDot: Point | null = null
      let minDistance = Infinity

      for (const dot of dotGrid) {
        const distance = Math.hypot(dot.x - x, dot.y - y)
        if (distance < minDistance) {
          minDistance = distance
          nearestDot = dot
        }
      }

      if (nearestDot) {
        const newColor = getRandomColor()

        setIsDrawing(true)
        setStartDot(nearestDot)
        setCurrentPoints([nearestDot])
        setCurrentPath({
          id: `path-${Date.now()}`,
          color: newColor,
          width: lineWidth,
          d: `M ${nearestDot.x} ${nearestDot.y}`,
          points: [nearestDot],
        })

        setCoveredDots((prev) => {
          const newSet = new Set(prev)
          newSet.add(nearestDot.id)
          return newSet
        })
      }
    },
    [dotGrid, getRandomColor, lineWidth],
  )

  // Document-wide mouse down handler
  const handleDocumentMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!svgRef.current) return

      // Ignore clicks on interactive elements
      const target = e.target as HTMLElement
      if (target.closest('.interactive-element')) {
        return
      }

      const rect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Find the nearest dot
      let nearestDot: Point | null = null
      let minDistance = Infinity

      for (const dot of dotGrid) {
        const distance = Math.hypot(dot.x - x, dot.y - y)
        if (distance < minDistance) {
          minDistance = distance
          nearestDot = dot
        }
      }

      if (nearestDot) {
        const newColor = getRandomColor()

        setIsDrawing(true)
        setStartDot(nearestDot)
        setCurrentPoints([nearestDot])
        setCurrentPath({
          id: `path-${Date.now()}`,
          color: newColor,
          width: lineWidth,
          d: `M ${nearestDot.x} ${nearestDot.y}`,
          points: [nearestDot],
        })

        setCoveredDots((prev) => {
          const newSet = new Set(prev)
          newSet.add(nearestDot.id)
          return newSet
        })
      }
    },
    [dotGrid, getRandomColor, lineWidth, svgRef],
  )

  // Setup document-wide mouse down listener
  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentMouseDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown)
    }
  }, [handleDocumentMouseDown])

  // Custom cursor style
  const cursorStyle = useMemo(
    () => ({
      cursor: `url("${pencilCursor}") 0 24, auto`,
      backgroundColor,
    }),
    [pencilCursor, backgroundColor],
  )
  // Map coordinates to grid points
  const mapToGrid = useCallback(
    (
      x: number,
      y: number,
      centerX: number,
      centerY: number,
      scale: number,
    ): Point => {
      const scaledX = centerX + x * scale
      const scaledY = centerY + y * scale

      const col = Math.round((scaledX - dotSpacing / 2) / dotSpacing)
      const row = Math.round((scaledY - dotSpacing / 2) / dotSpacing)
      const snappedX = col * dotSpacing + dotSpacing / 2
      const snappedY = row * dotSpacing + dotSpacing / 2

      return {
        x: snappedX,
        y: snappedY,
        row,
        col,
        id: `dot-${row}-${col}`,
      }
    },
    [dotSpacing],
  )

  // Generate SVG path array by sampling points along the path
  const generatePathPoints = useCallback(
    (
      svgPath: string,
      centerX: number,
      centerY: number,
      scale: number,
    ): Point[] => {
      const parser = new DOMParser()
      const svgDoc = parser.parseFromString(
        `<svg xmlns="http://www.w3.org/2000/svg"><path d="${svgPath}"/></svg>`,
        'image/svg+xml',
      )
      const pathElement = svgDoc.querySelector('path')

      if (!pathElement) return []

      const pathLength = pathElement.getTotalLength()
      const numPoints = Math.max(50, Math.floor(pathLength / 5))
      const points: Point[] = []

      for (let i = 0; i <= numPoints; i++) {
        const distance = (i / numPoints) * pathLength
        const point = pathElement.getPointAtLength(distance)
        const gridPoint = mapToGrid(point.x, point.y, centerX, centerY, scale)

        // Only add if it's different from the previous point
        if (
          points.length === 0 ||
          gridPoint.x !== points[points.length - 1].x ||
          gridPoint.y !== points[points.length - 1].y
        ) {
          points.push(gridPoint)
        }
      }

      return points
    },
    [mapToGrid],
  )

  // Generate root-like animation paths instead of text
  const rootAnimationPaths = useMemo(() => {
    // Skip animation if animation is already complete
    if (animationComplete) return []

    // Calculate the center and size
    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    // Scale based on screen size
    const scale = Math.min(dimensions.width / 800, dimensions.height / 400)

    // Generate the root SVG paths
    const rootPaths = generateRootPaths(dimensions.width, dimensions.height, 0)

    // Build points for all path segments
    let allPoints: Point[] = []

    rootPaths.forEach((svgPath) => {
      if (svgPath) {
        const pathPoints = generatePathPoints(svgPath, centerX, centerY, scale)

        if (pathPoints.length > 0) {
          // Add segment marker
          if (allPoints.length > 0) {
            allPoints.push({
              ...allPoints[allPoints.length - 1],
              id: 'segment-break',
            })
          }

          // Add points for this segment
          allPoints = [...allPoints, ...pathPoints]
        }
      }
    })

    return allPoints
  }, [dimensions, generatePathPoints, animationComplete])

  // Animation effect with improved easing and staggered growth
  useEffect(() => {
    if (animationComplete || rootAnimationPaths.length === 0) {
      // Skip animation if there's nothing to animate
      if (rootAnimationPaths.length === 0) {
        setAnimationComplete(true)
      }
      return
    }

    // Longer duration for smoother growth
    const totalDuration = 8000 // 8 seconds for full animation
    const frameTime = 12 // ~83fps for smoother animation (lower = smoother)
    const totalSteps = totalDuration / frameTime
    const progressIncrement = 1 / totalSteps

    // Create a staggered effect by grouping the paths
    const segments = rootAnimationPaths.reduce(
      (acc, point, index) => {
        if (point.id === 'segment-break' || index === 0) {
          if (index > 0) acc.push({ end: index })
          if (index < rootAnimationPaths.length - 1) {
            acc.push({ start: index + 1 })
          }
        }
        return acc
      },
      [] as { start?: number; end?: number }[],
    )

    // Assign a random delay and duration to each segment for natural growth
    const segmentTimings = segments.map((segment) => ({
      ...segment,
      delay: Math.random() * 0.4, // Random delay between 0-40% of total time
      duration: 0.4 + Math.random() * 0.6, // Random duration between 40-100% of remaining time
    }))

    let currentProgress = 0

    const animationTimer = setInterval(() => {
      currentProgress += progressIncrement
      setAnimationProgress(currentProgress)

      if (currentProgress >= 1) {
        clearInterval(animationTimer)
        setAnimationComplete(true)

        // Add the animation paths to the paths list
        if (rootAnimationPaths.length > 1) {
          // Create separate paths for each segment
          let currentSegment: Point[] = []
          const animationPaths: PathData[] = []

          for (let i = 0; i < rootAnimationPaths.length; i++) {
            const point = rootAnimationPaths[i]

            if (point.id === 'segment-break') {
              // End the current segment
              if (currentSegment.length > 1) {
                const pathData = generatePathFromPoints(currentSegment)

                const rootColors = [
                  customColors.pumpkin, // Orange
                  customColors.pear, // Light green
                  customColors.blueMunsell, // Blue
                  customColors.fuchsiaRose, // Pink
                ]

                // More random color selection
                const randomColorIndex = Math.floor(
                  Math.random() * rootColors.length,
                )
                const rootColor = rootColors[randomColorIndex]

                // Vary the line width for more interesting visual
                const widthVariation = 0.7 + Math.random() * 0.6

                animationPaths.push({
                  id: `path-root-animation-${animationPaths.length}`,
                  color: rootColor,
                  width: lineWidth * widthVariation,
                  d: pathData,
                  points: [...currentSegment],
                })
              }
              // Start a new segment
              currentSegment = []
            } else {
              currentSegment.push(point)
            }
          }

          // Add the last segment
          if (currentSegment.length > 1) {
            const pathData = generatePathFromPoints(currentSegment)
            const rootColors = [
              customColors.pumpkin,
              customColors.pear,
              customColors.blueMunsell,
              customColors.fuchsiaRose,
            ]
            const colorIndex =
              Math.abs(animationPaths.length * 13) % rootColors.length
            const rootColor = rootColors[colorIndex]

            // Vary the line width slightly
            const widthVariation = 0.7 + Math.random() * 0.6

            animationPaths.push({
              id: `path-root-animation-${animationPaths.length}`,
              color: rootColor,
              width: lineWidth * widthVariation,
              d: pathData,
              points: [...currentSegment],
            })
          }

          // Add all animation paths
          setPaths((prev) => [...prev, ...animationPaths])

          // Mark dots as covered
          const covered = new Set<string>()
          rootAnimationPaths.forEach((point) => {
            if (point.id !== 'segment-break') {
              covered.add(point.id)
            }
          })
          setCoveredDots((prev) => {
            const newCovered = new Set(prev)
            covered.forEach((id) => newCovered.add(id))
            return newCovered
          })

          console.log('Root animation complete:', {
            totalPaths: animationPaths.length,
            totalDots: dotGrid.length,
            coveredDots: covered.size,
          })
        }
      }
    }, frameTime)

    return () => clearInterval(animationTimer)
  }, [
    rootAnimationPaths,
    animationComplete,
    generatePathFromPoints,
    customColors,
    lineWidth,
    dotGrid,
  ])

  // Calculate the visible portion of the animation path
  // Calculate the visible portion of the animation path with smoother transitions
  const getAnimationPathPortion = useCallback(() => {
    if (rootAnimationPaths.length < 2) return ''

    // Enhanced easing function for smoother starts and stops
    const easeInOutExpo = (t: number) => {
      return t === 0
        ? 0
        : t === 1
          ? 1
          : t < 0.5
            ? Math.pow(2, 20 * t - 10) / 2
            : (2 - Math.pow(2, -20 * t + 10)) / 2
    }

    // Apply easing to the progress
    const easedProgress = easeInOutExpo(animationProgress)

    // Create a staggered effect by identifying segments and calculating their individual progress
    let pathData = ''
    let currentSegment: Point[] = []
    let segmentStartIndex = 0

    // First pass: identify segments
    const segments: { start: number; end: number }[] = []
    for (let i = 0; i < rootAnimationPaths.length; i++) {
      if (
        rootAnimationPaths[i].id === 'segment-break' ||
        i === rootAnimationPaths.length - 1
      ) {
        if (i > segmentStartIndex) {
          segments.push({
            start: segmentStartIndex,
            end: i === rootAnimationPaths.length - 1 ? i : i - 1,
          })
        }
        segmentStartIndex = i + 1
      }
    }

    // Second pass: calculate progress for each segment
    for (let segIndex = 0; segIndex < segments.length; segIndex++) {
      const segment = segments[segIndex]

      // Each segment gets its own random delay and duration for staggered growth
      const randomDelay =
        ((segIndex * 0.1) % 0.5) + (((segment.start * 17) % 100) / 100) * 0.3 // 0-30% delay based on position
      const randomDuration = 0.3 + (((segment.end * 23) % 100) / 100) * 0.7 // 30-100% duration

      // Calculate this segment's progress
      let segmentProgress = (easedProgress - randomDelay) / randomDuration

      // Clamp progress between 0 and 1
      segmentProgress = Math.max(0, Math.min(1, segmentProgress))

      if (segmentProgress <= 0) continue // Skip segments that haven't started yet

      // Calculate how many points to show in this segment
      const segmentLength = segment.end - segment.start + 1
      const pointsToShow = Math.max(
        2,
        Math.ceil(segmentLength * segmentProgress),
      )

      // Get subset of points for this segment
      const segmentPoints = rootAnimationPaths.slice(
        segment.start,
        segment.start + pointsToShow,
      )

      if (segmentPoints.length > 1) {
        // Add this segment's path
        pathData +=
          (pathData ? ' ' : '') + generatePathFromPoints(segmentPoints)
      }
    }

    return pathData
  }, [rootAnimationPaths, animationProgress, generatePathFromPoints])

  // Render
  return (
    <div
      className="fixed inset-0 -z-10 h-screen w-full overflow-hidden"
      style={cursorStyle}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="h-full w-full"
        onMouseDown={handleMouseDown}
        onDoubleClick={clearPaths}
      >
        {/* Paths */}
        <Paths paths={paths} lineWidth={lineWidth} />

        {/* Animation path (if not complete) */}
        {!animationComplete && animationProgress > 0 && (
          <path
            d={getAnimationPathPortion()}
            stroke={customColors.pumpkin} // Default color during animation
            strokeWidth={lineWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}

        {/* Current drawing path */}
        {currentPath && (
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

        {/* Dots */}
        <DotGrid
          dots={dotGrid}
          dotRadius={dotRadius}
          dotColor={dotColor}
          coveredDots={coveredDots}
        />
      </svg>

      {/* Instructions */}
      <div className="absolute bottom-5 right-5 rounded bg-black bg-opacity-70 p-2 text-xs text-white opacity-50 transition-opacity hover:opacity-100">
        Draw by clicking and dragging | Double-click to clear
      </div>
    </div>
  )
}

export default InteractiveGridBackground
