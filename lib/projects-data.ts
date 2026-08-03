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
        title: "FitLog",
        year: "2026",
        category: "Smart Devices",
        description:
            "An iOS + Apple Watch workout companion that automatically detects and counts reps from wrist motion using Core Motion templates. Features a muscle heat map to visualize training coverage, workout history syncing between iPhone and Watch, and a built-in AI coach for personalized fitness guidance.",
        tech: ["Swift", "SwiftUI", "watchOS", "Core Motion", "WatchConnectivity"],
        image: "/fit-log/fit-log.png",
        featured: true,
        color: "#007AFF",
    },
    {
        id: 3,
        title: "Notify",
        year: "2025",
        category: "Web App",
        description:
            "A multi-tenant notification delivery platform admin console, the operations surface for a notification-sending backend. Organizations manage projects, configure Email/SMS/Push providers, build message templates, and monitor delivery logs, quotas, and usage.",
        tech: ["React 19", "TypeScript", "GraphQL", "TanStack Query", "Redux Toolkit", "MUI", "Tiptap", "Mapbox GL"],
        image: "./notify/notify.png",
        featured: true,
        color: "#FF5B3F",
    },
    {
        id: 4,
        title: "StreamIQ",
        year: "2026",
        category: "Web Application",
        description:
            "A web-based camera management and video surveillance dashboard for edge recording devices. Delivers low-latency live streaming over WebRTC with an HLS fallback, timeline-driven playback with zoom and GPS trail visualization on a map, and full device configuration — camera discovery, network, storage, and user roles. Built as a fully responsive SPA with dark/light theming and multi-language support including RTL.",
        tech: ["React 19", "TypeScript", "Vite", "Tailwind CSS", "WebRTC", "HLS.js", "TanStack Query"],
        image: "/stream-iq/cover.png",
        featured: true,
        color: "#F39E0A",
    }

];
