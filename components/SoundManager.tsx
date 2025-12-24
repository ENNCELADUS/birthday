import { useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { useStore } from '@/store/store'

export default function SoundManager() {
    const stage = useStore((state) => state.stage)
    const isInitializedRef = useRef(false)
    const droneRef = useRef<Tone.Oscillator | null>(null)
    const turbineRef = useRef<Tone.Oscillator | null>(null)

    useEffect(() => {
        const initAudio = async () => {
            if (isInitializedRef.current) return
            await Tone.start()
            isInitializedRef.current = true

            // Drone for Main Stage
            const drone = new Tone.Oscillator(50, "sawtooth").toDestination();
            const filter = new Tone.Filter(200, "lowpass").toDestination();
            drone.connect(filter);
            const lfo = new Tone.LFO(0.5, 100, 300).start();
            lfo.connect(filter.frequency);
            drone.volume.value = -20;
            droneRef.current = drone;

            // Turbine for Ignition
            const turbine = new Tone.Oscillator(100, "sine").toDestination();
            turbine.volume.value = -10;
            turbineRef.current = turbine;
        }

        const handleInteraction = () => {
            initAudio().catch(console.error)
            window.removeEventListener('click', handleInteraction)
        }

        window.addEventListener('click', handleInteraction)
        return () => window.removeEventListener('click', handleInteraction)
    }, [])

    useEffect(() => {
        if (!isInitializedRef.current) return

        if (stage === 'MAIN_STAGE') {
            droneRef.current?.start()
        } else if (stage === 'FINALE') {
            droneRef.current?.stop()
            Tone.Destination.volume.rampTo(-Infinity, 1) // Silence for VOID

            // We'll use a timer to schedule the sounds to match Finale.tsx
            // Timing in Finale.tsx:
            // 0.0: IMPLOSION
            // 1.0: VOID
            // 1.5: CONSTRUCT
            // (Wait for user click to IGNITION)
        }
    }, [stage])

    // Global listeners for events emitted by Finale.tsx if any
    useEffect(() => {
        const onIgnition = () => {
            if (!isInitializedRef.current) return
            const now = Tone.now()
            turbineRef.current?.start(now)
            turbineRef.current?.frequency.rampTo(2000, 2) // Rising pitch
            turbineRef.current?.stop(now + 2)
        }

        const onSingularity = () => {
            if (!isInitializedRef.current) return
            const now = Tone.now()
            const boom = new Tone.MembraneSynth({ pitchDecay: 0.2, octaves: 4 }).toDestination()
            boom.triggerAttackRelease("C1", "1n", now)
            Tone.Destination.volume.rampTo(0, 0.1) // Volume back up
        }

        const onMessage = () => {
            if (!isInitializedRef.current) return
            const now = Tone.now()
            const synth = new Tone.PolySynth(Tone.Synth).toDestination()
            synth.set({ oscillator: { type: "triangle" }, envelope: { attack: 2, release: 5 } })
            synth.volume.value = -10
            const chord = ["C3", "G3", "C4", "E4", "G4", "B4"]
            synth.triggerAttackRelease(chord, "8n", now)
        }

        window.addEventListener('audio-ignition', onIgnition)
        window.addEventListener('audio-singularity', onSingularity)
        window.addEventListener('audio-message', onMessage)

        return () => {
            window.removeEventListener('audio-ignition', onIgnition)
            window.removeEventListener('audio-singularity', onSingularity)
            window.removeEventListener('audio-message', onMessage)
        }
    }, [])

    return null
}
