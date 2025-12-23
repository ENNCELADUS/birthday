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

      <CustomCursor />
      <Experience />
    </main>
  )
}
