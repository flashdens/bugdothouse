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
      width: {
          '45dvh': '45dvh',
          '65dvh': '65dvh'
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
      'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse'
    ],
}
export default config
