'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useStore } from '@/store/store'

export default function SynapticButton({ onClick }: { onClick: () => void }) {
    const [isHovered, setIsHovered] = useState(false)
    const setHoverState = useStore((state) => state.setHoverState)
    const setHoverLabel = useStore((state) => state.setHoverLabel)

    const handleMouseEnter = () => {
        setIsHovered(true)
        setHoverState('INTERACTABLE')
        setHoverLabel('// INITIALIZE')
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        setHoverState('DEFAULT')
        setHoverLabel(null)
    }

    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            {/* Rotating Brackets / Ring */}
            <motion.div
                animate={{
                    rotate: isHovered ? 360 : [0, 90, 180, 270, 360],
                    scale: isHovered ? 1.1 : [1, 1.05, 1]
                }}
                transition={{
                    rotate: { duration: isHovered ? 2 : 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-full"
            />

            {/* Brackets Elements */}
            {[0, 90, 180, 270].map((angle) => (
                <motion.div
                    key={angle}
                    animate={{ rotate: angle + (isHovered ? 45 : 0) }}
                    className="absolute inset-x-0 flex justify-between px-2"
                    style={{ transform: `rotate(${angle} deg)` }}
                >
                    <span className={`text-2xl ${isHovered ? 'text-red-500' : 'text-cyan-400'}`}>[</span>
                    <span className={`text-2xl ${isHovered ? 'text-red-500' : 'text-cyan-400'}`}>]</span>
                </motion.div>
            ))}

            {/* Core Trigger Zone */}
            <motion.button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={onClick}
                animate={{
                    backgroundColor: isHovered ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.1)',
                    boxShadow: isHovered
                        ? '0 0 30px rgba(239, 68, 68, 0.5)'
                        : '0 0 15px rgba(6, 182, 212, 0.2)'
                }}
                className="w-32 h-32 rounded-full border border-cyan-500/50 flex flex-col items-center justify-center z-10 transition-colors duration-300 pointer-events-auto cursor-none group"
            >
                <div className="text-[10px] opacity-50 mb-1 group-hover:text-red-400 font-mono">
                    {isHovered ? 'DECODING...' : 'INITIATE'}
                </div>
                <div className={`font-bold text-center px-4 leading-tight font-mono ${isHovered ? 'text-red-500' : 'text-cyan-300'}`}>
                    {isHovered ? 'PROTOCOL_CAKE' : 'LOVE_DUMP.EXE'}
                </div>
                <div className="text-[10px] opacity-50 mt-1 group-hover:text-red-400 font-mono">
                    EXECUTE
                </div>
            </motion.button>

            {/* Inner Glowing Ring */}
            <motion.div
                animate={{
                    scale: isHovered ? [1, 1.2, 1] : 1,
                    opacity: isHovered ? [0.2, 0.6, 0.2] : 0
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute w-40 h-40 border border-red-500 rounded-full"
            />
        </div>
    )
}
