export interface FindTranslationResponse {
  body: string;
  statusCode: number;
  headers: any;
}

export interface body {
  source: string;
  target: string;
  word: string;
}
