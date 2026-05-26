const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0D0C0F',
          'dark-alt': '#18171A',
          'light-alt': '#F4F4F4',
          surface: '#FFFFFF',
          border: '#D9D9D9',
          text: '#615F5C',
          'text-strong': '#18171A',
          'text-muted': '#949087',
          'text-on-dark': '#FFFFFF',
          accent: '#EA0A0B',
          'accent-hover': '#FF2020',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        cta: '0.1em',
        tight2: '-0.01em',
      },
      maxWidth: {
        page: '1440px',
      },
      spacing: {
        'page-x': '70px',
      },
      borderRadius: {
        none: '0',
      },
      boxShadow: {
        header: '0 4px 24px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
