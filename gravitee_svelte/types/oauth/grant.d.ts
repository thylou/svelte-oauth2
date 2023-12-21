import type { ContextStrategy } from "../integration";
export interface Grant {
    /**
     * Actions to do when a user is not authenticated.
     *
     * (Start the authentication process)
     *
     * @param {Array<string>} scopes List of need scopes
     */
    onUnauthenticated(scopes: Array<string>): Promise<void>;
    /**
     * Actions to do on every request that need authorization
     */
    onRequest(): Promise<boolean>;
}
/**
 * @internal
 */
export declare abstract class BaseGrant implements Grant {
    protected integration: ContextStrategy;
    private tokenUri;
    constructor(integration: ContextStrategy, tokenUri: string);
    protected getToken(params: Record<string, unknown>, headers?: HeadersInit): Promise<boolean>;
    onRequest(): Promise<boolean>;
    onUnauthenticated(scopes: Array<string>): Promise<void>;
}
