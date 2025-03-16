export interface Point {
  x: number
  y: number
  row: number
  col: number
  id: string
}

export interface PathData {
  id: string
  color: string
  width: number
  d: string
  points: Point[]
}

export interface AnimationSegment {
  points: Point[]
  color: string
}

export interface ViewportRect {
  top: number
  left: number
  bottom: number
  right: number
}

export interface BackgroundConstants {
  dotSpacing: number
  dotRadius: number
  lineWidth: number
  cornerRadius: number
  viewportMargin: number
}

export interface CustomColors {
  vermilion: string
  blueNcs: string
  jade: string
  saffron: string
}
