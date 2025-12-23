'use client'

import Experience from '@/components/Experience'
import CustomCursor from '@/components/CustomCursor'
import { useStore } from '@/store/store'
import { useEffect } from 'react'


export default function Home() {
  const setStage = useStore((state) => state.setStage)
  const stage = useStore((state) => state.stage)

  // Global Debug Hotkey
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        console.log("Forcing Finale via Hotkey (Page Level)")
        setStage('FINALE')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [setStage])

  return (
    <main className="w-full h-screen bg-black cursor-none">
      {/* Emergency Force Button */}
      <button
        onClick={() => setStage('FINALE')}
        className="fixed top-0 left-0 bg-white text-black z-[9999] p-2 text-xs opacity-50 hover:opacity-100"
      >
        FORCE FINALE (Stage: {stage})
      </button>

      <CustomCursor />
      <Experience />
    </main>
  )
}
