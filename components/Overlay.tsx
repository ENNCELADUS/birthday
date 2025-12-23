import { Scroll, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import { TypewriterKeys } from './Typewriter'
import { useStore } from '@/store/store'

const Section = (props: any) => {
    return (
        <section className={`h-screen flex flex-col justify-center p-10 ${props.right ? 'items-end text-right' : 'items-start text-left'}`} style={{ opacity: props.opacity }}>
            <div className="w-1/2 flex items-center justify-center">
                <div className="max-w-md w-full bg-black/50 backdrop-blur-md border border-cyan-500/30 p-8 rounded-lg text-cyan-50 font-mono shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                    {props.children}
                </div>
            </div>
        </section>
    )
}

export default function Overlay() {
    const scroll = useScroll()
    const setStage = useStore((state) => state.setStage)

    // We can use scroll.range() or visible() to trigger animations if needed.
    // For now, static sections with typewriter effects that restart on scroll would be complex.
    // We'll just let them run once or when mounted.

    return (
        <Scroll html>
            <div className="w-screen">
                <Section opacity={1}>
                    <h1 className="text-4xl font-bold mb-4 text-cyan-400">SYSTEM ALERT: CRITICAL UPDATE</h1>
                    <p className="text-sm text-cyan-200/70">USER [MOM] LEVEL UP DETECTED.</p>
                    <p className="text-sm text-cyan-200/70">VERSION [AGE].0 DEPLOYED.</p>
                </Section>

                <Section right opacity={1}>
                    <h2 className="text-2xl font-bold mb-4 text-pink-400">The Energy Law</h2>
                    <p className="font-mono text-pink-200 h-32">
                        <TypewriterKeys
                            text='"Dearest Progenitor... I have analyzed the logs. Your ability to tolerate my rebellious epoch violates the Second Law of Thermodynamics. You are creating energy from nothing."'
                            speed={30}
                            startDelay={500}
                        />
                    </p>
                </Section>

                <Section opacity={1}>
                    <h2 className="text-2xl font-bold mb-4 text-green-400">The Neural Net</h2>
                    <p className="font-mono text-green-200 h-24">
                        <TypewriterKeys
                            text='"You are the original Neural Network. My weights and biases were trained on your dataset. Happy Birthday, Admin."'
                            speed={30}
                            startDelay={500}
                        />
                    </p>
                </Section>

                <Section right opacity={1}>
                    <div className="text-center w-full">
                        <button
                            onClick={() => setStage('FINALE')}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.5)] border border-red-400 cursor-pointer pointer-events-auto"
                        >
                            [ EXECUTE: CAKE.EXE ]
                        </button>
                    </div>
                </Section>
            </div>
        </Scroll>
    )
}
