type AppControlMessage =
| { type: 'NavigateToOidcTester' }

interface ElectronApi {
  readonly versions: Readonly<NodeJS.ProcessVersions>
  readonly onOpenUrl: (cb: (url: string) => void) => {
    unsubscribe(): void
  }
  readonly onAppControlMessage: (cb: (message: AppControlMessage) => void) => {
    unsubscribe(): void
  }
}

declare interface Window {
  electron: Readonly<ElectronApi>
  electronRequire?: NodeRequire
}
