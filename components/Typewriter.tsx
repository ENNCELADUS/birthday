import { useState, useEffect } from 'react'

export const TypewriterKeys = ({ text, speed = 50, startDelay = 0 }: { text: string, speed?: number, startDelay?: number }) => {
    const [displayedText, setDisplayedText] = useState('')
    const [started, setStarted] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setStarted(true)
        }, startDelay)
        return () => clearTimeout(timeout)
    }, [startDelay])

    useEffect(() => {
        if (!started) return

        let i = 0
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i))
                i++
            } else {
                clearInterval(interval)
            }
        }, speed)

        return () => clearInterval(interval)
    }, [text, speed, started])

    return <span>{displayedText}</span>
}
