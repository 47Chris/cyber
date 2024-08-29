import { AppState, initialAppState } from '@/src/state/appState'

export type Schema = Pick<AppState, 'session' | 'timer'> & {}

export type SchemaKey = keyof Schema

export const initialData: Schema = {
  session: initialAppState.session,
  timer: initialAppState.timer,
}
