'use client'
import dynamic from 'next/dynamic'

// Dynamically import the Background component with SSR disabled
const Background = dynamic(() => import('./Background'), {
  ssr: false,
})

export default Background
