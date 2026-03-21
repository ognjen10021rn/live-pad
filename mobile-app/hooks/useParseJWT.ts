export function useParseJwt(token: string): any | undefined {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

        const paddedBase64 = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            "="
        );

        return JSON.parse(atob(paddedBase64));
    } catch (e) {
        console.log(e, "Homepage err: ", token);
    }
}

/**
 * Checks whether the JWT token contains ROLE_ADMIN.
 * Spring Security encodes roles under `roles`, `authorities` (array of strings
 * or objects with an `authority` field), or a space-separated `scope` string.
 */
export function isAdminFromToken(token: string): boolean {
    try {
        const payload = useParseJwt(token);
        if (!payload) return false;

        const raw: unknown =
            payload.role ?? payload.roles ?? payload.authorities ?? payload.scope;

        if (Array.isArray(raw)) {
            return raw.some((r: unknown) => {
                const name = typeof r === "string" ? r : (r as any)?.authority ?? "";
                return name === "ROLE_ADMINISTRATOR";
            });
        }
        if (typeof raw === "string") {
            return raw.split(" ").includes("ROLE_ADMINISTRATOR");
        }
        return false;
    } catch {
        return false;
    }
}