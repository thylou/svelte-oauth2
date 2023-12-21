export declare class OAuthError implements Error {
    readonly message: string;
    constructor(message: string);
    get name(): string;
}
