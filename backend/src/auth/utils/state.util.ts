
import * as crypto from 'crypto';

interface StatePayload {
    mode: string;
    nonce: string;
    timestamp: number;
}

export class OAuthStateUtil {
    // Use JWT_SECRET or a fallback (should always be set in prod)
    private static readonly SECRET = process.env.JWT_SECRET || 'fallback-secret-Do-Not-Use-In-Prod';
    private static readonly MAX_AGE = 10 * 60 * 1000; // 10 minutes

    /**
     * Generates a signed state string containing the mode
     */
    static generateState(mode: string): string {
        const payload: StatePayload = {
            mode,
            nonce: crypto.randomBytes(16).toString('hex'),
            timestamp: Date.now(),
        };

        const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const signature = this.sign(data);

        return `${data}.${signature}`;
    }

    /**
     * Verifies the state string and returns the payload if valid
     * Returns null if invalid or expired
     */
    static verifyState(state: string): StatePayload | null {
        if (!state) return null;

        const parts = state.split('.');
        if (parts.length !== 2) return null;

        const [data, signature] = parts;

        // Verify signature
        const expectedSignature = this.sign(data);
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            return null;
        }

        try {
            const payload: StatePayload = JSON.parse(Buffer.from(data, 'base64url').toString());

            // Verify expiration
            if (Date.now() - payload.timestamp > this.MAX_AGE) {
                return null;
            }

            return payload;
        } catch {
            return null;
        }
    }

    private static sign(data: string): string {
        return crypto
            .createHmac('sha256', this.SECRET)
            .update(data)
            .digest('base64url');
    }
}
