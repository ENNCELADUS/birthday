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
            // Play "Welcome" sound
            const synth = new Tone.Synth().toDestination();
            synth.triggerAttackRelease("C2", "8n");
        } else if (stage === 'FINALE') {
            // "SYSTEM_HALT" and "IMPLOSION" usually start immediately
            // We want a slow fade out of current audio or immediate cut
            ambienceRef.current?.stop();
            Tone.Destination.volume.rampTo(-Infinity, 1); // Fade to silence for System Halt

            const now = Tone.now()

            // At the moment of SHOCKWAVE (approx 2s + 1.5s after FINALE starts)
            // We want a deep, cinematic sub-bass boom
            const boom = new Tone.MembraneSynth({
                pitchDecay: 0.1,
                octaves: 4,
                oscillator: { type: "sine" }
            }).toDestination();
            boom.volume.value = 0;
            boom.triggerAttackRelease("C1", "2n", now + 3.5);

            // Shimmering chimes for the Golden Singularity / Constellation
            const chimes = new Tone.PolySynth(Tone.MetalSynth).toDestination();
            chimes.volume.value = -15;
            const constellationStart = now + 4.5;

            const chord = ["C5", "E5", "G5", "B5", "D6"];
            chord.forEach((note, i) => {
                chimes.triggerAttackRelease(note, "4n", constellationStart + i * 0.5);
            });

            // Bring volume back for the chimes
            Tone.Destination.volume.rampTo(0, 2, constellationStart);
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
