interface FoundryUser {
  isGM: boolean
  can(action: string): boolean
}

interface FoundryFolder {
  id: string
  name: string
  type: string
}

interface FoundryActor {
  id: string
  name: string
  sheet: { render(force: boolean): unknown } | null
}

interface FoundryModule {
  api?: unknown
}

interface FoundryDialogButton<T> {
  label: string
  icon?: string
  callback?: (event: Event, button: HTMLButtonElement) => T | Promise<T>
}

interface FoundryDialogPromptConfig<T> {
  window?: { title: string; icon?: string }
  classes?: string[]
  position?: { width?: number }
  content: string
  rejectClose?: boolean
  ok: FoundryDialogButton<T>
}

interface FoundryApplication {
  options: { classes: string[] }
}

declare const game: {
  user: FoundryUser | null
  system: { id: string }
  folders?: {
    find(
      predicate: (folder: FoundryFolder) => boolean
    ): FoundryFolder | undefined
  }
  modules: { get(id: string): FoundryModule | undefined }
}

declare const Hooks: {
  on(
    hook: "renderActorDirectory",
    fn: (app: unknown, html: HTMLElement | ArrayLike<HTMLElement>) => void
  ): number
  on(
    hook: "renderDialogV2",
    fn: (app: FoundryApplication, element: HTMLElement) => void
  ): number
  once(hook: "init" | "ready", fn: () => void): number
}

declare const Actor: {
  create(data: object): Promise<FoundryActor | undefined>
}

declare const Folder: {
  create(data: object): Promise<FoundryFolder | undefined>
}

declare const ui: {
  notifications: {
    info(message: string): void
    warn(message: string): void
    error(message: string): void
  }
}

declare const foundry: {
  applications: {
    api: {
      DialogV2: {
        prompt<T>(config: FoundryDialogPromptConfig<T>): Promise<T | null>
      }
    }
  }
}
