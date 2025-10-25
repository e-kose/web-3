/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PACKAGE_ID: string
  readonly VITE_REGISTRY_ID: string
  readonly VITE_NETWORK: string
  readonly VITE_RPC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
