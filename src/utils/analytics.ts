/**
 * Simple SHA-256 hashing utility for GDPR-compliant user tracking.
 * Provides an anonymized string from a sensitive input (like user ID or email).
 */
export async function hashId(id: string): Promise<string> {
    if (!id) return "";
    
    // In React Native / Expo, we can use the global crypto.subtle or a simple fallback
    // Since we want to be lightweight and standard:
    try {
        const msgUint8 = new TextEncoder().encode(id);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    } catch (e) {
        // Fallback for environments where crypto.subtle might be tricky (rare in modern Expo)
        // A simple DJB2-like hash as absolute fallback if necessary, 
        // but modern Expo supports crypto.
        return id.split('').reduce((acc, char) => {
            return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0).toString(16);
    }
}
