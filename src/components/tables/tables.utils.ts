import {
  leadFinalConfig,
  leadQualConfig,
  leadQualResultsConfig,
  boulderQualConfig,
  boulderFinalConfig,
} from '@/shared/tables.configs'

import { Results, ResultsItem } from '@/shared/types'

export const isCommandMatch = (command: string, selectedCommand: string) =>
  !!selectedCommand && command.toLowerCase() === selectedCommand.toLowerCase()

export const isNameMatch = (name: string, names: string) =>
  !!names
    .toLowerCase()
    .replaceAll('  ', ' ')
    .replaceAll(',  ', ',')
    .replaceAll(';', ',')
    .split(',')
    .find((a) => name.trim().toLowerCase().includes(a.trim().toLowerCase()))

interface getConfigProps {
  isLead: boolean
  isBoulder: boolean
  isQualResult: boolean
  isFinal: boolean
}
export function getTableConfig({ isFinal, isQualResult, isLead, isBoulder }: getConfigProps) {
  if (isLead) {
    if (isFinal) {
      return leadFinalConfig
    }
    return isQualResult ? leadQualResultsConfig : leadQualConfig
  }
  if (isBoulder) {
    return isFinal ? boulderFinalConfig : boulderQualConfig
  }
  return leadQualConfig
}

interface getRowClassesProps {
  result: ResultsItem
  command: string
  names: string
  isNamesFilterEnabled: boolean
  isFinal: boolean
}

export const PRIZE_PLACES = 3
export const LEAD_FINAL_PLACES = 10
export const BOULDER_FINAL_PLACES = 12
export const PARTICIPANTS_COEF = 0.75

export const getFinalPlaces = (resultsLength: number, standard: number) => {
  const mathPlaces = Math.ceil(resultsLength * PARTICIPANTS_COEF)
  if (mathPlaces >= standard) {
    return standard
  }
  if (mathPlaces >= standard - 2) {
    return standard - 2
  }
  if (mathPlaces >= standard - 4) {
    return standard - 4
  }
  return standard - 6
}

export function getRowClasses({ result, command, names, isNamesFilterEnabled, isFinal }: getRowClassesProps) {
  const isSameCommandRow = !isNamesFilterEnabled && isCommandMatch(result.command, command)
  const isSameNameRow = isNamesFilterEnabled && isNameMatch(result.name, names)
  const rank = Number.parseInt(result['rank'])
  if (isSameCommandRow || isSameNameRow) {
    return ' bg-blue-200'
  }
  if (result.isHighlighted || (result['rank'] && isFinal && PRIZE_PLACES >= rank)) {
    return ' bg-green-200'
  }
  return ''
}

export function getClimbedCount({
  results,
  isLead,
  isBoulder,
}: {
  results: Results
  isLead: boolean
  isBoulder: boolean
}) {
  return results.filter((result) => {
    if (isBoulder) return 'rank' in result && result.rank !== ''
    if (isLead) return 'score' in result ? result.score !== '' : result.score1 !== ''
    return results.length
  }).length
}

// Возвращает по одному className на каждую строку: разделительная рамка ставится под последней
// подряд идущей "призовой" (isHighlighted) строкой. Вынесено в отдельную функцию, а не мутация
// переменной прямо в JSX .map(), чтобы не нарушать чистоту рендера (react-compiler это запрещает).
export function getFinalBorderClasses(results: ResultsItem[]): string[] {
  let shouldFinalBorder = false
  return results.map((result) => {
    let finalBorderClass = ''
    if (result.isHighlighted) {
      shouldFinalBorder = true
    }
    if (shouldFinalBorder && !result.isHighlighted) {
      finalBorderClass = 'border-t-2 border-t-green-500'
      shouldFinalBorder = false
    }
    return finalBorderClass
  })
}
