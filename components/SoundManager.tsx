'use client'

import { useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { useStore } from '@/store/store'

export default function SoundManager() {
    const stage = useStore((state) => state.stage)
    const isInitializedRef = useRef(false)
    const droneRef = useRef<Tone.Player | null>(null)
    const ambienceRef = useRef<Tone.Oscillator | null>(null)

    useEffect(() => {
        // Init Tone on first click
        const initAudio = async () => {
            if (isInitializedRef.current) return
            await Tone.start()
            isInitializedRef.current = true
            console.log('Audio Initialized')

            // Create Drone (Low frequency thrum)
            // Using FM Synth for sci-fi texture
            const drone = new Tone.Oscillator(50, "sawtooth").toDestination();
            // Add some effects
            const filter = new Tone.Filter(200, "lowpass").toDestination();
            drone.connect(filter);
            // LFO for throbbing
            const lfo = new Tone.LFO(0.5, 100, 300).start();
            lfo.connect(filter.frequency);

            drone.volume.value = -20; // quiet
            ambienceRef.current = drone;
        }

        const handleInteraction = () => {
            initAudio().catch(console.error)
            window.removeEventListener('click', handleInteraction)
            window.removeEventListener('keydown', handleInteraction)
        }

        window.addEventListener('click', handleInteraction)
        window.addEventListener('keydown', handleInteraction)

        return () => {
            window.removeEventListener('click', handleInteraction)
            window.removeEventListener('keydown', handleInteraction)
        }
    }, [])

    // React to Stage Changes
    useEffect(() => {
        if (!isInitializedRef.current) return

        if (stage === 'MAIN_STAGE') {
            // Start Drone
            ambienceRef.current?.start();
            // Play "Welcome" sound?
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease("C2", "8n");
        } else if (stage === 'FINALE') {
            // Stop drone, play explosion
            ambienceRef.current?.stop();
            const synth = new Tone.MembraneSynth().toDestination();
            synth.triggerAttackRelease("C1", "2n");
            // Happy birthday melody?
            const now = Tone.now()
            const poly = new Tone.PolySynth(Tone.Synth).toDestination();
            poly.triggerAttackRelease(["C4", "E4", "G4"], "4n", now + 0.5);
            poly.triggerAttackRelease(["D4", "F4", "A4"], "4n", now + 1.0);
            poly.triggerAttackRelease(["C4", "E4", "G4", "C5"], "2n", now + 1.5);
        }
    }, [stage])

    // Global UI Interaction Sounds
    useEffect(() => {
        const playHover = () => {
            if (!isInitializedRef.current) return
            // High pitch bleep
            const synth = new Tone.Synth({
                oscillator: { type: "sine" },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
            }).toDestination();
            synth.volume.value = -15;
            synth.triggerAttackRelease("C6", "32n");
        }

        // Attach to all buttons or interactive elements?
        // Simpler: listen to mouseover and check target
        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button')) {
                playHover()
            }
        }

        window.addEventListener('mouseover', onMouseOver)
        return () => window.removeEventListener('mouseover', onMouseOver)
    }, [])

    return null
}
