import { parse } from 'parse5'

import { leadQualConfig, leadQualResultsConfig, leadFinalConfig, boulderQualConfig, boulderFinalConfig, speedQualConfig, speedClassicQualConfig } from '@/shared/tables.configs'

import type { Parse5Document, Parse5Element, Parse5Node, Parse5DocumentFragment, Parse5ChildNode } from './parsers.types'

import { Group, LeadQualItem, LeadQualResultItem, SubGroupData, Results, LeadFinalsItem, Discipline, BoulderQualItem, BoulderFinalItem, SpeedQualItem, SpeedFinalItem } from '@/shared/types'
import { DISCIPLINES, STATUSES } from '../constants'

export const parseFragment = (html: string): Parse5DocumentFragment => {
  const document = parse(html, { sourceCodeLocationInfo: true })
  return document as unknown as Parse5DocumentFragment
}

// Ключевые слова дисциплин в заголовках. Протоколы международных стартов — на английском: «Female U17 - BOULDER - Semi-Final».
// Классическая скорость — раньше обычной, иначе её перехватит «скорость»
const DISCIPLINE_KEYWORDS: [string, string[]][] = [
  [DISCIPLINES.LEAD, [DISCIPLINES.LEAD, 'lead']],
  [DISCIPLINES.BOULRER, [DISCIPLINES.BOULRER, 'boulder']],
  [DISCIPLINES.SPEED_CLASSIC, [DISCIPLINES.SPEED_CLASSIC]],
  [DISCIPLINES.SPEED, [DISCIPLINES.SPEED, 'speed']],
]

// text — в нижнем регистре
const matchDiscipline = (text: string): string =>
  DISCIPLINE_KEYWORDS.find(([, words]) => words.some((word) => text.includes(word)))?.[0] ?? ''

// Копия парсера веб-версии (climb-now/src/shared/parser) — запасной путь, когда climbnow.ru недоступен (см. services.ts).
// При изменении вёрстки c-f-r.ru правится в обоих проектах.

// Раунд называем по удалённости от финала: 0 — финал, 1 — полуфинал, 2 — 1/4, 3 — 1/8
const getSpeedRoundName = (stepsToFinal: number) => {
  if (stepsToFinal === 0) return 'Финал'
  if (stepsToFinal === 1) return 'Полуфинал'
  return `1/${2 ** stepsToFinal} финала`
}

// Полуфинал тоже «финал»: «полуфинал», «Semi-Final»
const isFinalTitle = (title: string) => /финал|final/i.test(title)

// Москва — постоянно UTC+3. Без toLocaleDateString с timeZone: в Hermes поддержка Intl зависит от платформы,
// а исключение здесь обнулило бы весь parseResults
const moscowDay = (date: Date) => new Date(date.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10)

// ФСР иногда оставляет этап «онлайн» после окончания соревнований. Даты в протоколе нет, поэтому смотрим
// на Last-Modified страницы: если она не менялась с прошлых суток (по Москве), онлайн-этапов уже нет
const isStalePage = (lastModified?: string) => {
  if (!lastModified) return false
  const modifiedAt = new Date(lastModified)
  return !isNaN(modifiedAt.getTime()) && moscowDay(modifiedAt) < moscowDay(new Date())
}

export const parseResults = (html: string, lastModified?: string): Discipline[] | null => {
  try {
    const onlineStatus = isStalePage(lastModified) ? STATUSES.PASSED : STATUSES.ONLINE
    const document = parseFragment(html)
    
    const documentTitle = getTextContent(findElementsByTag(document, 'h1')[0]).toLowerCase()
    const isNotFound = documentTitle.includes('404')

    if (isNotFound) return null
   
    const disciplines = getDisciplines(document)
    const disciplineColumns = findElementsByTag(document as unknown as Parse5Document, 'td')

    const data = [] as Discipline[]

    disciplines.forEach((discipline, index) => {
      const groups: Group[] = []
      const column = disciplineColumns[index]

      const elements = findElementsByTag(column, 'div').filter(el => hasClass(el, 'g_title') || hasClass(el, 'p_l'))
      let currentGroup: Group | null = null
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        const title = getTextContent(element) || `Группа ${i + 1}`

        if (hasClass(element, 'p_l') && currentGroup?.subgroups) {
          const linkEl = findElementsByTag(element, 'a')[0]
          if (!linkEl) continue
          const statusEl = findElementsByTag(linkEl as Parse5Element, 'div')[0]
          if (!statusEl) continue
          const statusClass = statusEl.attrs.find((a: { name: string; value: string }) => a.name === 'class')?.value
          if (!statusClass) continue
          currentGroup.subgroups.push({
            id: `subgroup-${i}`,
            title,
            link: linkEl.attrs.find((a: { name: string; value: string }) => a.name === 'href')?.value.replace('.html', '') || '',
            status: statusClass === 'l_pas' ? STATUSES.PASSED : (statusClass === 'l_run' ? onlineStatus : STATUSES.PENDING),
            results: [],
          })
        } else if (hasClass(element, 'g_title')) {
          if (currentGroup) {
            groups.push(currentGroup)
          }
          currentGroup = {
            id: `group-${i}`,
            title,
            subgroups: []
          }
        }
      }
      if (currentGroup) {
        groups.push(currentGroup)
        currentGroup = null
      }
      data.push({
        discipline,
        groups: discipline === DISCIPLINES.SPEED || discipline === DISCIPLINES.SPEED_CLASSIC ? groups.map(mergeSpeedFinals) : groups,
      })
    })
    
    return data
    
  } catch (error) {
    console.error('Error parsing HTML:', error)
    return null
  }
}

