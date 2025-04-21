import { useEffect, useRef } from 'react'
import IdeaBubble from './IdeaBubble'

interface IdeaFieldProps {
  ideas: { text: string; type: 'normal' | 'fused' }[]
  originRef: React.RefObject<HTMLDivElement>
  positions: { x: number; y: number }[]
  setPositions: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>
}

const IdeaField = ({ ideas, originRef, positions, setPositions }: IdeaFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const getRandomDirection = () => {
    const directions = ['left', 'topleft', 'right', 'centerleft', 'centerright', 'bottomleft', 'bottomright']
    return directions[Math.floor(Math.random() * directions.length)]
  }

  useEffect(() => {
    if (
      ideas.length > positions.length &&
      originRef.current &&
      containerRef.current
    ) {
      const box = originRef.current.getBoundingClientRect()
      const containerBox = containerRef.current.getBoundingClientRect()

      const margin = 120
      const jitter = 50
      const minDistance = 100

      let attempts = 0
      let found = false
      let relativeX = 0
      let relativeY = 0

      while (!found && attempts < 30) {
        const direction = getRandomDirection()
        let newX = 0
        let newY = 0

        switch (direction) {
          case 'left':
            newX = box.left - margin - Math.random() * jitter - 150
            newY = box.top + Math.random() * box.height
            break
          case 'topleft':
            newX = box.left - margin + Math.random() * jitter
            newY = box.top - margin + Math.random() * jitter
            break
          case 'right':
            newX = box.right + margin + Math.random() * jitter
            newY = box.top + Math.random() * box.height
            break
          case 'bottomleft':
            newX = box.left - margin + Math.random() * jitter - 150
            newY = box.bottom + margin + Math.random() * jitter + 250
            break
          case 'bottomright':
            newX = box.right + margin + Math.random() * jitter
            newY = box.bottom + margin + Math.random() * jitter + 250
            break
          case 'centerleft':
            newX = box.left - margin + Math.random() * jitter - 150
            newY = box.top + Math.random() * box.height + 100
            break
          case 'centerright':
            newX = box.right + margin + Math.random() * jitter
            newY = box.top + Math.random() * box.height + 100
            break
        }

        const tempX = newX - containerBox.left
        const tempY = newY - containerBox.top

        const isFar = positions.every((p) => {
          const dx = tempX - p.x
          const dy = tempY - p.y
          return Math.sqrt(dx * dx + dy * dy) > minDistance
        })

        if (isFar) {
          relativeX = tempX
          relativeY = tempY
          found = true
        }

        attempts++
      }

      if (found) {
        setPositions((prev) => [...prev, { x: relativeX, y: relativeY }])
      }
    }
  }, [ideas.length, originRef, positions.length, setPositions])

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden pointer-events-none"
      >
        {ideas.map((idea, idx) =>
          positions[idx] ? (
            <IdeaBubble
              key={idx}
              idea={idea.text}
              initialPos={positions[idx]}
              type={idea.type}
            />
          ) : null
        )}
      </div>
    </div>
  )
}

export default IdeaField
