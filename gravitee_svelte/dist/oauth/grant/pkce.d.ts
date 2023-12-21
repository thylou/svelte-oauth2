import type { ContextStrategy } from "../../integration";
import { BaseGrant } from "../grant";
import type { Grant } from "../grant";
export declare class AuthorizationCodePKCE extends BaseGrant implements Grant {
    private readonly clientId;
    private readonly postLoginRedirectUri;
    private readonly authorizationRedirectUri;
    private readonly authorizationUri;
    /**
     * @param {ContextStrategy} integration The context strategy to use (How the auth integrate with the app).
     * @param {string} clientId The OAuth2 Client Id
     * @param {string} postLoginRedirectUri The application URI to go when the user is authenticated.
     * @param {string} tokenUri The Auth Server URI where to get the access token.
     * @param {string} authorizationUri The Auth Server URI where to go for authentication.
     * @param {string} authorizationRedirectUri The application URI to go back from the Auth Server
     */
    constructor(integration: ContextStrategy, clientId: string, postLoginRedirectUri: string, tokenUri: string, authorizationUri: string, authorizationRedirectUri: string);
    onRequest(): Promise<boolean>;
    onUnauthenticated(scopes: Array<string>): Promise<void>;
    private generateState;
    private generateCodeChallenge;
}
