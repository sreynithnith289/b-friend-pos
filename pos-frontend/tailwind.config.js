/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-[#f6b100]',
    'bg-[#2e4a40]',
    'bg-[#664a04]',
    'bg-[#f5f5f5]',
    'bg-[#ababab]',
    'bg-[#1f1f1f]',
    'bg-[#383838]',
    'bg-[#262626]',
    'bg-[#4a4a4a]',
    'bg-[#7c7c7c]',
    'bg-[#d4d4d4]',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
};
