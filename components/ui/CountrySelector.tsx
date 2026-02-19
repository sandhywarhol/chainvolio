"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRIES } from "@/constants/countries";

interface CountrySelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredCountries = COUNTRIES.filter((country) =>
        country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm(value); // Reset search term if no selection made
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="Start typing to select your country"
            />

            {isOpen && (searchTerm.length > 0 || isOpen) && (
                <div className="absolute z-[110] w-full mt-2 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl custom-scrollbar">
                    {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                            <button
                                key={country}
                                type="button"
                                onClick={() => {
                                    onChange(country);
                                    setSearchTerm(country);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-slate-300 text-sm border-b border-slate-800/50 last:border-0"
                            >
                                {country}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-slate-500 text-sm">No results found</div>
                    )}
                </div>
            )}
        </div>
    );
}
