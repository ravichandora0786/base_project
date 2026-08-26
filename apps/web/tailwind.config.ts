import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          hover: 'rgb(var(--primary-hover))',
        },
        secondary: 'rgb(var(--secondary))',
        background: 'rgb(var(--background))',
        card: 'rgb(var(--card))',
        text: 'rgb(var(--text))',
        muted: 'rgb(var(--text-muted))',
        border: 'rgb(var(--border))',
      },
    },
  },
  plugins: [],
};
export default config;
