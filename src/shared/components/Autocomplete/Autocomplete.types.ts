export interface DataItem<T = unknown> {
  [key: string]: T
}

export type Item = string | DataItem | Record<string, unknown>

