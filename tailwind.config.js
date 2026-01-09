/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        success: "var(--success)",
        "success-100": "var(--success-100)",
        info: "var(--info)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-100": "var(--text-100)",
        "text-80": "var(--text-80)",
        "text-60": "var(--text-60)",
        "text-40": "var(--text-40)",
        "text-20": "var(--text-20)",
        "text-10": "var(--text-10)",
        "bg-color": "var(--bg-color)",
      },
      backgroundImage: {
        primary: "linear-gradient(212deg, var(--primary), var(--primary-dark))",
        CTA: "linear-gradient(210deg, var(--CTA-linear1) 7.08%, var(--CTA-linear2) 49.27%, var(--CTA-linear3) 91.47%)",
      },
      boxShadow: {
        card: " 0 4px 12px rgba(87, 87, 87, 0.15)",
      },
    },
  },
  plugins: [],
};
