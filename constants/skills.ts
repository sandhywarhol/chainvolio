export interface SkillGroup {
    category: string;
    skills: string[];
}

export const SKILL_BANK: SkillGroup[] = [
    {
        category: "Technology & Engineering",
        skills: [
            "Frontend Development",
            "Backend Development",
            "Full-Stack Development",
            "Mobile App Development",
            "Game Development",
            "DevOps",
            "Data Science",
            "Machine Learning",
            "QA Testing",
            "Rust",
            "Solidity",
            "TypeScript",
            "React",
            "Next.js",
            "Python",
            "Go",
            "Smart Contract Development",
        ]
    },
    {
        category: "Creative & Media",
        skills: [
            "UI/UX Design",
            "Product Design",
            "Photography",
            "Commercial Photography",
            "Product Photography",
            "Portrait Photography",
            "Videography",
            "Video Editing",
            "Cinematography",
            "Motion Design",
            "Graphic Design",
            "Brand Design",
            "Visual Identity",
            "Illustration",
            "3D Design",
            "Animation",
            "Storyboarding",
            "Creative Direction",
        ]
    },
    {
        category: "Web3 & Blockchain",
        skills: [
            "Solana Development",
            "Ethereum Development",
            "DeFi Research",
            "NFT Strategy",
            "DAO Governance",
            "Blockchain Analytics",
            "On-Chain Data Analysis",
            "Tokenomics",
            "Crypto Economics",
            "Security Auditing",
        ]
    },
    {
        category: "Business & Marketing",
        skills: [
            "Digital Marketing",
            "Social Media Management",
            "Content Strategy",
            "Copywriting",
            "Branding Strategy",
            "Growth Marketing",
            "Community Management",
            "Partnerships",
            "Campaign Management",
            "SEO",
            "Public Relations",
        ]
    },
    {
        category: "Finance & Operations",
        skills: [
            "Financial Analysis",
            "Accounting",
            "Budget Planning",
            "Treasury Management",
            "Crypto Accounting",
            "Risk Management",
            "Operations Management",
            "Business Development",
            "Project Management",
        ]
    },
    {
        category: "Tools & Software",
        skills: [
            "Figma",
            "Adobe Photoshop",
            "Adobe Illustrator",
            "Adobe Premiere Pro",
            "After Effects",
            "Blender",
            "Unity",
            "Unreal Engine",
            "GitHub",
            "Notion",
            "Docker",
            "AWS",
            "Vercel",
        ]
    }
];

export const ALL_SKILLS = Array.from(new Set(SKILL_BANK.flatMap(group => group.skills))).sort();
