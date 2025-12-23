import Experience from '@/components/Experience'
import CustomCursor from '@/components/CustomCursor'

export default function Home() {
  return (
    <main className="w-full h-screen bg-black cursor-none">
      <CustomCursor />
      <Experience />
    </main>
  )
}
