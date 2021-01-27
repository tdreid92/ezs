export interface PollyUploadRequest {
  language: Language;
  word: string;
  speed: string;
}

export const enum Language {
  DE,
  FR,
  ES,
  RU
}

// const enum PollySpeed {
//    = 'X-SLOW',
//   Info = 'MEDIUM'
// }
