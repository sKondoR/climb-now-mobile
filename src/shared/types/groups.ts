import { Status } from "./status"

export interface Group {
  id: string
  title: string
  isOnline: boolean
  subgroups: Subgroup[]
}

export interface Subgroup {
  id: string
  title: string
  link: string
  status: Status
  results: Results
}
export type Results = (LeadQualItem | LeadQualResultItem | LeadFinalsItem)[]

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

export type ResultsItem = LeadQualItem | LeadQualResultItem | LeadFinalsItem | BoulderQualItem | BoulderFinalItem

export interface SubgroupResults {
  [key: string]: {
    results: Results
    isLoading: boolean
    error: string | null
  }
}

export interface BoulderQualItem {
  isHighlighted?: boolean
  rank: string
  stRank: string
  name: string
  command: string
  r1: string
  r2: string
  r3: string
  r4: string
  r5: string
  score: string
}

export interface BoulderFinalItem {
  isHighlighted?: boolean
  rank: string
  stRank: string
  name: string
  command: string
  r1: string
  r2: string
  r3: string
  r4: string
  score: string
}

export interface SubGroupData {
  isLead: boolean
  isBoulder: boolean
  isQualResult: boolean
  isFinal: boolean
  data: Results
}

