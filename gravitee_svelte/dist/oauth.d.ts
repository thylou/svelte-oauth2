import type { ContextStrategy } from "./integration";
import type { Grant } from "./oauth/grant";
/**
 * Setup the OAuth
 *
 * @param {ContextStrategy} integration The context strategy to use (How the auth integrate with the app). The existing flavor: SvelteKit, and normal Svelte (browser side only)
 * @param {Grant} grant The OAuth grant type (Client Credentials, Authorization Code, Authorization Code with PKCE)
 * @param {"cookie"|"localStorage"} storage Where to store the OAuth token (default: cookie)
 */
export declare const init: (integration: ContextStrategy, grant: Grant, storage?: "cookie" | "localStorage") => void;
export declare const initDone: () => Promise<void>;
export declare const getGrant: () => Grant;
export declare const getTokenStorageType: () => "cookie" | "localStorage";
/**
 * Representation of an OAuth (Access) Token
 */
export declare type OAuthToken = {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
};
/**
 * Indicate if token exist in the storage
 *
 * @return {Promise<boolean>}
 */
export declare const hasToken: () => Promise<boolean>;
/**
 * Indicate if token in the storage is expired.
 *
 * (A token that don"t have an expiration date is never expired)
 *
 * @return {Promise<boolean>}
 */
export declare const tokenExpired: () => Promise<boolean>;
export declare const refreshToken: () => void;
/**
 * Check if the provided scopes are defined in the stored token
 *
 * @param {Array<string>} scopes List of scopes to check
 *
 * @return {Promise<boolean>}
 */
export declare const isAuthorized: (scopes: Array<string>) => Promise<boolean>;
/**
 * Add authorization header with the stored token
 *
 * @param {Headers} headers
 *
 * @return {Promise<Headers>}
 */
export declare const addAuthHeader: (headers?: Headers) => Promise<Headers>;
export declare const runOAuth2Process: (scopes: Array<string>) => Promise<unknown>;
