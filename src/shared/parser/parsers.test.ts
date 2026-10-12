import { describe, it, expect } from '@jest/globals'

import { parseResults, parseResultsTable,
  parseLeadQual,
  parseLeadQualResults,
  parseLeadFinal,
  parseBoulderQual,
  parseBoulderFinal,
  parseSpeedQual,
  parseSpeedFinal,
  mergeSpeedFinals,
  parseRouteCell,
  parseFragment,
  getTextContent,
  hasClass,
  getDisciplines,
  findElementsByTag
} from './parsers'
import {
  mockHtmlWith404,
  mockParsedLeadQual,
  mockParsedLeadQualResults,
  mockParsedLeadFinal,
  mockParsedBoulderQual,
  mockParsedBoulderFinal,
  mockParsedBoulderQualManyRoutes,
  mockParsedBoulderFinalManyRoutes,
  mockHtmlSpeedQual,
  mockParsedSpeedQual,
  mockHtmlSpeedFinal,
  mockParsedSpeedFinal,
  mockHtmlSpeedClassicQual,
  mockParsedSpeedClassicFinal,
  mockHtmlEnglishIndex,
  mockHtmlEnglishLeadSemiFinal,
  mockHtmlEnglishBoulderSemiFinal,
  mockHtmlEnglishSpeedIndex,
  mockHtmlEnglishSpeedQual,
} from './mocks/mockHtml'

