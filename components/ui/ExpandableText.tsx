"use client";

import { useState } from "react";

interface ExpandableTextProps {
    text: string;
    maxLength?: number;
    className?: string;
}

export function ExpandableText({ text, maxLength = 280, className = "" }: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (text.length <= maxLength) {
        return <p className={className}>{text}</p>;
    }

    return (
        <div className={className}>
            <p className="inline">
                {isExpanded ? text : `${text.slice(0, maxLength)}...`}
            </p>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                className="ml-1.5 text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center text-xs group"
            >
                {isExpanded ? "Show less" : "Read more"}
                <span className="ml-0.5 transition-transform duration-200 group-hover:translate-x-0.5">
                    {isExpanded ? "↑" : "→"}
                </span>
            </button>
        </div>
    );
}
