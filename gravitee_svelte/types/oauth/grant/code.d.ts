import type { ContextStrategy } from "../../integration";
import { BaseGrant } from "../grant";
import type { Grant } from "../grant";
export declare class AuthorizationCode extends BaseGrant implements Grant {
    private readonly clientId;
    private readonly clientSecret;
    private readonly postLoginRedirectUri;
    private readonly authorizationRedirectUri;
    private readonly authorizationUri;
    private readonly credentialMode;
    /**
     * @param {ContextStrategy} integration The context strategy to use (How the auth integrate with the app).
     * @param {string} clientId The OAuth2 Client Id
     * @param {string} clientSecret The OAuth2 Client Secret
     * @param {string} postLoginRedirectUri The application URI to go when the user is authenticated.
     * @param {string} tokenUri The Auth Server URI where to get the access token.
     * @param {string} authorizationUri The Auth Server URI where to go for authentication.
     * @param {string} authorizationRedirectUri The application URI to go back from the Auth Server
     * @param {"request"|"header"} credentialMode Where to put credential (Client Id and Client Secret)
     */
    constructor(integration: ContextStrategy, clientId: string, clientSecret: string, postLoginRedirectUri: string, tokenUri: string, authorizationUri: string, authorizationRedirectUri: string, credentialMode?: "request" | "header");
    onRequest(): Promise<boolean>;
    onUnauthenticated(scopes: Array<string>): Promise<void>;
    private generateState;
}
