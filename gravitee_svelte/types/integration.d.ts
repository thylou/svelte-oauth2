import type { TokenStorage } from "./oauth/tokenStorage";
export interface ContextStrategy {
    /**
     * Get the request query parameters
     */
    query(): Promise<URLSearchParams>;
    /**
     * Redirect to an url
     * @param {string} url
     */
    redirect(url: string): Promise<void>;
    /**
     * Get data from an URL (Fetch API)
     * @param {string} uri The URI of the data
     * @param {Record<string,any>} [options] Fetch options
     */
    fetch(uri: string, options?: Record<string, unknown>): Promise<Response>;
    /**
     * Get the storage where token is saved
     */
    tokenStorage(): Promise<TokenStorage>;
    /**
     * Get data from the temporary storage
     * @param {string} key The name/key of the data
     */
    getFromTemporary(key: string): Promise<string | null>;
    /**
     * Save data in the temporary storage
     * @param {string} key The name/key of the data
     * @param {string} data The data to save
     */
    saveInTemporary(key: string, data: string): Promise<void>;
}
export declare const svelteKitStrategy: ContextStrategy;
export declare const browserStrategy: ContextStrategy;
