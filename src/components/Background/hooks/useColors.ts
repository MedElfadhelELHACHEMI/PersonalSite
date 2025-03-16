import { useCallback, useMemo } from 'react'
import { CustomColors } from '../types'

/**
 * Hook for managing color-related functionality
 * @returns Color utilities and constants
 */
export const useColors = () => {
  // Custom colors as specified
  const customColors = useMemo<CustomColors>(
    () => ({
      vermilion: '#f24236ff',
      blueNcs: '#2e86abff',
      jade: '#04a777ff',
      saffron: '#e1bc29ff',
    }),
    []
  )

  // Colors array for user drawing using the custom colors
  const colors = useMemo(
    () => [
      customColors.vermilion,
      customColors.blueNcs,
      customColors.jade,
      customColors.saffron,
    ],
    [customColors]
  )

  // Generate a random color
  const getRandomColor = useCallback(() => {
    return colors[Math.floor(Math.random() * colors.length)]
  }, [colors])

  return {
    customColors,
    colors,
    getRandomColor,
  }
}
