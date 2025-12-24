import { create } from 'zustand'

type Stage = 'INTRO' | 'MAIN_STAGE' | 'FINALE'
type HoverState = 'DEFAULT' | 'INTERACTABLE'

interface AppState {
  stage: Stage
  setStage: (stage: Stage) => void
  introFinished: boolean
  setIntroFinished: (finished: boolean) => void
  isGlitching: boolean
  setIsGlitching: (glitching: boolean) => void
  hoverState: HoverState
  setHoverState: (state: HoverState) => void
  hoverLabel: string | null
  setHoverLabel: (label: string | null) => void
}

export const useStore = create<AppState>((set) => ({
  stage: 'INTRO',
  setStage: (stage) => set({ stage }),
  introFinished: false,
  setIntroFinished: (finished) => set({ introFinished: finished }),
  isGlitching: false,
  setIsGlitching: (isGlitching) => set({ isGlitching }),
  hoverState: 'DEFAULT',
  setHoverState: (hoverState) => set({ hoverState }),
  hoverLabel: null,
  setHoverLabel: (hoverLabel) => set({ hoverLabel }),
}))
