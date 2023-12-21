import type { OAuthToken } from "../oauth";
export declare let cookieName: string;
export declare const setCookieName: (value: string) => string;
export declare type TokenStorage = {
    get(): OAuthToken | null | undefined;
    set(token: OAuthToken): void;
    remove(): any;
};
