'use client'

import Experience from '@/components/Experience'
import CustomCursor from '@/components/CustomCursor'
import { useStore } from '@/store/store'
import { useEffect } from 'react'


export default function Home() {
  const setStage = useStore((state) => state.setStage)
  const stage = useStore((state) => state.stage)


  return (
    <main className="w-full h-screen bg-black cursor-none">
      {/* Debug Jump */}
      <div className="fixed top-4 left-4 z-[9999] flex gap-2">
        <button
          onClick={() => setStage('FINALE')}
          className="px-3 py-1 bg-red-900/50 text-white border border-red-500 rounded text-xs hover:bg-red-800"
        >
          DEBUG: FINALE
        </button>
      </div>

      <CustomCursor />
      <Experience />
    </main>
  )
}
