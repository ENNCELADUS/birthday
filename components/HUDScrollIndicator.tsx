'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function HUDScrollIndicator() {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsVisible(false)
            } else {
                setIsVisible(true)
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    if (!isVisible) return null

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-40 font-mono tracking-widest text-cyan-400 select-none"
        >
            <div className="flex flex-col items-center mb-4">
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-cyan-500/50 to-cyan-500 relative overflow-hidden">
                    <motion.div
                        animate={{ top: ['-20%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute w-full h-4 bg-cyan-200 shadow-[0_0_8px_#fff]"
                    />
                </div>
            </div>

            <div className="relative">
                <span className="text-[10px] sm:text-xs">
                    {`> AWAITING INPUT: NAVIGATE_Z`}
                </span>
                <motion.div
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute inset-0 bg-cyan-400 blur-sm"
                />
            </div>

            <div className="mt-1 text-[8px] opacity-50">
                [ SYSTEM: SCROLL TO DECRYPT ]
            </div>
        </motion.div>
    )
}
