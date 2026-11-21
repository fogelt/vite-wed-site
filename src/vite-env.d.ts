/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Overrides where the contact form posts; defaults to the sign site. */
  readonly VITE_CONTACT_API_URL?: string;
}
