// Detect browsers that commonly break OAuth redirect flows:
// Instagram, WhatsApp, Facebook, TikTok, Line, Twitter, and generic Android WebViews.
export function isInAppBrowser(): boolean {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return (
        /Instagram|FBAN|FBAV|FB_IAB|Twitter|WhatsApp|Snapchat|TikTok|Line\/|MicroMessenger|GSA\//.test(ua) ||
        // Android WebView: has "wv" flag and "Android" but no "Chrome/" standalone
        (/Android/.test(ua) && /wv\)/.test(ua))
    );
}

export function openInExternalBrowser(url?: string): void {
    const target = url || window.location.href;
    // Android intent URL forces the system browser
    if (/Android/i.test(navigator.userAgent)) {
        window.location.href = `intent://${target.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
        // iOS: just opening the URL usually works; Safari handles universal links
        window.location.href = target;
    }
}
