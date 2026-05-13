"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { TalentProfile } from "@/components/explore/TalentCard";
import { ExploreFilters, DEFAULT_FILTERS } from "@/types/explore";

function parseFiltersFromURL(sp: URLSearchParams): ExploreFilters {
    return {
        search:        sp.get("search")    || DEFAULT_FILTERS.search,
        category:      sp.get("category")  || DEFAULT_FILTERS.category,
        workType:      sp.get("workType")  || DEFAULT_FILTERS.workType,
        minScore:      parseInt(sp.get("minScore") || "0"),
        sort:          sp.get("sort")      || DEFAULT_FILTERS.sort,
        location:      sp.get("location")  || DEFAULT_FILTERS.location,
        ecosystem:     sp.get("ecosystem") || DEFAULT_FILTERS.ecosystem,
        availableOnly: sp.get("availableOnly") === "true",
        verifiedOnly:  sp.get("verifiedOnly")  === "true",
    };
}

function buildURLParams(filters: ExploreFilters, page: number): URLSearchParams {
    const p = new URLSearchParams();
    if (filters.search)                p.set("search",       filters.search);
    if (filters.category !== "all")    p.set("category",     filters.category);
    if (filters.workType)              p.set("workType",     filters.workType);
    if (filters.minScore > 0)          p.set("minScore",     String(filters.minScore));
    if (filters.sort !== "score_desc") p.set("sort",         filters.sort);
    if (filters.location)              p.set("location",     filters.location);
    if (filters.ecosystem)             p.set("ecosystem",    filters.ecosystem);
    if (filters.availableOnly)         p.set("availableOnly","true");
    if (filters.verifiedOnly)          p.set("verifiedOnly", "true");
    if (page > 1)                      p.set("page",         String(page));
    return p;
}

export function useExploreTalent() {
    const router      = useRouter();
    const pathname    = usePathname();
    const searchParams = useSearchParams();

    const [filters, setFiltersState] = useState<ExploreFilters>(() =>
        parseFiltersFromURL(searchParams)
    );
    const [page, setPageState] = useState<number>(() =>
        parseInt(searchParams.get("page") || "1")
    );
    const [talents,       setTalents]       = useState<TalentProfile[]>([]);
    const [organizations, setOrganizations] = useState<TalentProfile[]>([]);
    const [total,         setTotal]         = useState(0);
    const [totalPages,    setTotalPages]    = useState(0);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState("");

    const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

    // ── Core fetch ────────────────────────────────────────────────────────────
    const doFetch = useCallback(async (f: ExploreFilters, p: number) => {
        setLoading(true);
        setError("");
        try {
            const params = new URLSearchParams({
                page:         String(p),
                search:       f.search,
                category:     f.category,
                workType:     f.workType,
                minScore:     String(f.minScore),
                maxScore:     "100",
                sort:         f.sort,
            });
            if (f.location)      params.set("location",      f.location);
            if (f.ecosystem)     params.set("ecosystem",     f.ecosystem);
            if (f.availableOnly) params.set("availableOnly", "true");
            if (f.verifiedOnly)  params.set("verifiedOnly",  "true");

            const res  = await fetch(`/api/explore-talent?${params}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch");
            setTalents(data.talents  || []);
            setOrganizations(data.organizations || []);
            setTotal(data.total      || 0);
            setTotalPages(data.totalPages || 0);
        } catch (e: any) {
            setError(e.message || "Something went wrong.");
            setTalents([]);
            setOrganizations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── URL sync ──────────────────────────────────────────────────────────────
    const syncURL = useCallback((f: ExploreFilters, p: number) => {
        const qs = buildURLParams(f, p).toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }, [router, pathname]);

    // ── Filter / page effects ─────────────────────────────────────────────────
    // Non-search filter or page change → immediate fetch
    useEffect(() => {
        doFetch(filters, page);
        syncURL(filters, page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.category, filters.workType, filters.minScore, filters.sort,
        filters.location, filters.ecosystem, filters.availableOnly, filters.verifiedOnly,
        page,
    ]);

    // Search change → debounced fetch (resets to page 1)
    useEffect(() => {
        clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => {
            setPageState(1);
            doFetch(filters, 1);
            syncURL(filters, 1);
        }, 380);
        return () => clearTimeout(searchDebounce.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.search]);

    // ── Public setters ────────────────────────────────────────────────────────
    const setFilter = useCallback(
        <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) => {
            setFiltersState((prev) => ({ ...prev, [key]: value }));
            if (key !== "search") setPageState(1);
        },
        []
    );

    const setPage = useCallback((p: number) => {
        setPageState(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const clearFilters = useCallback(() => {
        setFiltersState(DEFAULT_FILTERS);
        setPageState(1);
        router.replace(pathname, { scroll: false });
    }, [router, pathname]);

    const hasFilters =
        !!filters.search           ||
        filters.category !== "all" ||
        !!filters.workType         ||
        filters.minScore > 0       ||
        filters.sort !== "score_desc" ||
        !!filters.location         ||
        !!filters.ecosystem        ||
        filters.availableOnly      ||
        filters.verifiedOnly;

    return {
        // Data
        talents, organizations, total, totalPages, page, loading, error,
        // Filters
        filters, setFilter, setPage, clearFilters, hasFilters,
    };
}
