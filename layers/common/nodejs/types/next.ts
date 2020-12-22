export type NextFunction = () => void | Promise<void>;

export type ApiGatewayHeaders = { [header: string]: string | number | boolean } | undefined;
