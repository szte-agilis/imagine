/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    daisyui: {
        themes: ['dim'],
    },
    plugins: [require('daisyui')],
};
