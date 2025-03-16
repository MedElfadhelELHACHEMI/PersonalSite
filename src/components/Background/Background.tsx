'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

// Types
import { PathData, Point, ViewportRect } from './types'

// Utils
import { generateDotGrid } from './utils/gridUtils'
import { updateCoveredDots } from './utils/gridUtils'

// Custom hooks
import { useColors } from './hooks/useColors'
import { useCanvasDrawing } from './hooks/useCanvasDrawing'
import { useAnimationSegments } from './hooks/useAnimationSegments'
import { useAnimation } from './hooks/useAnimation'
import { useDrawing } from './hooks/useDrawing'
import { useEventHandlers } from './hooks/useEventHandlers'
import { useMouseHandlers } from './hooks/useMouseHandlers'

// Constants for the background component
const CONSTANTS = {
  dotSpacing: 23,
  dotRadius: 0.5,
  lineWidth: 7,
  cornerRadius: 12,
  viewportMargin: 0, // Extra margin around viewport for smoother experience
}

const Background: React.FC = () => {
  const { theme } = useTheme()

  // Refs for DOM elements
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // State for dimensions and viewport
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  })
  const [viewport, setViewport] = useState<ViewportRect>({
    top: 0,
    left: 0,
    bottom: typeof window !== 'undefined' ? window.innerHeight : 800,
    right: typeof window !== 'undefined' ? window.innerWidth : 1000,
  })

  // Drawing state
  const [paths, setPaths] = useState<PathData[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<PathData | null>(null)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const [startDot, setStartDot] = useState<Point | null>(null)
  const [coveredDots, setCoveredDots] = useState<Set<string>>(new Set())

  // Animation state
  const [animationComplete, setAnimationComplete] = useState(false)
  const [animationSegments, setAnimationSegments] = useState<any[]>([])

  // Initialize color utilities
  const { colors, customColors, getRandomColor } = useColors()

  // Generate virtualized dot grid - only dots in or near the viewport
  const dotGrid = useMemo(
    () =>
      generateDotGrid(
        dimensions,
        viewport,
        CONSTANTS.dotSpacing,
        CONSTANTS.viewportMargin,
      ),
    [dimensions, viewport],
  )

  // Initialize animation segments hooks
  const { createAnimationSegments, getDotAt } = useAnimationSegments(
    dimensions,
    CONSTANTS.dotSpacing,
    getRandomColor,
  )

  // Initialize canvas drawing hook
  const { drawDotsOnCanvas } = useCanvasDrawing(
    canvasRef,
    dotGrid,
    coveredDots,
    CONSTANTS.dotRadius,
  )

  // Initialize animation hook
  const { runInitialAnimation } = useAnimation(
    svgRef,
    animationSegments,
    CONSTANTS.lineWidth,
    setAnimationComplete,
    setPaths,
    setCoveredDots,
  )

  // Initialize drawing hook
  const { startDrawing, endDrawing, clearDrawing, handleThrottledMouseMove } =
    useDrawing(
      dimensions,
      CONSTANTS.dotSpacing,
      CONSTANTS.lineWidth,
      getRandomColor,
      setIsDrawing,
      setStartDot,
      setCurrentPoints,
      setCurrentPath,
      setCoveredDots,
      setPaths,
    )

  // Initialize mouse handlers
  const {
    onMouseDown,
    onDocumentMouseDown,
    onDocumentMouseMove,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onDoubleClick,
  } = useMouseHandlers(
    svgRef,
    startDrawing,
    handleThrottledMouseMove,
    endDrawing,
    clearDrawing,
    CONSTANTS.dotSpacing,
  )

  // Initialize event handlers
  const { setupDocumentMouseDown, setupActiveDrawingHandlers } =
    useEventHandlers(
      setDimensions,
      setViewport,
      canvasRef,
      drawDotsOnCanvas,
      clearDrawing,
    )

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
    setCoveredDots((prevCovered) => updateCoveredDots(latestPath, prevCovered))
  }, [paths])

  // Setup document-wide mouse event listeners
  useEffect(() => {
    // Setup document mouse down handler
    const cleanupMouseDown = setupDocumentMouseDown(onDocumentMouseDown)

    // Only add document-wide listeners when drawing
    const cleanupActiveHandlers = isDrawing
      ? setupActiveDrawingHandlers(onDocumentMouseMove, endDrawing)
      : () => {}

    return () => {
      cleanupMouseDown()
      cleanupActiveHandlers()
    }
  }, [
    isDrawing,
    setupDocumentMouseDown,
    setupActiveDrawingHandlers,
    onDocumentMouseDown,
    onDocumentMouseMove,
    endDrawing,
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

  // Custom cursor CSS style with theme support
  const cursorStyle = useMemo(
    () => ({
      backgroundColor: theme === 'light' ? '#EDEADE' : 'rgb(33, 33, 33)',
      transition: 'background-color 0.62s ease',
    }),
    [theme],
  )

  // Check if a dot is covered by a line
  const isDotCovered = (dotId: string) => coveredDots.has(dotId)

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
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onDoubleClick={onDoubleClick}
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
            strokeWidth={CONSTANTS.lineWidth}
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
                r={CONSTANTS.dotRadius}
                fill="#666"
              />
            ),
        )}
      </svg>

      {/* Hidden info text */}
      <div className="interactive-element absolute bottom-5 right-5 rounded bg-black bg-opacity-70 p-2 text-xs text-white opacity-30 transition-opacity hover:opacity-100">
        Double-click to clear | Press C to clear
      </div>
    </div>
  )
}

export default React.memo(Background) // Optimize with memo
