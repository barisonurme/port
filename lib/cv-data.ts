/** Source of truth for the /cv page — mirrors the printed résumé. */

export type CVExperience = {
    period: string;
    company: string;
    role: string;
    body: string[];
};

export type CVEducation = {
    period: string;
    school: string;
    field: string;
};

export type CVContact = {
    label: string;
    href: string;
};

export type CVLanguage = {
    name: string;
    level: string;
};

export const cv = {
    name: "Baris Onurme,",
    role: "Full-Stack Developer",
    intro: [
        "I started my career as a Graphic Designer in 2015 and have built a design background creating visual identities for different platforms, as well as producing both digital and printed designs. After studying graphic design in the Czech Republic for one year, I worked for five years at one of Turkey's leading tourism e-commerce platforms, where I created UI designs, printed materials, and motion graphics.",
        "In 2022, I shifted toward Front-End development by combining my design background with my passion for writing clean code and creating strong user experiences. Currently, I develop sustainable, scalable, and user-focused interfaces using modern JavaScript frameworks. Thanks to my graphic design background, I actively integrate user experience and interface design principles into the development process.",
    ],
    experience: [
        {
            period: "2022.09 — Present",
            company: "Ekinoks Software",
            role: "Software Engineer",
            body: [
                "I took an active role in front-end development processes for projects in both the civil sector and the defense industry (Aselsan). My responsibilities included helping determine the technologies to be used in projects, coordinating between teams, and sharing technical knowledge related to software development processes.",
                "In the first year of my career, I worked as part of a 15-20 person team on the front-end development of a CRM application that provides smart city solutions for local municipalities. In this project, my contributions went beyond developing basic CRUD operations; I also collaborated closely with the design, back-end, and QA teams to help implement features such as map integrations and live tracking through map interfaces.",
                "Using technologies such as React, Redux, Tailwind CSS, and MUI, I developed scalable and reusable UI components.",
                "Currently, I contribute to front-end development for an AI-based project being developed at Ekinoks Software.",
            ],
        },
        {
            period: "2017.04 — 2021.12",
            company: "Gezinomi",
            role: "Graphic Design Specialist",
            body: [
                "I worked as the sole graphic designer within the Marketing Department at Gezinomi, one of Turkey's leading tourism e-commerce platforms.",
                "In this role, I produced UI designs, digital campaign visuals, printed materials, and motion graphics. I also took an active role in the development process of the website used by agencies, acting as a bridge between the design and development teams. Through this experience, I gained extensive knowledge in user experience, interface design, and brand identity development.",
            ],
        },
    ] satisfies CVExperience[],
    education: [
        { period: "2014 — 2019", school: "Suleyman Demirel University", field: "Graphic Design" },
        { period: "2015", school: "Jan Evangelista Purkyne (CZ)", field: "Graphic Design" },
    ] satisfies CVEducation[],
    languages: [
        { name: "English", level: "Advanced" },
        { name: "Turkish", level: "Native" },
    ] satisfies CVLanguage[],
    contacts: [
        { label: "github.com/barisonurme", href: "https://github.com/barisonurme" },
        { label: "barisonurme.com", href: "https://barisonurme.com" },
        { label: "brsnrm@gmail.com", href: "mailto:brsnrm@gmail.com" },
        { label: "+90 507 336 30 96", href: "tel:+905073363096" },
    ] satisfies CVContact[],
    skills: [
        "Typescript", "Javascript",
        "React", "NextJs",
        "Vue", "Nuxt",
        "Hono", "GraphQL",
        "AntDesign", "MaterialUI",
        "Shadcn", "TailwindCSS",
        "PostgreSQL", "NestJs",
        "Docker", "Git",
        "Html5", "Css3",
        "Bun", "CD/CI",
        "Responsive", "Agile/Scrum",
        "REST APIs", "Rollup",
        "Optimization", "Redux",
        "HLS", "WebRTC",
        "Leaflet",
    ],
};
