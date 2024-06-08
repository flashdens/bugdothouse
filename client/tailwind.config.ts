import type { Config } from 'tailwindcss'
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
        maxWidth: {
         50: '50%'
        },
      width: {
          '30dvh': '30dvh',
          '45dvh': '45dvh',
          '60dvh': '60dvh'
      },
    },
  },
  plugins: [
      require('@tailwindcss/forms'),
      require('tailwindcss-animate')
  ],
  safelist: [
      'bg-red-500', 'text-red-700', 'border-red-500',
      'bg-blue-500', 'text-blue-700', 'border-blue-500',
      'bg-green-500', 'text-green-700', 'border-green-500',
      'border-gray-500',
      'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse',
      'font-bold',
     {
         pattern: /bg-(red|green|gray)-(500)/,
         variants: ['lg', 'hover', 'focus', 'lg:hover'],
    },
      {
          pattern: /w-(30|45|60)dvh/,
          variants: ['md', 'lg']
      }
  ],
}
export default config
