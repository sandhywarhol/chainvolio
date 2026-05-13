// Central type definitions for the Explore Talent feature.
// Add new filter fields here so both the hook and the API stay in sync.

export interface ExploreFilters {
    search:       string;
    category:     string;
    workType:     string;
    minScore:     number;
    sort:         string;
    // Future filters — API-ready, UI not yet wired
    location:     string;   // maps to profiles.country
    ecosystem:    string;   // future: profiles.ecosystem
    availableOnly: boolean; // only show active / has receipts
    verifiedOnly:  boolean; // only show org-verified users
}

export const DEFAULT_FILTERS: ExploreFilters = {
    search:        "",
    category:      "all",
    workType:      "",
    minScore:      0,
    sort:          "score_desc",
    location:      "",
    ecosystem:     "",
    availableOnly: false,
    verifiedOnly:  false,
};

export const SORT_OPTIONS = [
    { value: "score_desc", label: "Highest Score" },
    { value: "score_asc",  label: "Lowest Score" },
    { value: "newest",     label: "Newest First" },
] as const;

export const WORK_TYPES = [
    { value: "",           label: "All Types" },
    { value: "Freelance",  label: "Freelance" },
    { value: "Full-time",  label: "Full-time" },
    { value: "Part-time",  label: "Part-time" },
    { value: "Remote",     label: "Remote" },
    { value: "Contract",   label: "Contract" },
] as const;

export const CATEGORIES = [
    { id: "all",         label: "All" },
    { id: "video",       label: "Video" },
    { id: "design",      label: "Design" },
    { id: "development", label: "Development" },
    { id: "writing",     label: "Writing" },
    { id: "community",   label: "Community" },
    { id: "ai",          label: "AI" },
] as const;
