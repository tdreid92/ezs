interface TranslationItem {
  source: string;
  target: string;
  word: string;
}

interface Content {
  content: string;
}

interface Href {
  href: string;
}

export type Definition = TranslationItem & Content;

export type TranslationRequest = TranslationItem;

export type TranslationResponse = Definition & Href;

export interface DefinitionsRequest {
  definitions: Definition[];
}

export interface PollyRequest {
  language: Language;
  word: string;
  speed: string;
}

export const enum Language {
  DE = 'DE',
  FR = 'FR',
  ES = 'ES',
  RU = 'RU'
}
