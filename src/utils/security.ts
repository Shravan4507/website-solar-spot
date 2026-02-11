/**
 * MISSION CONTROL SECURITY PROTOCOL
 * Handles encryption and digital signatures for mission passes.
 * Uses a SHA-256 HMAC for tamper-proof verification.
 */

const MISSION_SECRET = import.meta.env.VITE_MISSION_SECRET || "SOLAR_SPOT_2026_PROTOCOL_X";

/**
 * Generates a digitally signed token for the attendee.
 * Format: base64(data).signature
 */
export const generateSecurePassToken = async (data: object) => {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);

    // Convert to Base64 for the payload
    const base64Data = btoa(dataString);

    // Generate HMAC-SHA256 signature
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(MISSION_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(base64Data)
    );

    // Convert signature to Hex string
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Final Token: payload.signature
    return `${base64Data}.${signatureHex}`;
};

/**
 * Verifies a pass token against the mission secret.
 */
export const verifyPassToken = async (token: string) => {
    try {
        const [base64Data, signature] = token.split('.');
        if (!base64Data || !signature) return null;

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(MISSION_SECRET),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // Convert signature hex back to buffer
        const sigArray = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            sigArray,
            encoder.encode(base64Data)
        );

        if (isValid) {
            return JSON.parse(atob(base64Data));
        }
        return null;
    } catch (e) {
        console.error("Pass verification failed:", e);
        return null;
    }
};
