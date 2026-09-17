
export const NAME_COL = 'имя';
export const COMMAND_COL = 'команда';

export const leadQualConfig = [
    { name: 'место', prop: 'rank' },
    {},
    { name: 'ст.#', prop: 'stRank' },
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: 'результат', prop: 'score' },
].map((item, i) => ({ ...item, id: `lq-${i}` }));

export const leadQualResultsConfig = [
    { name: 'место', prop: 'rank' },
    {},
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: 'тр.1', prop: 'score1' },
    { name: 'балл', prop: 'mark1' },
    { name: 'тр.2', prop: 'score2' },
    { name: 'балл', prop: 'mark2' },
    { name: 'баллы', prop: 'mark' },
].map((item, i) => ({ ...item, id: `lqr-${i}` }));

export const leadFinalConfig = [
    { name: 'место', prop: 'rank' },
    {},
    { name: 'ст.#', prop: 'stRank' },
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: 'кв.свод', prop: 'qRank' },
    { name: 'результат', prop: 'score' },
].map((item, i) => ({ ...item, id: `lqf-${i}` }));

export const boulderQualConfig = [
    { name: 'место', prop: 'rank' },
    {},
    { name: 'ст.#', prop: 'stRank' },
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: '1', prop: 'r1' },
    { name: '2', prop: 'r2' },
    { name: '3', prop: 'r3' },
    { name: '4', prop: 'r4' },
    { name: '5', prop: 'r5' },
    { name: '6', prop: 'r6' },
    { name: '7', prop: 'r7' },
    { name: '8', prop: 'r8' },
    { name: 'результат', prop: 'score' },
].map((item, i) => ({ ...item, id: `bq-${i}` }));

export const boulderFinalConfig = [
    { name: 'место', prop: 'rank' },
    {},
    { name: 'ст.#', prop: 'stRank' },
    { name: NAME_COL, prop: 'name' },
    { name: COMMAND_COL, prop: 'command' },
    { name: 'квал', prop: 'qRank' },
    { name: '1', prop: 'r1' },
    { name: '2', prop: 'r2' },
    { name: '3', prop: 'r3' },
    { name: '4', prop: 'r4' },
    { name: 'результат', prop: 'score' },
].map((item, i) => ({ ...item, id: `bf-${i}` }));
