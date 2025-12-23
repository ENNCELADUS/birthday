import { create } from 'zustand'

type Stage = 'INTRO' | 'MAIN_STAGE' | 'FINALE'

interface AppState {
  stage: Stage
  setStage: (stage: Stage) => void
  introFinished: boolean
  setIntroFinished: (finished: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  stage: 'INTRO',
  setStage: (stage) => set({ stage }),
  introFinished: false,
  setIntroFinished: (finished) => set({ introFinished: finished }),
}))
