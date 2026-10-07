import { Status } from "./status"

export interface Group {
  id: string
  title: string
  subgroups: Subgroup[]
}

export interface Subgroup {
  id: string
  title: string
  link: string
  status: Status
  results: Results
}
export type Results = (LeadQualItem | LeadQualResultItem | LeadFinalsItem | SpeedFinalItem)[]

export interface LeadQualItem {
  isHighlighted?: boolean
  rank: string
  stRank: string
  name: string
  command: string
  score: string
}

export interface LeadQualResultItem {
  isHighlighted?: boolean
  rank: string
  name: string
  command: string
  score1: string
  mark1: string
  score2: string
  mark2: string
  mark: string
}

export interface LeadFinalsItem {
  isHighlighted?: boolean
  rank: string
  stRank: string
  name: string
  command: string
  qRank: string
  score: string
}

export type ResultsItem = LeadQualItem | LeadQualResultItem | LeadFinalsItem | BoulderQualItem | BoulderFinalItem | SpeedQualItem | SpeedFinalItem

export interface SubgroupResults {
  [key: string]: {
    results: Results
    isLoading: boolean
    error: string | null
  }
}

export interface BoulderQualItem {
  isHighlighted?: boolean
  // Трассы: r1, r2… — сколько их в протоколе
  [route: `r${number}`]: string
  rank: string
  stRank: string
  name: string
  command: string
  score: string
}

export interface BoulderFinalItem {
  isHighlighted?: boolean
  // Трассы: r1, r2… — сколько их в протоколе
  [route: `r${number}`]: string
  rank: string
  stRank: string
  name: string
  command: string
  score: string
}

export interface SpeedQualItem {
  isHighlighted?: boolean
  rank: string
  stRank: string
  name: string
  command: string
  score1: string
  // Только в обычной скорости: в классической (К) второго стартового номера нет
  stRank2?: string
  score2: string
  score: string
}

// Один участник забега финальной части скорости. Победитель забега — isHighlighted, место есть только у финалистов
export interface SpeedFinalItem {
  isHighlighted?: boolean
  rank: string
  name: string
  command: string
  score: string
  round: string
  heat: number
}

export interface SubGroupData {
  isLead: boolean
  isBoulder: boolean
  isSpeed: boolean
  isQualResult: boolean
  isFinal: boolean
  data: Results
}

