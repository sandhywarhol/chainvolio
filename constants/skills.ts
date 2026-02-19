export interface SkillGroup {
    category: string;
    skills: string[];
}

export const SKILL_BANK: SkillGroup[] = [
    {
        category: "Engineering",
        skills: [
            "Frontend Development",
            "Backend Development",
            "Fullstack Development",
            "Smart Contract (Solana)",
            "Smart Contract (Ethereum)",
            "Mobile Development",
            "Game Development",
            "DevOps",
            "Data Science",
            "Machine Learning",
            "Rust",
            "Solidity",
            "TypeScript",
            "React",
            "Next.js",
            "Python",
            "Go",
        ]
    },
    {
        category: "Design & Creative",
        skills: [
            "UI/UX Design",
            "Product Design",
            "Graphic Design",
            "Brand Identity",
            "Photography",
            "Videography",
            "Motion Design",
            "3D Modeling",
            "Animation",
        ]
    },
    {
        category: "Web3 & Crypto",
        skills: [
            "DeFi Research",
            "NFT Strategy",
            "DAO Governance",
            "Tokenomics Design",
            "Crypto Economics",
            "On-chain Analysis",
            "Security Auditing",
        ]
    },
    {
        category: "Tools & Platforms",
        skills: [
            "GitHub",
            "Figma",
            "Unity",
            "Unreal Engine",
            "Docker",
            "AWS",
            "Vercel",
            "Adobe Creative Cloud",
        ]
    },
    {
        category: "Marketing & Growth",
        skills: [
            "Content Strategy",
            "Community Management",
            "SEO",
            "Social Media Marketing",
            "Growth Hacking",
            "Public Relations",
        ]
    }
];

export const ALL_SKILLS = SKILL_BANK.flatMap(group => group.skills).sort();
