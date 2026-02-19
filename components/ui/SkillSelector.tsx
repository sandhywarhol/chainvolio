"use client";

import { useState, useRef, useEffect } from "react";
import { ALL_SKILLS, SKILL_BANK } from "@/constants/skills";

interface SkillSelectorProps {
    value: string; // Comma-separated string to match existing logic
    onChange: (value: string) => void;
    maxSkills?: number;
}

export function SkillSelector({ value, onChange, maxSkills = 8 }: SkillSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedSkills = value ? value.split(",").map(s => s.trim()).filter(Boolean) : [];

    const filteredSkills = ALL_SKILLS.filter(
        (skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !selectedSkills.includes(skill)
    );

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addSkill = (skill: string) => {
        if (selectedSkills.length >= maxSkills) {
            alert(`You can select a maximum of ${maxSkills} skills.`);
            return;
        }
        if (!selectedSkills.includes(skill)) {
            const newSkills = [...selectedSkills, skill];
            onChange(newSkills.join(", "));
            setSearchTerm("");
            setIsOpen(false);
        }
    };

    const removeSkill = (skillToRemove: string) => {
        const newSkills = selectedSkills.filter(s => s !== skillToRemove);
        onChange(newSkills.join(", "));
    };

    return (
        <div className="space-y-3" ref={wrapperRef}>
            {/* Selected Skills Tags */}
            <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                    <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-in fade-in zoom-in duration-200"
                    >
                        {skill}
                        <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-white transition-colors"
                        >
                            ×
                        </button>
                    </span>
                ))}
                {selectedSkills.length === 0 && (
                    <span className="text-xs text-slate-600 italic">No skills selected yet</span>
                )}
            </div>

            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder={selectedSkills.length >= maxSkills ? "Maximum skills reached" : "Search & add skills (e.g. Rust, UI/UX, DeFi)"}
                    disabled={selectedSkills.length >= maxSkills}
                />

                {isOpen && searchTerm.length > 0 && (
                    <div className="absolute z-[110] w-full mt-2 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl custom-scrollbar">
                        {filteredSkills.length > 0 ? (
                            filteredSkills.map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => addSkill(skill)}
                                    className="w-full text-left px-4 py-3 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-slate-300 text-sm border-b border-slate-800/50 last:border-0"
                                >
                                    {skill}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-4 text-center">
                                <p className="text-slate-500 text-sm mb-2">Skill not found in bank</p>
                                <button
                                    type="button"
                                    className="text-xs text-emerald-400 hover:underline"
                                >
                                    Request to add "{searchTerm}"
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Category Browsing (Only when not searching) */}
                {isOpen && searchTerm.length === 0 && (
                    <div className="absolute z-[110] w-full mt-2 max-h-80 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl custom-scrollbar p-2">
                        {SKILL_BANK.map((group) => (
                            <div key={group.category} className="mb-4 last:mb-0">
                                <h4 className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                                    {group.category}
                                </h4>
                                <div className="grid grid-cols-2 gap-1">
                                    {group.skills
                                        .filter(s => !selectedSkills.includes(s))
                                        .map((skill) => (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() => addSkill(skill)}
                                                className="text-left px-3 py-2 hover:bg-white/5 rounded transition-colors text-slate-300 text-xs"
                                            >
                                                {skill}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <p className="text-[10px] text-slate-500 px-1">
                Select up to {maxSkills} skills. These help recruiters find you in specialized searches.
            </p>
        </div>
    );
}
