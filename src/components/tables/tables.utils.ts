import {
  leadFinalConfig,
  leadQualConfig,
  leadQualResultsConfig,
  boulderQualConfig,
  boulderFinalConfig,
  speedQualConfig,
  ROUTES_PROP,
} from '@/shared/tables.configs'

import { Results, ResultsItem, SpeedFinalItem } from '@/shared/types'

export const isCommandMatch = (command: string, selectedCommand: string) =>
  !!selectedCommand && command.toLowerCase() === selectedCommand.toLowerCase()

export const isNameMatch = (name: string, names: string) => {
  const searchTerms = names
    .toLowerCase()
    .replaceAll(';', ',')
    .split(',')
    .map((term) => term.trim().replace(/\s+/g, ' '))
    .filter((term) => term !== '')

  const normalizedName = name.trim().toLowerCase()
  return searchTerms.some((term) => normalizedName.includes(term))
}

interface getConfigProps {
  isLead: boolean
  isBoulder: boolean
  isSpeed?: boolean
  isQualResult: boolean
  isFinal: boolean
}
export function getTableConfig({ isFinal, isQualResult, isLead, isBoulder, isSpeed }: getConfigProps) {
  if (isLead) {
    if (isFinal) {
      return leadFinalConfig
    }
    return isQualResult ? leadQualResultsConfig : leadQualConfig
  }
  if (isBoulder) {
    return isFinal ? boulderFinalConfig : boulderQualConfig
  }
  if (isSpeed && !isFinal) {
    return speedQualConfig
  }
  return leadQualConfig
}

type TableColumn = ReturnType<typeof getTableConfig>[number]
// Колонка трассы боулдеринга: r1, r2… r10…
export const isRouteProp = (prop?: string) => !!prop && /^r\d+$/.test(prop)

// Трасс в боулдеринге бывает сколько угодно (на неофициальных стартах 10 в квалификации, в финале больше 4):
// заглушку ROUTES_PROP из конфига разворачиваем в столько колонок, сколько трасс в протоколе
export function withRouteColumns(config: TableColumn[], result: object): TableColumn[] {
  const routesCount = Object.keys(result).filter(isRouteProp).length
  const routes = Array.from({ length: routesCount }, (_, i) => ({ name: String(i + 1), prop: `r${i + 1}`, id: `route-${i + 1}` }))
  return config.flatMap((col) => (col.prop === ROUTES_PROP ? routes : [col]))
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

// В финалах скорости соперник важен не меньше своего: оставляем забеги со своей командой целиком
export function filterOwnHeats(results: SpeedFinalItem[], command: string): SpeedFinalItem[] {
  const ownHeats = new Set(
    results.filter((result) => isCommandMatch(result.command, command)).map((result) => `${result.round}|${result.heat}`),
  )
  return results.filter((result) => ownHeats.has(`${result.round}|${result.heat}`))
}

export function getRowClasses({ result, command, names, isNamesFilterEnabled, isFinal }: getRowClassesProps) {
  const isSameCommandRow = !isNamesFilterEnabled && isCommandMatch(result.command, command)
  const isSameNameRow = isNamesFilterEnabled && isNameMatch(result.name, names)
  const rank = Number.parseInt(result['rank'])
  if (isSameCommandRow || isSameNameRow) {
    return ' bg-highlight'
  }
  if (result.isHighlighted || (result['rank'] && isFinal && PRIZE_PLACES >= rank)) {
    return ' bg-live-soft'
  }
  return ''
}

export function getClimbedCount({
  results,
  isLead,
  isBoulder,
  isSpeed,
}: {
  results: Results
  isLead: boolean
  isBoulder: boolean
  isSpeed?: boolean
}) {
  return results.filter((result) => {
    if (isBoulder) return 'rank' in result && result.rank !== ''
    if (isLead || isSpeed) return 'score' in result ? result.score !== '' : result.score1 !== ''
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
      finalBorderClass = 'border-t-2 border-t-live-line'
      shouldFinalBorder = false
    }
    return finalBorderClass
  })
}
