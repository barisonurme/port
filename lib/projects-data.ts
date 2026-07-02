export type ProjectMeta = {
    id: number;
    title: string;
    year: string;
    category: string;
    description: string;
    tech: string[];
    image: string;
    /** Shown in the homepage project teaser. */
    featured?: boolean;
    /** Primary brand color, hex. Drives the homepage background while this project is active. */
    color?: string;
};

export const projects: ProjectMeta[] = [
    {
        id: 1,
        title: "ExpenseAI",
        year: "2026",
        category: "Web App",
        description:
            "A full-stack personal finance tracker with an AI assistant. Built with Hono, Bun and Postgres on the backend and React 19 on the frontend, it tracks recurring expenses/income and uses an LLM to answer questions about your spending.",
        tech: ["Hono", "Bun", "TypeScript", "PostgreSQL", "Drizzle ORM", "React", "TanStack Query", "Tailwind"],
        image: "/expense-ai/expense-ai.png",
        featured: true,
        color: "#4CD18F",
    },
    {
        id: 2,
        title: "FitSmart",
        year: "2026",
        category: "Smart Devices",
        description:
            "Exercise tracking app with AI-powered workout recommendations.",
        tech: ["Swift", "WatchOS", "TensorFlow", "AWS"],
        image: "./underconstruction.png",
    },
    {
        id: 3,
        title: "MenuRest",
        year: "2026",
        category: "Web App",
        description:
            "Helps restaurants manage inventory and reduce food waste by tracking ingredients, predicting demand, and suggesting recipes.",
        tech: ["Next.js", "Cloudflare"],
        image: "./underconstruction.png",
    },
    {
        id: 4,
        title: "Notify",
        year: "2025",
        category: "Web App",
        description:
            "Helps companies manage notifications and communication with their customers.",
        tech: ["React", "GraphQL"],
        image: "./underconstruction.png",
        featured: true,
        color: "#E5523A",
    },
];