export const parseResultsTable = (html: string): SubGroupData => {
  const document = parseFragment(html)
  const documentTitle = getTextContent(findElementsByTag(document as unknown as Parse5Document, 'h1')[0]).toLowerCase()
  const discipline = matchDiscipline(documentTitle)
  const isLead = discipline === DISCIPLINES.LEAD
  const isBoulder = discipline === DISCIPLINES.BOULRER
  const isSpeed = discipline === DISCIPLINES.SPEED || discipline === DISCIPLINES.SPEED_CLASSIC
  const isQualResult = documentTitle.includes('сводный')
  const isFinal = isFinalTitle(documentTitle)

  const result = {
    isLead,
    isBoulder,
    isSpeed,
    isQualResult,
    isFinal,
    data: [] as Results,
  }
  if (isLead && isQualResult && !isFinal) {
    result.data = parseLeadQualResults(document as unknown as Parse5DocumentFragment)
  }
  if (isLead && !isQualResult && !isFinal) {
    result.data = parseLeadQual(document)
  }
  if (isLead && isFinal) {
    result.data = parseLeadFinal(document)
  }
  if (isBoulder && !isFinal) {
    result.data = parseBoulderQual(document)
  }
  if (isBoulder && isFinal) {
    result.data = parseBoulderFinal(document)
  }
  if (isSpeed && !isFinal) {
    result.data = documentTitle.includes('(к)') ? parseSpeedClassicQual(document) : parseSpeedQual(document)
  }
  if (isSpeed && isFinal) {
    result.data = parseSpeedFinal(document)
  }
  return result
}

// Колонки, которые узнаём по классу ячейки, а не по позиции: на разных стартах они идут в разном порядке (id, st или st, id),
// а часть пропущена (в английских протоколах нет ст.# у боулдеринга и кв.свода у трудности)
const CLASS_PROPS: Record<string, string> = { rank: 'rank', st: 'stRank', name: 'name', command: 'command', pre: 'qRank' }

export const parseTable = <T>(document: Parse5DocumentFragment, config: { prop: keyof T }[]): T[] => {
  const tbody = findElementsByTag(document, 'tbody')[0]
  const rows = findElementsByTag(tbody, 'tr')
  const props = config.map((item) => item.prop as string).filter(Boolean)
  // Остальные колонки (результаты трасс) раскладываем по порядку
  const positionalProps = props.filter((prop) => !Object.values(CLASS_PROPS).includes(prop))

  const results: T[] = []

  rows.forEach((row: Parse5Element) => {
    const isHighlighted = hasClass(row, 'q')
    const cells = findElementsByTag(row, 'td')
    // Трасс в боулдеринге может быть больше, чем в конфиге (неофициальные старты): берём все ячейки .route подряд,
    // а следующую за ними — как результат
    let boulderCount = 0
    let positionalIndex = 0
    const data: Partial<Record<string, string>> = {}
    for (const cell of cells) {
      if (hasClass(cell, 'route')) {
        boulderCount++
        data[`r${boulderCount}`] = parseRouteCell(cell)
        continue
      }
      if (boulderCount > 0) {
        data.score = getTextContent(cell)
        break
      }
      if (hasClass(cell, 'id')) continue
      const classProp = Object.entries(CLASS_PROPS).find(([className]) => hasClass(cell, className))?.[1]
      if (classProp) {
        if (props.includes(classProp)) data[classProp] = getTextContent(cell)
      } else if (positionalProps[positionalIndex]) {
        data[positionalProps[positionalIndex++]] = getTextContent(cell)
      }
    }
    results.push((isHighlighted ? { ...data, isHighlighted } : data) as T)
  })
  
  return results
}

export const parseLeadQual = (document: Parse5DocumentFragment): LeadQualItem[] => {
  return parseTable<LeadQualItem>(document, leadQualConfig as { prop: keyof LeadQualItem }[])
}

