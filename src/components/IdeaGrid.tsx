import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface GridSlotProps {
    tags: string[]
    index: number
    onDrop: (value: string, index: number) => void
    onRemove: (tag: string, index: number) => void
}

const GridSlot = ({ tags, index, onDrop, onRemove }: GridSlotProps) => {
    const allowDrop = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        const value = e.dataTransfer.getData('text/plain')
        if (value) {
            onDrop(value, index)
        }
    }

    return (
        <div
            onDragOver={allowDrop}
            onDrop={handleDrop}
            className="w-24 h-24 bg-[#1A1A1C] border border-[#2A2A2E] rounded-xl shadow-inner flex flex-col items-center justify-center m-1 p-1 relative"
        >
            <span className="absolute top-0 left-0 text-[10px] text-gray-500 px-1 pt-0.5">{index + 1}</span>

            <AnimatePresence>
                {tags.map((tag, i) => (
                    <motion.div
                        key={tag + i}
                        className="text-xs bg-[#2E2E30] text-[#C3C3C3] rounded px-2 py-0.5 mt-0.5 cursor-pointer hover:bg-[#444]"
                        onClick={() => onRemove(tag, index)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        {tag}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

interface IdeaGridProps {
    onCombine: (ideas: string[]) => void
}

const IdeaGrid = ({ onCombine }: IdeaGridProps) => {
    const [slots, setSlots] = useState<string[][]>(Array(9).fill([]))

    const handleDrop = (value: string, index: number) => {
        const updated = [...slots]
        if (updated[index].length >= 1) return
        updated[index] = [...updated[index], value]
        setSlots(updated)
    }

    const handleRemove = (tag: string, index: number) => {
        const updated = [...slots]
        updated[index] = updated[index].filter((t) => t !== tag)
        setSlots(updated)
    }

    const handleCombine = () => {
        const selected = slots.flat().filter(Boolean)
        onCombine(selected)
    }

    const filledCount = slots.flat().length

    return (
        <div className="flex flex-col items-center mt-12">
            <div className="grid grid-cols-3 gap-2">
                {slots.map((tags, idx) => (
                    <GridSlot key={idx} tags={tags} index={idx} onDrop={handleDrop} onRemove={handleRemove} />
                ))}
            </div>

            {filledCount >= 2 && (
                <button
                    onClick={handleCombine}
                    className="mt-4 px-5 py-2 bg-[#0057FF] text-white text-sm md:text-base rounded-xl shadow hover:bg-[#1C6EFF] transition duration-200"
                >
                    ✨ 合成点子
                </button>
            )}
        </div>
    )
}

export default IdeaGrid
