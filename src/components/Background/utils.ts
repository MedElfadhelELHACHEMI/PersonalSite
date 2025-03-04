// Function to generate more organic root-like paths from all around the page
export const generateRootPaths = (
  width: number,
  height: number,
  centerPadding: number = 100,
): string[] => {
  const centerX = width / 2
  const centerY = height / 2
  const centerWidth = Math.min(600, width * 0.4) // Limit width for center content
  const centerHeight = Math.min(400, height * 0.4) // Limit height for center content

  const boundaryLeft = centerX - centerWidth / 2
  const boundaryRight = centerX + centerWidth / 2
  const boundaryTop = centerY - centerHeight / 2
  const boundaryBottom = centerY + centerHeight / 2

  // Root paths
  const paths: string[] = []

  // Helper to create a random organic path
  const createRootPath = (
    startX: number,
    startY: number,
    direction: { x: number; y: number },
    length: number,
    branchProbability: number = 0.15,
    complexity: number = 1.0,
  ) => {
    let x = startX
    let y = startY
    let pathData = `M ${x} ${y}`

    // Create more organic path with finer segments
    const steps = Math.floor(length / 15) * complexity // Smaller segments for smoother curves
    const baseStepSize = 15 / complexity

    // Normalize direction vector
    const dirMagnitude = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y,
    )
    const normalizedDir = {
      x: direction.x / dirMagnitude,
      y: direction.y / dirMagnitude,
    }

    // Tendency to curve - randomly positive or negative
    let curveTendency = (Math.random() - 0.5) * 0.8

    // Previous direction for smoother transitions
    let prevDirX = normalizedDir.x
    let prevDirY = normalizedDir.y

    for (let i = 0; i < steps; i++) {
      // Occasionally change curve tendency for more organic look
      if (Math.random() < 0.1) {
        curveTendency = (Math.random() - 0.5) * 0.8
      }

      // Calculate new direction with some random variation and curve tendency
      // Using the perpendicular vector for natural-looking curves
      const perpX = -prevDirY
      const perpY = prevDirX

      // Mix previous direction, tendency to curve, and some randomness
      const dirX =
        prevDirX * 0.8 + perpX * curveTendency + (Math.random() - 0.5) * 0.4
      const dirY =
        prevDirY * 0.8 + perpY * curveTendency + (Math.random() - 0.5) * 0.4

      // Normalize again
      const newMagnitude = Math.sqrt(dirX * dirX + dirY * dirY)
      const newDirX = dirX / newMagnitude
      const newDirY = dirY / newMagnitude

      // Calculate step size with some variation
      const stepSize = baseStepSize * (0.7 + Math.random() * 0.6)

      // Update position
      const newX = x + newDirX * stepSize
      const newY = y + newDirY * stepSize

      // Check if about to enter center area and adjust if needed
      if (
        newX > boundaryLeft - centerPadding &&
        newX < boundaryRight + centerPadding &&
        newY > boundaryTop - centerPadding &&
        newY < boundaryBottom + centerPadding
      ) {
        // Calculate the shortest direction to exit the center area
        const distToLeft = newX - (boundaryLeft - centerPadding)
        const distToRight = boundaryRight + centerPadding - newX
        const distToTop = newY - (boundaryTop - centerPadding)
        const distToBottom = boundaryBottom + centerPadding - newY

        const minDist = Math.min(
          distToLeft,
          distToRight,
          distToTop,
          distToBottom,
        )

        // Adjust direction to steer away from center
        if (minDist === distToLeft) {
          prevDirX = -Math.abs(prevDirX) - 0.2
        } else if (minDist === distToRight) {
          prevDirX = Math.abs(prevDirX) + 0.2
        } else if (minDist === distToTop) {
          prevDirY = -Math.abs(prevDirY) - 0.2
        } else if (minDist === distToBottom) {
          prevDirY = Math.abs(prevDirY) + 0.2
        }

        // Normalize again
        const avoidMagnitude = Math.sqrt(
          prevDirX * prevDirX + prevDirY * prevDirY,
        )
        prevDirX = prevDirX / avoidMagnitude
        prevDirY = prevDirY / avoidMagnitude

        // Recalculate next position
        x = x + prevDirX * stepSize
        y = y + prevDirY * stepSize
      } else {
        // Normal movement
        x = newX
        y = newY
        prevDirX = newDirX
        prevDirY = newDirY
      }

      // Keep within screen with a small margin
      x = Math.max(5, Math.min(width - 5, x))
      y = Math.max(5, Math.min(height - 5, y))

      pathData += ` L ${x} ${y}`

      // Possibly branch out (more likely as we go further from start)
      const distanceFactor = i / steps // Higher chance of branching further along
      if (Math.random() < branchProbability * (0.5 + distanceFactor) && i > 2) {
        // Create perpendicular branch direction with some randomness
        const branchDir = {
          x: perpX * 0.8 + (Math.random() - 0.5) * 0.5,
          y: perpY * 0.8 + (Math.random() - 0.5) * 0.5,
        }

        // Shorter branches with reduced complexity and branching
        const branchLength = length * (Math.random() * 0.4 + 0.2) // 20-60% of main length
        paths.push(
          createRootPath(
            x,
            y,
            branchDir,
            branchLength,
            branchProbability * 0.6,
            complexity * 0.9,
          ),
        )

        // Sometimes add a branch in the opposite direction too
        if (Math.random() < 0.3) {
          const oppositeBranchDir = {
            x: -perpX * 0.8 + (Math.random() - 0.5) * 0.5,
            y: -perpY * 0.8 + (Math.random() - 0.5) * 0.5,
          }

          paths.push(
            createRootPath(
              x,
              y,
              oppositeBranchDir,
              branchLength * 0.8,
              branchProbability * 0.5,
              complexity * 0.8,
            ),
          )
        }
      }
    }

    return pathData
  }

  // Generate points all around the perimeter
  const perimeter = 2 * (width + height)
  // Reduce the number of roots and ensure they spread across the screen
  const totalRoots = Math.floor(perimeter / 400) // Changed from 200 to 400 to reduce density

  // Make sure roots are generated evenly around the perimeter
  for (let i = 0; i < totalRoots; i++) {
    // Position along perimeter (0 to 1)
    const position = i / totalRoots
    let startX, startY, direction

    // Convert position to coordinates and direction
    if (position < 0.25) {
      // Top edge
      startX = width * (position * 4)
      startY = 0
      direction = { x: 0, y: 1 } // Growing downward
    } else if (position < 0.5) {
      // Right edge
      startX = width
      startY = height * ((position - 0.25) * 4)
      direction = { x: -1, y: 0 } // Growing leftward
    } else if (position < 0.75) {
      // Bottom edge
      startX = width * (1 - (position - 0.5) * 4)
      startY = height
      direction = { x: 0, y: -1 } // Growing upward
    } else {
      // Left edge
      startX = 0
      startY = height * (1 - (position - 0.75) * 4)
      direction = { x: 1, y: 0 } // Growing rightward
    }

    // Add some randomness to starting point and direction
    startX += (Math.random() - 0.5) * 30
    startY += (Math.random() - 0.5) * 30
    direction.x += (Math.random() - 0.5) * 0.4
    direction.y += (Math.random() - 0.5) * 0.4

    // Reduce length to prevent overcrowding
    const distToCenter = Math.hypot(centerX - startX, centerY - startY)
    const maxLength = distToCenter * 0.5 // Changed from 0.7 to 0.5
    const length = maxLength * (0.4 + Math.random() * 0.4) // Changed to 40-80% of max

    // Reduce branching probability
    const branchProbability = 0.1 + Math.random() * 0.1 // Changed from 0.15 to 0.1
    const complexity = 0.8 + Math.random() * 0.4

    paths.push(
      createRootPath(
        startX,
        startY,
        direction,
        length,
        branchProbability,
        complexity,
      ),
    )
  }

  // Reduce internal roots
  const innerPoints = Math.floor(totalRoots * 0.2) // Changed from 0.3 to 0.2
  for (let i = 0; i < innerPoints; i++) {
    // Pick a quadrant to avoid the center
    const quadrant = Math.floor(Math.random() * 4)
    let startX, startY, direction

    switch (quadrant) {
      case 0: // Top-left
        startX = Math.random() * boundaryLeft * 0.8
        startY = Math.random() * boundaryTop * 0.8
        direction = {
          x:
            centerX - startX > 0
              ? 0.5 + Math.random() * 0.5
              : -(0.5 + Math.random() * 0.5),
          y:
            centerY - startY > 0
              ? 0.5 + Math.random() * 0.5
              : -(0.5 + Math.random() * 0.5),
        }
        break
      case 1: // Top-right
        startX = boundaryRight + Math.random() * (width - boundaryRight) * 0.8
        startY = Math.random() * boundaryTop * 0.8
        direction = {
          x:
            centerX - startX > 0
              ? 0.5 + Math.random() * 0.5
              : -(0.5 + Math.random() * 0.5),
          y:
            centerY - startY > 0
              ? 0.5 + Math.random() * 0.5
              : -(0.5 + Math.random() * 0.5),
        }
        break
      case 2: // Bottom-right
        startX = boundaryRight + Math.random() * (width - boundaryRight) * 0.8
        startY =
          boundaryBottom + Math.random() * (height - boundaryBottom) * 0.8
        direction = {
          x:
            centerX - startX > 0
              ? 0.5 + Math.random() * 0.5
              : -(0.5 + Math.random() * 0.5),
          y:
            centerY - startY > 0
              ? 0.5 + Math.random() * 0.5
              : -(0.5 + Math.random() * 0.5),
        }
        break
      default: // Bottom-left
        startX = Math.random() * boundaryLeft * 0.8
        startY =
          boundaryBottom + Math.random() * (height - boundaryBottom) * 0.8
        direction = {
          x:
            centerX - startX > 0
              ? 0.5 + Math.random() * 0.5
              : -(0.5 + Math.random() * 0.5),
          y:
            centerY - startY > 0
              ? 0.5 + Math.random() * 0.5
              : -(0.5 + Math.random() * 0.5),
        }
    }

    // Shorter, more complex internal roots
    const length = Math.hypot(width, height) * (0.1 + Math.random() * 0.2)
    paths.push(
      createRootPath(
        startX,
        startY,
        direction,
        length,
        0.2 + Math.random() * 0.1, // Higher branch probability
        1.2 + Math.random() * 0.3, // Higher complexity
      ),
    )
  }

  return paths
}