export const parseLeadQualResults = (document: Parse5DocumentFragment): LeadQualResultItem[] => {
  return parseTable<LeadQualResultItem>(document, leadQualResultsConfig as { prop: keyof LeadQualResultItem }[])
}

export const parseLeadFinal = (document: Parse5DocumentFragment): LeadFinalsItem[] => {
  return parseTable<LeadFinalsItem>(document, leadFinalConfig as { prop: keyof LeadFinalsItem }[])
}

export const parseBoulderQual = (document: Parse5DocumentFragment): BoulderQualItem[] => {
  return parseTable<BoulderQualItem>(document, boulderQualConfig as { prop: keyof BoulderQualItem }[])
}

export const parseBoulderFinal = (document: Parse5DocumentFragment): BoulderFinalItem[] => {
  return parseTable<BoulderFinalItem>(document, boulderFinalConfig as { prop: keyof BoulderFinalItem }[])
}

export const parseSpeedQual = (document: Parse5DocumentFragment): SpeedQualItem[] => {
  return parseTable<SpeedQualItem>(document, speedQualConfig as { prop: keyof SpeedQualItem }[])
}

export const parseSpeedClassicQual = (document: Parse5DocumentFragment): SpeedQualItem[] => {
  return parseTable<SpeedQualItem>(document, speedClassicQualConfig as { prop: keyof SpeedQualItem }[])
}

// 1/8, 1/4, полуфинал и финал скорости ведут на одну и ту же сетку: оставляем один таб «Финал»
export const mergeSpeedFinals = (group: Group): Group => {
  const finals = group.subgroups.filter((subgroup) => isFinalTitle(subgroup.title))
  if (finals.length === 0) return group
  const statuses = finals.map((subgroup) => subgroup.status)
  const status = statuses.includes(STATUSES.ONLINE)
    ? STATUSES.ONLINE
    : (statuses.includes(STATUSES.PASSED) ? STATUSES.PASSED : STATUSES.PENDING)
  return {
    ...group,
    subgroups: group.subgroups
      .filter((subgroup) => !finals.includes(subgroup) || subgroup === finals[0])
      .map((subgroup) => subgroup === finals[0] ? { ...subgroup, title: 'Финал', status } : subgroup),
  }
}

// pos — колонка раунда в сетке; isMedal — колонка победителей забегов за I и III место после финала.
// Пустые места (у группы меньше участников, чем мест в сетке) остаются с пустым именем: по ним считаются забеги
type SpeedBracketEntry = { pos: number, name: string, score: string, isWinner: boolean, isMedal: boolean }

// Таблица: каждый раунд — своя пара колонок «имя, время», забеги идут парами сверху вниз.
// В колонке медалей рядом с именем стоит ячейка .rank («I», «III»)
const getTableBracketEntries = (tbody: Parse5Element): SpeedBracketEntry[] => {
  const entries: SpeedBracketEntry[] = []
  findElementsByTag(tbody, 'tr').forEach((row) => {
    const cells = findElementsByTag(row, 'td')
    cells.forEach((cell, pos) => {
      if (!hasClass(cell, 'name')) return
      entries.push({ pos, name: getTextContent(cell), score: getTextContent(cells[pos + 1]), isWinner: hasClass(cell, 'win'), isMedal: hasClass(cells[pos + 1], 'rank') })
    })
  })
  return entries
}

// Блоки div: имя .p, время .r, раунд в классе pc1, pc2…, строка в r1, r2…
// В колонке медалей вместо времени «I», «III». Колонки ранних раундов у маленьких групп нет совсем
const getDivBracketEntries = (document: Parse5DocumentFragment): SpeedBracketEntry[] => {
  const getNumber = (el: Parse5Element, prefix: string) => {
    const className = el.attrs.find((a) => a.name === 'class')?.value.split(' ').find((c) => c.startsWith(prefix) && /^\d+$/.test(c.slice(prefix.length)))
    return className ? Number(className.slice(prefix.length)) : NaN
  }
  const divs = findElementsByTag(document, 'div')
  return divs
    .filter((div) => hasClass(div, 'p'))
    .map((div) => {
      const row = getNumber(div, 'r')
      const score = getTextContent(divs.find((d) => hasClass(d, 'r') && hasClass(d, `r${row}`)))
      return { row, pos: getNumber(div, 'pc'), name: getTextContent(div), score, isWinner: hasClass(div, 'win'), isMedal: /^I{1,3}$/.test(score) }
    })
    .sort((a, b) => a.row - b.row)
    .map(({ pos, name, score, isWinner, isMedal }) => ({ pos, name, score, isWinner, isMedal }))
}

