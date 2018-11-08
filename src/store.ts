import { createDecorator } from 'vue-class-component'

function get<T extends any>(key: string, defaultValue: T): T
function get<T extends any>(key: string, defaultValue?: T): T | undefined {
  try {
    const item = localStorage.getItem(key)
    if (item) {
      return JSON.parse(item)
    } else {
      return defaultValue
    }
  } catch (err) {
    return defaultValue
  }
}

function set(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

export interface SharedState {
  theme: string
  vimModeEnabled: boolean
  showPreferences: boolean
}

const state: SharedState = {
  theme: 'dark-grad',
  vimModeEnabled: false,
  showPreferences: false,
}

const store = {
  state,

  load() {
    state.theme = get<string>('theme', state.theme)
    state.vimModeEnabled = get<boolean>('vimModeEnabled', state.vimModeEnabled)
  },

  commit<K extends keyof SharedState>(
    key: K,
    value: SharedState[K],
    persist: boolean = false
  ) {
    if (persist) {
      set(key, value)
    }

    state[key] = value
  },
}

export default store

export function State(
  options?:
    | { key?: keyof SharedState; persist?: boolean; readonly?: boolean }
    | keyof SharedState
) {
  return createDecorator((componentOptions, propertyKey) => {
    if (typeof componentOptions.computed === 'undefined') {
      componentOptions.computed = {}
    }

    let _key = propertyKey as keyof SharedState
    let _persist = false
    let _readonly = false

    if (typeof options === 'string') {
      _key = options
    } else if (options) {
      if (typeof options.key !== 'undefined') {
        _key = options.key
      }
      if (typeof options.persist !== 'undefined') {
        _persist = options.persist
      }
      if (typeof options.readonly !== 'undefined') {
        _readonly = options.readonly
      }
    }

    if (_readonly) {
      componentOptions.computed[propertyKey] = function() {
        return store.state[_key]
      }
    } else {
      componentOptions.computed[propertyKey] = {
        get() {
          return store.state[_key]
        },
        set(value: any) {
          store.commit(_key, value, _persist)
        },
      }
    }
  })
}
