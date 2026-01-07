/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                wealth: {
                    900: '#0f3d39', // Deepest Teal (Footer/Headers)
                    800: '#115e59', // Primary Brand Teal
                    700: '#0d9488', // Lighter Teal for hover
                    500: '#0d9488', // Lighter Teal for hover
                    200: '#a3d9cdff', // Lighter Teal for hover
                    100: '#ccfbf1ff', // Light background accents
                    50: '#c3faf6ff',
                    20: '#a3d9cdff'
                },
                // Merged from Chat AI
                teal: {
                    900: '#0f3d39', // Deepest Teal (Footer/Headers)
                    800: '#115e59', // Primary Brand Teal
                    700: '#0d9488', // Lighter Teal for hover
                    600: '#0f766e',
                    500: '#14b8a6',
                    200: '#a3d9cd', // Lighter Teal for hover
                    100: '#ccfbf1', // Light background accents
                    50: '#c3faf6',
                },
                gold: {
                    600: '#d97706', // Deep Gold (Text/Borders)
                    500: '#f59e0b', // Bright Gold (Buttons/Highlights)
                    400: '#fbbf24', // Light Gold (Gradients)
                    300: '#f4bc5bff', // Light Gold (Gradients)
                    200: '#ffd792ff', // Light Gold (Gradients)
                    100: '#fef3c7', // Gold backgrounds
                    50: '#fff1d3ff',
                },
                gray: {
                    750: '#2d3748', // Custom dark gray for cards
                    850: '#1a202c', // Custom darker gray for sidebar
                    950: '#0d1117', // Very dark background
                }
            },
        },
    },
    plugins: [],
}