// Колонки раундов по порядку и сколько шагов от каждой до финала.
// Финал — колонка перед медалями. Пока медалей в сетке нет, число раундов считаем по размеру первого раунда
const getSpeedRounds = (entries: SpeedBracketEntry[]) => {
  const positions = [...new Set(entries.filter((entry) => !entry.isMedal).map((entry) => entry.pos))].sort((a, b) => a - b)
  const medalPositions = entries.filter((entry) => entry.isMedal).map((entry) => entry.pos)
  if (medalPositions.length) {
    const roundPositions = positions.filter((pos) => pos < Math.min(...medalPositions))
    return roundPositions.map((pos, i) => ({ pos, stepsToFinal: roundPositions.length - 1 - i }))
  }
  const roundsCount = Math.round(Math.log2(entries.filter((entry) => entry.pos === positions[0]).length))
  return positions.slice(0, roundsCount).map((pos, i) => ({ pos, stepsToFinal: roundsCount - 1 - i }))
}

export const parseSpeedFinal = (document: Parse5DocumentFragment): SpeedFinalItem[] => {
  const tbody = findElementsByTag(document, 'tbody')[0]
  const entries = tbody ? getTableBracketEntries(tbody) : getDivBracketEntries(document)
  if (!entries.length) return []

  const results: SpeedFinalItem[] = []
  getSpeedRounds(entries).forEach(({ pos, stepsToFinal }) => {
    const isLast = stepsToFinal === 0
    const roundEntries = entries.filter((entry) => entry.pos === pos)
    roundEntries.forEach((entry, i) => {
      if (!entry.name) return
      const heat = Math.floor(i / 2)
      const isHeatDone = roundEntries.slice(heat * 2, heat * 2 + 2).some((e) => e.isWinner)
      // Забег за I место первый, за III — второй: победитель получает 1 или 3, проигравший 2 или 4
      const rank = isLast && heat < 2 && isHeatDone ? String(heat * 2 + (entry.isWinner ? 1 : 2)) : ''
      const item: SpeedFinalItem = { rank, name: entry.name, command: '', score: entry.score, round: getSpeedRoundName(stepsToFinal), heat }
      results.push(entry.isWinner ? { ...item, isHighlighted: true } : item)
    })
  })
  return results
}

export const findElementsByTag = (node: Parse5Node | null | undefined, tagName: string): Parse5Element[] => {
  const result: Parse5Element[] = []
  
  if (!node) return result
  
  const traverse = (node: Parse5Node) => {
    if (node.nodeName === tagName) {
      result.push(node as Parse5Element)
    }
    if ('childNodes' in node && node.childNodes) {
      node.childNodes.forEach((child: Parse5ChildNode) => traverse(child))
    }
  }
  
  traverse(node)
  return result
}

export const getTextContent = (node: Parse5Node | null | undefined): string => {
  if (!node) return ''

  let text = ''

  const traverse = (node: Parse5Node) => {
    if (node.nodeName === '#text' && 'value' in node) {
      text += node.value
    } else if ('childNodes' in node && node.childNodes) {
      node.childNodes.forEach((child: Parse5ChildNode) => traverse(child))
    }
  }

  traverse(node)
  return text.trim()
}

export const hasClass = (node: Parse5Node | null | undefined, className: string): boolean => {
  if (!node || !('attrs' in node)) return false
  const attrs = (node as Parse5Element).attrs
  if (!attrs) return false
  const classAttr = attrs.find((attr: { name: string; value: string }) => attr.name === 'class')
  return classAttr?.value?.split(' ').includes(className) || false
}

export const getDisciplines = (document: Parse5DocumentFragment) => {
  return findElementsByTag(document as unknown as Parse5Document, 'th').map((th: Parse5Element) => {
    const text = getTextContent(th).toLowerCase()
    const current = matchDiscipline(text)
    if (current === DISCIPLINES.SPEED && text.includes('(к)')) return DISCIPLINES.SPEED_CLASSIC
    return current || text
  })
}

export const parseRouteCell = (node: Parse5Node | null | undefined): string => {
  if (!node) return ''
  
  const values: string[] = []
  
  const traverse = (node: Parse5Node) => {
    if (hasClass(node, 'r_2')) {
      if ('childNodes' in node && Array.isArray(node.childNodes)) {
        node.childNodes.forEach((routeChild: Parse5ChildNode) => {
          if (routeChild.nodeName === '#text' && 'value' in routeChild) {
            const text = routeChild.value.trim()
            if (text) {
              values.push(text)
            } else {
              values.push(' ')
            }
          }
        })
      }
    } else if (hasClass(node, 'r_0')) {
      values.push(' ', ' ');
    } else if (hasClass(node, 'r_1')) {
      values.push(' ', getTextContent(node));
    }
    else if ('childNodes' in node && node.childNodes) {
      node.childNodes.forEach((child: Parse5ChildNode) => traverse(child))
    }
  }
  
    traverse(node)
  return values.join('/')
}
