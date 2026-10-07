
export const NAME_COL = 'имя';
export const COMMAND_COL = 'команда';
// Место колонок трасс в конфиге боулдеринга: withRouteColumns разворачивает его в r1..rN по протоколу
export const ROUTES_PROP = 'r1';

export const leadQualConfig = [
    { name: 'место', short: 'м', prop: 'rank' },
    {},
    { name: 'ст.#', short: 'ст', prop: 'stRank' },
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: 'результат', short: 'итог', prop: 'score' },
].map((item, i) => ({ ...item, id: `lq-${i}` }));

export const leadQualResultsConfig = [
    { name: 'место', short: 'м', prop: 'rank' },
    {},
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: 'тр.1', prop: 'score1' },
    { name: 'балл', prop: 'mark1' },
    { name: 'тр.2', prop: 'score2' },
    { name: 'балл', prop: 'mark2' },
    { name: 'итог', prop: 'mark' },
].map((item, i) => ({ ...item, id: `lqr-${i}` }));

export const leadFinalConfig = [
    { name: 'место', short: 'м', prop: 'rank' },
    {},
    { name: 'ст.#', short: 'ст', prop: 'stRank' },
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: 'кв.свод', short: 'кв', prop: 'qRank' },
    { name: 'результат', short: 'итог', prop: 'score' },
].map((item, i) => ({ ...item, id: `lqf-${i}` }));

export const boulderQualConfig = [
    { name: 'место', short: 'м', prop: 'rank' },
    {},
    { name: 'ст.#', short: 'ст', prop: 'stRank' },
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: '1', prop: ROUTES_PROP },
    { name: 'результат', short: 'итог', prop: 'score' },
].map((item, i) => ({ ...item, id: `bq-${i}` }));

export const boulderFinalConfig = [
    { name: 'место', short: 'м', prop: 'rank' },
    {},
    { name: 'ст.#', short: 'ст', prop: 'stRank' },
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: 'квал', short: 'кв', prop: 'qRank' },
    { name: '1', prop: ROUTES_PROP },
    { name: 'результат', short: 'итог', prop: 'score' },
].map((item, i) => ({ ...item, id: `bf-${i}` }));

// Классическая скорость (К) приходит с теми же полями, но без stRank2 — колонка отфильтруется по первой строке
export const speedQualConfig = [
    { name: 'место', short: 'м', prop: 'rank' },
    {},
    { name: 'ст.#', short: 'ст', prop: 'stRank' },
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: 'тр.1', prop: 'score1' },
    { name: 'ст.#2', short: 'ст2', prop: 'stRank2' },
    { name: 'тр.2', prop: 'score2' },
    { name: 'результат', short: 'итог', prop: 'score' },
].map((item, i) => ({ ...item, id: `sq-${i}` }));
