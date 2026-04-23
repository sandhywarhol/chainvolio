/**
 * Detects common mobile in-app browsers that often break wallet deep links
 * due to storage isolation or blocked redirects.
 */
export function isInAppBrowser(): boolean {
    if (typeof window === "undefined") return false;
    
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    return (
        /Instagram/i.test(ua) ||
        /FBAN/i.test(ua) ||
        /FBAV/i.test(ua) ||
        /Discord/i.test(ua) ||
        /Line/i.test(ua) ||
        /Snapchat/i.test(ua) ||
        /WhatsApp/i.test(ua) ||
        // General check for "InApp" strings some browsers use
        /InApp/i.test(ua)
    );
}

/**
 * Checks if the browser is the internal Phantom Wallet browser
 */
export function isPhantomBrowser(): boolean {
    if (typeof window === "undefined") return false;
    return !!(window as any).solana?.isPhantom;
}