describe('parsers', () => {
  describe('parseResults', () => {
    it('should return null for 404 page', () => {
      const result = parseResults(mockHtmlWith404)
      expect(result).toBeNull()
    })
    it('should handle empty HTML gracefully', () => {
      const result = parseResults('')
      expect(result).toStrictEqual([])
    })
    it('should treat online subgroups as passed when the page was last modified before today', () => {
      const result = parseResults(mockHtmlEnglishSpeedIndex, 'Sat, 30 May 2026 09:27:00 GMT')
      expect(result?.[0].groups[0].subgroups.map(({ status }) => status)).toStrictEqual(['passed', 'passed'])
    })
    it('should keep online subgroups when the page was modified today', () => {
      const result = parseResults(mockHtmlEnglishSpeedIndex, new Date().toUTCString())
      expect(result?.[0].groups[0].subgroups.map(({ status }) => status)).toStrictEqual(['passed', 'online'])
    })
  })

  describe('parseResultsTable', () => {
    it('should detect lead qualification results', () => {
      const result = parseResultsTable(`
        <!DOCTYPE html>
        <html>
        <head><title>Сводный результат трудность</title></head>
        <body>
          <h1>Сводный результат трудность</h1>
        </body>
        </html>
      `)
      expect(result.isLead).toBe(true)
      expect(result.isQualResult).toBe(true)
      expect(result.isFinal).toBe(false)
    })

    it('should detect lead qualification', () => {
      const result = parseResultsTable(`
        <!DOCTYPE html>
        <html>
        <head><title>Результаты трудность</title></head>
        <body>
          <h1>Результаты трудность</h1>
        </body>
        </html>
      `)
      expect(result.isLead).toBe(true)
      expect(result.isQualResult).toBe(false)
      expect(result.isFinal).toBe(false)
    })

    it('should detect boulder qualification', () => {
      const result = parseResultsTable(`
        <!DOCTYPE html>
        <html>
        <head><title>Результаты боулдеринг</title></head>
        <body>
          <h1>Результаты боулдеринг</h1>
        </body>
        </html>
      `)
      expect(result.isBoulder).toBe(true)
      expect(result.isFinal).toBe(false)
    })

    it('should detect boulder final', () => {
      const result = parseResultsTable(`
        <!DOCTYPE html>
        <html>
        <head><title>Финал боулдеринг</title></head>
        <body>
          <h1>Финал боулдеринг</h1>
        </body>
        </html>
      `)
      expect(result.isBoulder).toBe(true)
      expect(result.isFinal).toBe(true)
    })

    it('should detect and parse speed qualification', () => {
      const result = parseResultsTable(mockHtmlSpeedQual)
      expect(result.isSpeed).toBe(true)
      expect(result.isLead).toBe(false)
      expect(result.isBoulder).toBe(false)
      expect(result.isFinal).toBe(false)
      expect(result.data).toHaveLength(2)
    })

    it('should handle empty HTML gracefully', () => {
      const result = parseResultsTable('')
      expect(result.isLead).toBe(false)
      expect(result.isBoulder).toBe(false)
      expect(result.isQualResult).toBe(false)
      expect(result.isFinal).toBe(false)
    })
  })

  describe('parseSpeedQual', () => {
    it('should parse speed qualification table', () => {
      const result = parseSpeedQual(mockParsedSpeedQual)
      expect(result).toStrictEqual([
        {
          rank: '1',
          stRank: '23',
          name: 'Земляков Петр',
          command: 'ТЮМН',
          score1: '06,854',
          stRank2: '2',
          score2: '05,160',
          score: '05,160',
          isHighlighted: true,
        },
        {
          rank: '41',
          stRank: '8',
          name: 'Бадаев Григорий',
          command: 'МСК',
          score1: 'срыв',
          stRank2: '28',
          score2: 'срыв',
          score: 'срыв',
        },
      ])
    })
  })

  describe('parseSpeedClassicQual', () => {
    it('should parse classic speed qualification without second start number', () => {
      expect(parseResultsTable(mockHtmlSpeedClassicQual).data).toStrictEqual([{
        rank: '1',
        stRank: '25',
        name: 'Шепелева Софья',
        command: 'ПЕРМ',
        score1: '09,340',
        score2: '09,490',
        score: '18,830',
        isHighlighted: true,
      }])
    })
  })

  describe('parseSpeedFinal', () => {
    it('should detect speed final part', () => {
      const result = parseResultsTable(mockHtmlSpeedFinal)
      expect(result.isSpeed).toBe(true)
      expect(result.isFinal).toBe(true)
      expect(result.data).toHaveLength(8)
    })

    it('should split the bracket into rounds and heats, skipping medal column', () => {
      const semi = { round: 'Полуфинал', rank: '', command: '' }
      const final = { round: 'Финал', command: '' }
      expect(parseSpeedFinal(mockParsedSpeedFinal)).toStrictEqual([
        { ...semi, heat: 0, name: 'Земляков Петр', score: '05,300', isHighlighted: true },
        { ...semi, heat: 0, name: 'Мороз Михаил', score: 'срыв' },
        { ...semi, heat: 1, name: 'Колдомов Кирилл', score: '05,444', isHighlighted: true },
        { ...semi, heat: 1, name: 'Варик Денис', score: '06,500' },
        { ...final, heat: 0, rank: '2', name: 'Земляков Петр', score: '05,121' },
        { ...final, heat: 0, rank: '1', name: 'Колдомов Кирилл', score: '05,030', isHighlighted: true },
        { ...final, heat: 1, rank: '4', name: 'Мороз Михаил', score: '07,112' },
        { ...final, heat: 1, rank: '3', name: 'Варик Денис', score: '05,161', isHighlighted: true },
      ])
    })

    it('should parse classic speed bracket built from divs', () => {
      const semi = { round: 'Полуфинал', rank: '', command: '' }
      const final = { round: 'Финал', command: '' }
      expect(parseSpeedFinal(mockParsedSpeedClassicFinal)).toStrictEqual([
        { ...semi, heat: 0, name: 'Барях Ю.', score: '17,120', isHighlighted: true },
        { ...semi, heat: 0, name: 'Прокофьева К.', score: '21,030' },
        { ...semi, heat: 1, name: 'Черных А.', score: '18,190', isHighlighted: true },
        { ...semi, heat: 1, name: 'Шепелева С.', score: '20,950' },
        { ...final, heat: 0, rank: '2', name: 'Барях Ю.', score: '18,010' },
        { ...final, heat: 0, rank: '1', name: 'Черных А.', score: '17,570', isHighlighted: true },
        { ...final, heat: 1, rank: '4', name: 'Шепелева С.', score: 'срыв' },
        { ...final, heat: 1, rank: '3', name: 'Прокофьева К.', score: '21,450', isHighlighted: true },
      ])
    })

    it('should name rounds from the medal column when bracket starts at semifinal', () => {
      // Юниоры 19-20: колонки 1/4 (pc1) в сетке нет
      const html = `<h1>ЛАЗАНИЕ НА СКОРОСТЬ - Финальная часть</h1>
        <div class="p pc2 r9 win">Андреев Д.</div><div class="r rc2 r9 win">06,861</div>
        <div class="p pc2 r10">Бельченко Г.</div><div class="r rc2 r10">09,984</div>
        <div class="p pc2 r11 win">Коробкин С.</div><div class="r rc2 r11 win">08,178</div>
        <div class="p pc2 r12">Хамидуллин Д.</div><div class="r rc2 r12">срыв</div>
        <div class="p pc3 r13 win">Андреев Д.</div><div class="r rc3 r13 win">06,153</div>
        <div class="p pc3 r14">Коробкин С.</div><div class="r rc3 r14">07,062</div>
        <div class="p pc3 r15">Бельченко Г.</div><div class="r rc3 r15">09,164</div>
        <div class="p pc3 r16 win">Хамидуллин Д.</div><div class="r rc3 r16 win">05,999</div>
        <div class="p pc4 r17">Андреев Д.</div><div class="win r rc4 r17">I</div>
        <div class="p pc4 r18">Хамидуллин Д.</div><div class="win r rc4 r18">III</div>`
      const result = parseSpeedFinal(parseFragment(html))
      expect(result.map((item) => `${item.round}|${item.heat}|${item.rank}|${item.name}`)).toStrictEqual([
        'Полуфинал|0||Андреев Д.',
        'Полуфинал|0||Бельченко Г.',
        'Полуфинал|1||Коробкин С.',
        'Полуфинал|1||Хамидуллин Д.',
        'Финал|0|1|Андреев Д.',
        'Финал|0|2|Коробкин С.',
        'Финал|1|4|Бельченко Г.',
        'Финал|1|3|Хамидуллин Д.',
      ])
    })

    it('should skip empty bracket slots but keep heats in place', () => {
      // Юниорки 19-20: две участницы, первый полуфинал пустой, в финале соперницы нет
      const html = `<h1>ЛАЗАНИЕ НА СКОРОСТЬ - Финальная часть</h1>
        <div class="p pc2 r9">&nbsp;</div><div class="r rc2 r9">&nbsp;</div>
        <div class="p pc2 r10">&nbsp;</div><div class="r rc2 r10">&nbsp;</div>
        <div class="p pc2 r11 win">Петрова И.</div><div class="r rc2 r11 win">08,348</div>
        <div class="p pc2 r12">Набиуллина Э.</div><div class="r rc2 r12">10,641</div>
        <div class="p pc3 r13">&nbsp;</div><div class="r rc3 r13">&nbsp;</div>
        <div class="p pc3 r14 win">Петрова И.</div><div class="r rc3 r14 win">08,348</div>
        <div class="p pc3 r15">&nbsp;</div><div class="r rc3 r15">&nbsp;</div>
        <div class="p pc3 r16">&nbsp;</div><div class="r rc3 r16">&nbsp;</div>
        <div class="p pc4 r17">&nbsp;</div><div class="win r rc4 r17">I</div>
        <div class="p pc4 r18">&nbsp;</div><div class="win r rc4 r18">III</div>`
      const result = parseSpeedFinal(parseFragment(html))
      expect(result.map((item) => `${item.round}|${item.heat}|${item.rank}|${item.name}`)).toStrictEqual([
        'Полуфинал|1||Петрова И.',
        'Полуфинал|1||Набиуллина Э.',
        'Финал|0|1|Петрова И.',
      ])
    })

    it('should return empty list for empty bracket', () => {
      expect(parseSpeedFinal(parseFragment('<table><tbody></tbody></table>'))).toStrictEqual([])
    })
  })

  describe('mergeSpeedFinals', () => {
    const subgroup = (title: string, link: string, status: 'pending' | 'online' | 'passed') =>
      ({ id: link, title, link, status, results: [] })

    it('should keep one final tab named «Финал» with merged status', () => {
      const group = {
        id: 'g', title: 'Мужчины',
        subgroups: [
          subgroup('Квалификация', 'e_q_m', 'passed'),
          subgroup('1/8 финала', 'e16_f_m', 'passed'),
          subgroup('1/4 финала', 'e8_f_m', 'online'),
          subgroup('Полуфинал', 'e8_f_m', 'pending'),
          subgroup('Финал', 'e8_f_m', 'pending'),
        ],
      }
      expect(mergeSpeedFinals(group).subgroups).toStrictEqual([
        subgroup('Квалификация', 'e_q_m', 'passed'),
        subgroup('Финал', 'e16_f_m', 'online'),
      ])
    })
  })

  describe('parseLeadQual', () => {
    it('should parse lead qualification table', () => {
      const result = parseLeadQual(mockParsedLeadQual)
      expect(result).toStrictEqual([
        {
          command: 'КЛНД',
          name: 'Татищева Ксения',
          rank: '1',
          score: '31+',
          stRank: '19',
        },
        {
          command: 'СПБ',
          name: 'Зырянова Станислава',
          rank: '2',
          score: '30+',
          stRank: '18',
        },
        {
          command: 'МСК',
          name: 'Евдокимова Елена',
          rank: '2',
          score: '30+',
          stRank: '53',
        },
      ])
    })
  })

  describe('parseLeadQualResults', () => {
    it('should parse lead qualification results table', () => {
      const result = parseLeadQualResults(mockParsedLeadQualResults)
      expect(result).toStrictEqual([
        {
          command: 'КЛНД',
          isHighlighted: true,
          mark: '2,24',
          mark1: '1',
          mark2: '5',
          name: 'Татищева Ксения',
          rank: '1',
          score1: '31+',
          score2: '27+',
        },
        {
          command: 'МСК',
          mark: '2,24',
          mark1: '2,5',
          mark2: '2',
          name: 'Евдокимова Елена',
          rank: '1',
          score1: '30+',
          score2: '31+',
        },
        {
          command: 'ВРНЖ',
          mark: '2,65',
          mark1: '7',
          mark2: '1',
          name: 'Доброва Ксения',
          rank: '3',
          score1: '25+',
          score2: '34',
        },
      ])
    })
  })

  describe('parseLeadFinal', () => {
    it('should parse lead final table', () => {
      const result = parseLeadFinal(mockParsedLeadFinal)
      expect(result).toStrictEqual([
        {
          command: 'ВРНЖ',
          isHighlighted: true,
          name: 'Доброва Ксения',
          qRank: '3',
          rank: '1',
          score: '29+',
          stRank: '8',
        },
        {
          command: 'СПБ',
          isHighlighted: true,
          name: 'Зырянова Станислава',
          qRank: '6',
          rank: '2',
          score: '29+',
          stRank: '5',
        },
        {
          command: 'МСК',
          isHighlighted: true,
          name: 'Евдокимова Елена',
          qRank: '1',
          rank: '3',
          score: '28+',
          stRank: '10',
        },
      ])
    })
  })

  describe('parseBoulderQual', () => {
    it('should parse boulder qualification table', () => {
      const result = parseBoulderQual(mockParsedBoulderQual)
      expect(result).toStrictEqual([
        {
          command: 'КЛНД',
          isHighlighted: true,
          name: 'Боровков Арсений',
          r1: '2/2',
          r2: '2/2',
          r3: ' /1',
          r4: '1/1',
          r5: '1/1',
          rank: '1',
          score: '109,8',
          stRank: '1',
        },
        {
          command: 'СВРД',
          isHighlighted: true,
          name: 'Шулев Гавриил',
          r1: '1/1',
          r2: ' / ',
          r3: '1/1',
          r4: '1/1',
          r5: '6/6',
          rank: '2',
          score: '99,5',
          stRank: '2',
        },
        {
          command: 'ТЮМН',
          isHighlighted: true,
          name: 'Асташкин Елисей',
          r1: '2/1',
          r2: '6/3',
          r3: ' /2',
          r4: '1/1',
          r5: ' /1',
          rank: '3',
          score: '94,3',
          stRank: '18',
        },
      ])
    })
  })

  describe('parseBoulderFinal', () => {
    it('should parse boulder final table', () => {
      const result = parseBoulderFinal(mockParsedBoulderFinal)
      expect(result).toStrictEqual([
        {
          command: 'ЛЕНГ',
          isHighlighted: true,
          name: 'Нагорничных Яромир',
          qRank: '4',
          r1: '4/4',
          r2: ' /2',
          r3: ' /1',
          r4: ' /1',
          rank: '1',
          score: '54,6',
          stRank: '9',
        },
        {
          command: 'КЛНД',
          isHighlighted: true,
          name: 'Боровков Арсений',
          qRank: '1',
          r1: ' / ',
          r2: ' /7',
          r3: '4/1',
          r4: ' /1',
          rank: '2',
          score: '44,1',
          stRank: '12',
        },
        {
          command: 'ЛЕНГ',
          isHighlighted: true,
          name: 'Ганичев Максим',
          qRank: '12',
          r1: ' / ',
          r2: ' /8',
          r3: ' /1',
          r4: ' /1',
          rank: '3',
          score: '29,3',
          stRank: '1',
        },
      ])
    })
  })

  describe('boulder with arbitrary routes count', () => {
    it('should parse all qualification routes and the score after them, start number by its class', () => {
      expect(parseBoulderQual(mockParsedBoulderQualManyRoutes)).toStrictEqual([
        {
          command: 'Рязанская область',
          isHighlighted: true,
          name: 'Брит Максим',
          r1: '1/1',
          r2: '1/1',
          r3: '1/1',
          r4: '1/1',
          r5: '1/1',
          r6: '1/1',
          r7: '1/1',
          r8: '1/1',
          r9: ' /3',
          r10: '4/1',
          rank: '1',
          score: '249,7',
          stRank: '1',
        },
      ])
    })

    it('should parse all final routes and the score after them', () => {
      expect(parseBoulderFinal(mockParsedBoulderFinalManyRoutes)).toStrictEqual([
        {
          command: 'Московская область',
          name: 'Ващенко Илья',
          qRank: '1',
          r1: '1/1',
          r2: '2/2',
          r3: ' /1',
          r4: '7/1',
          r5: ' / ',
          r6: '3/2',
          rank: '1',
          score: '84,3',
          stRank: '8',
        },
      ])
    })
  })

  describe('parseRouteCell', () => {
    it('should parse route cell with r_2 class', () => {
      const html = '<div class="r_2">1<br>2</div>'
      const fragment = parseFragment(html)
      const result = parseRouteCell(fragment) 
      expect(result).toBe('1/2')
    })

    it('should parse route cell with r_1 class', () => {
      const html = '<div class="r_1"><br>1</div>'
      const fragment = parseFragment(html)
      const result = parseRouteCell(fragment)
      expect(result).toBe(' /1')
    })

    it('should parse route cell with r_0 class', () => {
      const html = '<div class="r_0"><br></div>'
      const fragment = parseFragment(html)
      const result = parseRouteCell(fragment)
      expect(result).toBe(' / ')
    })

    it('should handle empty or null input', () => {
      expect(parseRouteCell(null)).toBe('')
      expect(parseRouteCell(undefined)).toBe('')
    })

    it('should handle complex route cell structure', () => {
      const html = '<div class="r_2">2<br>2</div>'
      const fragment = parseFragment(html)
      const result = parseRouteCell(fragment)
      expect(result).toBe('2/2')
    })
  })

  describe('getTextContent', () => {
    it('should extract text content from element', () => {
      const html = '<div>Test Content</div>'
      const fragment = parseFragment(html)
      const result = getTextContent(fragment)
      expect(result).toBe('Test Content')
    })

    it('should extract text content from nested elements', () => {
      const html = '<div><span>Hello</span> <b>World</b></div>'
      const fragment = parseFragment(html)
      const result = getTextContent(fragment)
      expect(result).toBe('Hello World')
    })

    it('should handle empty element', () => {
      const html = '<div></div>'
      const fragment = parseFragment(html)
      const result = getTextContent(fragment)
      expect(result).toBe('')
    })

    it('should handle null input', () => {
      expect(getTextContent(null)).toBe('')
    })

    it('should handle undefined input', () => {
      expect(getTextContent(undefined)).toBe('')
    })

    it('should handle text-only node', () => {
      const html = 'Just text'
      const result = getTextContent(parseFragment(html))
      expect(result).toBe('Just text')
    })
  })

  describe('hasClass', () => {
    it('should return true when class exists', () => {
      const html = '<div class="test-class">Content</div>'
      const element =  findElementsByTag(parseFragment(html), 'div')[0]
      const result = hasClass(element, 'test-class')
      expect(result).toBe(true)
    })

    it('should return false when class does not exist', () => {
      const html = '<div class="other-class">Content</div>'
      const element =  findElementsByTag(parseFragment(html), 'div')[0]
      const result = hasClass(element, 'missing-class')
      expect(result).toBe(false)
    })

    it('should return false for null input', () => {
      expect(hasClass(null, 'test-class')).toBe(false)
    })

    it('should return false for undefined input', () => {
      expect(hasClass(undefined, 'test-class')).toBe(false)
    })

    it('should return false when node has no attrs', () => {
      const html = '<div>Content</div>'
      const element =  findElementsByTag(parseFragment(html), 'div')[0]
      const result = hasClass(element, 'test-class')
      expect(result).toBe(false)
    })

    it('should handle multiple classes', () => {
      const html = '<div class="class1 class2 class3">Content</div>'
      const element =  findElementsByTag(parseFragment(html), 'div')[0]
      expect(hasClass(element, 'class1')).toBe(true)
      expect(hasClass(element, 'class2')).toBe(true)
      expect(hasClass(element, 'class3')).toBe(true)
      expect(hasClass(element, 'class4')).toBe(false)
    })

    it('should handle class with hyphen', () => {
      const html = '<div class="my-class">Content</div>'
      const element =  findElementsByTag(parseFragment(html), 'div')[0]
      const result = hasClass(element, 'my-class')
      expect(result).toBe(true)
    })
  })

  describe('getDisciplines', () => {
    it('should extract disciplines from table headers', () => {
      const html = `
        <table>
          <thead>
            <tr>
              <th>Трудность</th>
              <th>Боулдеринг</th>
              <th>Скорость</th>
            </tr>
          </thead>
        </table>
      `
      const fragment = parseFragment(html)
      const result = getDisciplines(fragment)
      expect(result).toHaveLength(3)
      expect(result[0]).toBe('трудность')
      expect(result[1]).toBe('боулдеринг')
      expect(result[2]).toBe('скорость')
    })

    it('should tell classic speed «(К)» from speed', () => {
      const fragment = parseFragment(`
        <table><thead><tr>
          <th>ЛАЗАНИЕ НА СКОРОСТЬ (К)</th>
          <th>ЛАЗАНИЕ НА СКОРОСТЬ</th>
        </tr></thead></table>
      `)
      expect(getDisciplines(fragment)).toStrictEqual(['скорость (кл)', 'скорость'])
    })

    it('should return empty array when no disciplines found', () => {
      const html = `
        <table>
          <thead>
            <tr>
              <th>Other Header</th>
            </tr>
          </thead>
        </table>
      `
      const fragment = parseFragment(html)
      const result = getDisciplines(fragment)
      expect(result).toHaveLength(1)
      expect(result[0]).toBe('other header')
    })

    it('should handle case-insensitive matching', () => {
      const html = `
        <table>
          <thead>
            <tr>
              <th>ТРУДНОСТЬ</th>
              <th>БОУЛДЕРИНГ</th>
            </tr>
          </thead>
        </table>
      `
      const fragment = parseFragment(html)
      const result = getDisciplines(fragment)
      expect(result).toHaveLength(2)
      expect(result[0]).toBe('трудность')
      expect(result[1]).toBe('боулдеринг')
    })

    it('should return lowercase text when no discipline found', () => {
      const html = `
        <table>
          <thead>
            <tr>
              <th>Some Discipline Name</th>
            </tr>
          </thead>
        </table>
      `
      const fragment = parseFragment(html)
      const result = getDisciplines(fragment)
      expect(result[0]).toBe('some discipline name')
    })

    it('should handle multiple discipline headers', () => {
      const html = `
        <table>
          <thead>
            <tr>
              <th>Трудность</th>
              <th>Боулдеринг</th>
              <th>Абсолют</th>
            </tr>
          </thead>
        </table>
      `
      const fragment = parseFragment(html)
      const result = getDisciplines(fragment)
      expect(result).toHaveLength(3)
      expect(result).toContain('трудность')
      expect(result).toContain('боулдеринг')
      expect(result).toContain('абсолют')
    })

    it('should handle empty document', () => {
      const html = ''
      const fragment = parseFragment(html)
      const result = getDisciplines(fragment)
      expect(result).toHaveLength(0)
    })
  })

  describe('english protocols', () => {
    it('should map english discipline headers to the same disciplines', () => {
      const result = parseResults(mockHtmlEnglishIndex)
      expect(result?.map((d) => d.discipline)).toStrictEqual(['трудность', 'боулдеринг'])
      expect(result?.[0].groups[0].title).toBe('Female U17')
      expect(result?.[0].groups[0].subgroups.map((s) => s.link)).toStrictEqual(['l_2f_f15', 'l_f_f15'])
    })

    it('should parse lead semi-final without qualification rank column', () => {
      const result = parseResultsTable(mockHtmlEnglishLeadSemiFinal)
      expect(result.isLead).toBe(true)
      expect(result.isFinal).toBe(true)
      expect(result.data).toStrictEqual([
        { rank: '1', stRank: '2', name: 'TAN YOUTIAN', command: 'CHN', score: 'TOP', isHighlighted: true },
      ])
    })

    it('should parse boulder semi-final without start number column', () => {
      const result = parseResultsTable(mockHtmlEnglishBoulderSemiFinal)
      expect(result.isBoulder).toBe(true)
      expect(result.isFinal).toBe(true)
      expect(result.data).toStrictEqual([
        { rank: '1', name: 'TAN YOUTIAN', command: 'CHN', qRank: '0', r1: '1/1', r2: ' /1', score: '84,1', isHighlighted: true },
      ])
    })

    it('should merge english speed final rounds into one «Финал» tab', () => {
      const result = parseResults(mockHtmlEnglishSpeedIndex)
      expect(result?.[0].discipline).toBe('скорость')
      expect(result?.[0].groups[0].subgroups.map(({ title, link, status }) => ({ title, link, status }))).toStrictEqual([
        { title: 'Qualification', link: 'e_q_m15', status: 'passed' },
        { title: 'Финал', link: 'e8_f_m15', status: 'online' },
      ])
    })

    it('should parse speed qualification', () => {
      const result = parseResultsTable(mockHtmlEnglishSpeedQual)
      expect(result.isSpeed).toBe(true)
      expect(result.isFinal).toBe(false)
      expect(result.data).toStrictEqual([
        { rank: '1', stRank: '3', name: 'LI HAO', command: 'CHN', score1: '06,854', stRank2: '2', score2: '05,160', score: '05,160', isHighlighted: true },
      ])
    })
  })
})
