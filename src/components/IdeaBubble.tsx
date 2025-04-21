import { motion } from 'framer-motion'
import { useState } from 'react'

interface IdeaBubbleProps {
  idea: string
  initialPos: { x: number; y: number }
  type?: 'normal' | 'fused'
}

const IdeaBubble = ({ idea, initialPos, type = 'normal' }: IdeaBubbleProps) => {
  const [pos, setPos] = useState(initialPos)
  const [isDragging, setIsDragging] = useState(false)

  const gradient =
    type === 'fused'
      ? 'from-[#FFD700] to-[#FFB800] border-[#FFDC80] text-black'
      : 'from-[#232328] to-[#1C1C20] border-[#2A2A2E] text-white'

  return (
    <motion.div
      drag
      dragElastic={0.3}
      dragMomentum={true}
      dragTransition={{ bounceStiffness: 90, bounceDamping: 12 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false)
        setPos((prev) => ({
          x: prev.x + info.delta.x,
          y: prev.y + info.delta.y,
        }))
      }}
      initial={{ opacity: 0, scale: 0.3, x: pos.x, y: pos.y }}
      animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 60, damping: 12 }}
      style={{
        position: 'absolute',
        zIndex: isDragging ? 100 : 10,
        pointerEvents: 'auto',
      }}
      whileDrag={{ scale: 1.1 }}
    >
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', idea)}
        className={`bg-gradient-to-br ${gradient} px-4 py-2 rounded-xl border shadow-sm text-sm font-medium cursor-grab active:cursor-grabbing hover:bg-[#2D2D32] transition floating`}
      >
        {idea}
      </div>
    </motion.div>
  )
}

export default IdeaBubble
