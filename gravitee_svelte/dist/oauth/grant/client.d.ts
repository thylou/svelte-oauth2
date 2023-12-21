import type { ContextStrategy } from "../../integration";
import { BaseGrant } from "../grant";
import type { Grant } from "../grant";
export declare class ClientCredentials extends BaseGrant implements Grant {
    private readonly postAuthenticateUri;
    private readonly clientId;
    private readonly clientSecret;
    private readonly credentialMode;
    /**
     * @param {ContextStrategy} integration The context strategy to use (How the auth integrate with the app).
     * @param {string} clientId The OAuth2 Client Id
     * @param {string} clientSecret The OAuth2 Client Secret
     * @param {string} tokenUri The Auth Server URI where to get the access token.
     * @param {string} postAuthenticateUri The application URI to go when the user is authenticated.
     * @param {"request"|"header"} credentialMode Where to put credential (Client Id and Client Secret)
     */
    constructor(integration: ContextStrategy, tokenUri: string, postAuthenticateUri: string, clientId: string, clientSecret: string, credentialMode?: "header" | "request");
    onUnauthenticated(scopes: Array<string>): Promise<void>;
}
