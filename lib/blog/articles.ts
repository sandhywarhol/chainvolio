export interface Article {
  title: string;
  slug: string;
  description: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
}

export const articles: Article[] = [
  {
    title: "What Is On-Chain Attestation? A Simple Guide for Web3 Professionals",
    slug: "what-is-on-chain-attestation",
    description: "A simple guide to understanding on-chain attestations and why they matter for building a verifiable professional identity.",
    date: "May 11, 2026",
    readTime: "6 min read",
    author: "ChainVolio Team",
    category: "Identity & Trust",
  },
  {
    title: "Why Web3 Hiring via DM Is Broken and What to Do Instead",
    slug: "why-web3-hiring-via-dm-is-broken",
    description: "Explore why informal hiring via DMs and emails is slowing down Web3 and discover the power of verified signals.",
    date: "May 10, 2026",
    readTime: "5 min read",
    author: "ChainVolio Team",
    category: "Recruitment",
  },
  {
    title: "How to Build a Web3 Portfolio That Actually Gets You Hired",
    slug: "how-to-build-web3-portfolio",
    description: "Stop making claims and start showing proof. Learn the actionable steps to building a verifiable Web3 portfolio.",
    date: "May 9, 2026",
    readTime: "7 min read",
    author: "ChainVolio Team",
    category: "Career",
  },
  {
    title: "LinkedIn vs ChainVolio: Why You Actually Need Both",
    slug: "linkedin-vs-chainvolio-why-you-need-both",
    description: "LinkedIn is for visibility, but it lacks verification. ChainVolio is a trust layer that works alongside it.",
    date: "May 8, 2026",
    readTime: "6 min read",
    author: "ChainVolio Team",
    category: "Identity & Trust",
  },
  {
    title: "The Web3 Job Market in 2026: What's Changed and How to Navigate It",
    slug: "web3-job-market-2026",
    description: "The Web3 job market in 2026 rewards real contributors over self-promoters. Learn how to navigate the shift.",
    date: "May 7, 2026",
    readTime: "6 min read",
    author: "ChainVolio Team",
    category: "Career",
  },
  {
    title: "How to Ask for a Work Attestation: A Practical Guide",
    slug: "how-to-ask-for-work-attestation",
    description: "Learn how to ask for a work attestation on ChainVolio with practical tips and example messages.",
    date: "May 6, 2026",
    readTime: "5 min read",
    author: "ChainVolio Team",
    category: "Guides",
  },
  {
    title: "Why Traditional CVs Are Broken in Web3",
    slug: "why-traditional-cv-is-broken-in-web3",
    description: "Explore why static PDFs and unverifiable claims are failing the decentralized workforce and how attestations provide a solution.",
    date: "May 5, 2026",
    readTime: "6 min read",
    author: "ChainVolio Team",
    category: "Identity",
  },
  {
    title: "How to Get a Web3 Job Without Experience",
    slug: "how-to-get-a-web3-job-without-experience",
    description: "Learn how to get a Web3 job without traditional experience by building proof of work and creating a verifiable reputation.",
    date: "May 4, 2026",
    readTime: "5 min read",
    author: "ChainVolio Team",
    category: "Career",
  },
  {
    title: "What Recruiters Look for in Web3 Talent",
    slug: "what-recruiters-look-for-in-web3-talent",
    description: "Discover what Web3 recruiters actually look for when hiring talent, from proof of work and on-chain reputation.",
    date: "May 3, 2026",
    readTime: "6 min read",
    author: "ChainVolio Team",
    category: "Recruitment",
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
