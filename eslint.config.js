import tailwindcss from 'eslint-plugin-tailwindcss'

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      tailwindcss,
    },
    rules: {
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'off',
    },
  },
]
