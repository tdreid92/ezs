import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker-configuration';

class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public thisFunction: Immutable<string>;
  public isOffline: Immutable<boolean>;
  public stage: Immutable<string>;
  public repositoryHandlerFunction: Immutable<string>;
  public functionEndpoint: Immutable<string>;

  public constructor() {
    this.thisFunction = FunctionNamespace.PollySynthesizer;
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.stage = this._env.get('STAGE').default('').asString();
    this.repositoryHandlerFunction = this._env.get('REPOSITORY_HANDLER_FUNCTION').default('').asString();
    this.functionEndpoint = this._env.get('FUNCTION_ENDPOINT').default('').asString();

    Object.freeze(this);
  }
}

const enum Language {
  DE,
  FR,
  ES,
  RU
}

const enum LanguageCode {
  'de-DE',
  'fr-FR',
  'es-ES',
  'ru-RU'
}

const enum Orator {
  Marlene,
  Celine,
  Conchita,
  Tatyana
}

type AwsVoicePair = [LanguageCode, Orator];
type VoiceEntry = [Language, AwsVoicePair];

const germanVoiceEntry: VoiceEntry = [Language.DE, [LanguageCode['de-DE'], Orator.Marlene]];
const frenchVoiceEntry: VoiceEntry = [Language.FR, [LanguageCode['fr-FR'], Orator.Celine]];
const spanishVoiceEntry: VoiceEntry = [Language.ES, [LanguageCode['es-ES'], Orator.Conchita]];
const russianVoiceEntry: VoiceEntry = [Language.RU, [LanguageCode['ru-RU'], Orator.Tatyana]];

export const voiceMap: Map<Language, AwsVoicePair> = new Map([
  germanVoiceEntry,
  frenchVoiceEntry,
  spanishVoiceEntry,
  russianVoiceEntry
]);

export const config = new Config();
