export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getShortDate(d: string | Date | null | undefined): string {
    if (!d) return "Present";
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return "Present";
    return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function calculateDuration(startDate: string | Date, endDate?: string | Date | null): string {
    const start = typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = !endDate ? new Date() : (typeof endDate === "string" ? new Date(endDate) : endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    
    if (totalMonths >= 12) {
        const years = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;
        let durationStr = `${years} yr${years !== 1 ? 's' : ''}`;
        if (remainingMonths > 0) durationStr += ` ${remainingMonths} mo${remainingMonths !== 1 ? 's' : ''}`;
        return durationStr;
    } else {
        return `${totalMonths} mo${totalMonths !== 1 ? 's' : ''}`;
    }
}

export function formatLongDate(d: string | Date | null | undefined): string | null {
    if (!d) return null;
    const date = typeof d === "string" ? new Date(d) : d;
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}
