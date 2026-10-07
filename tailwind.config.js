/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Шкала типографики по ролям (размер / интерлиньяж в dp, выровнено по Material).
      // Системный размер шрифта масштабирует всё автоматически — не задавать fontSize числом в StyleSheet.
      fontSize: {
        display: ['45px', { lineHeight: '52px' }], // вордмарк ClimbNow
        headline: ['24px', { lineHeight: '32px' }], // подзаголовок стартового экрана
        title: ['20px', { lineHeight: '28px' }], // название группы, крупные сообщения
        body: ['16px', { lineHeight: '24px' }], // поля, табы, строки списков, заголовок подгруппы
        'body-sm': ['14px', { lineHeight: '20px' }], // подписи, табы подгрупп, служебные тексты
        caption: ['12px', { lineHeight: '16px' }], // таблица, чипы, бейдж, сводка шапки
      },
      // Значения и тёмная тема — в src/global.css
      colors: {
        canvas: token('canvas'),
        surface: { DEFAULT: token('surface'), muted: token('surface-muted') },
        line: { DEFAULT: token('line'), subtle: token('line-subtle') },
        fg: {
          DEFAULT: token('fg'),
          muted: token('fg-muted'),
          subtle: token('fg-subtle'),
          placeholder: token('fg-placeholder'),
          disabled: token('fg-disabled'),
        },
        accent: {
          DEFAULT: token('accent'),
          fg: token('accent-fg'),
          soft: token('accent-soft'),
          'soft-fg': token('accent-soft-fg'),
        },
        highlight: token('highlight'),
        live: {
          DEFAULT: token('live'),
          soft: token('live-soft'),
          faint: token('live-faint'),
          line: token('live-line'),
        },
        boulder: {
          top: token('boulder-top'),
          'top-zone': token('boulder-top-zone'),
          zone: token('boulder-zone'),
          blank: token('boulder-blank'),
          fg: token('boulder-fg'),
          empty: token('boulder-empty'),
        },
        winner: token('winner'),
        warn: { soft: token('warn-soft'), fg: token('warn-fg') },
        danger: token('danger'),
      },
    },
  },
  plugins: [],
}
