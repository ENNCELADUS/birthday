import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TERMINAL_LINES = [
    "[ SYSTEM_UPTIME : 50 YEARS ]",
    "[ CORE_STABILITY : PERFECT ]",
    "[ HAPPY BIRTHDAY, MOTHER ]"
];

const GLITCH_CHARS = "ABCDEFHIJKLMNOPQRSTUVWXYZ0123456789[]:_.";

interface TerminalLineProps {
    text: string;
    delay: number;
    onComplete?: () => void;
}

const TerminalLine: React.FC<TerminalLineProps> = ({ text, delay, onComplete }) => {
    const [displayText, setDisplayText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        let charIndex = 0;

        const startTyping = () => {
            setIsTyping(true);
            const typingInterval = setInterval(() => {
                if (charIndex < text.length) {
                    // Glitch logic: 8% chance to show a random character before settling
                    const shouldGlitch = Math.random() < 0.08;
                    const nextChar = shouldGlitch
                        ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
                        : text[charIndex];

                    setDisplayText(prev => prev.slice(0, charIndex) + nextChar);

                    if (!shouldGlitch) {
                        charIndex++;
                    }
                } else {
                    clearInterval(typingInterval);
                    setIsTyping(false);
                    onComplete?.();
                }
            }, 50); // Typing speed
        };

        timeout = setTimeout(startTyping, delay * 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [text, delay, onComplete]);

    // Cursor blink
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <div className="terminal-line">
            <span className="text-content">{displayText}</span>
            {isTyping && <span className="cursor">█</span>}
            {!isTyping && showCursor && text === TERMINAL_LINES[TERMINAL_LINES.length - 1] && (
                <span className="cursor">█</span>
            )}
        </div>
    );
};

export const BladeRunnerTerminal: React.FC = () => {
    const [visibleLines, setVisibleLines] = useState(1);

    return (
        <div className="blade-runner-terminal">
            <style jsx>{`
        .blade-runner-terminal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          z-index: 10000;
          pointer-events: none;
          background: radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);
          font-family: var(--font-share-tech-mono), monospace;
        }

        .terminal-line {
          font-size: 1.8rem;
          color: #ffaa00;
          text-transform: uppercase;
          letter-spacing: 0.5em;
          text-shadow: 0 0 20px rgba(255, 170, 0, 0.8),
                       0 0 40px rgba(255, 170, 0, 0.4);
          line-height: 1.2;
          text-align: center;
        }

        .cursor {
          color: #ffaa00;
          animation: glow 0.2s infinite alternate;
          margin-left: 0.2em;
        }

        @keyframes glow {
          from { opacity: 0.7; }
          to { opacity: 1; text-shadow: 0 0 25px #ffaa00; }
        }

        @media (min-width: 768px) {
          .terminal-line {
            font-size: 2.8rem;
          }
        }
      `}</style>

            {TERMINAL_LINES.map((line, index) => (
                index < visibleLines && (
                    <TerminalLine
                        key={index}
                        text={line}
                        delay={index * 1.5}
                        onComplete={() => {
                            if (index < TERMINAL_LINES.length - 1) {
                                setVisibleLines(prev => prev + 1);
                            }
                        }}
                    />
                )
            ))}
        </div>
    );
};
