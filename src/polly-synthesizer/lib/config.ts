import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker-configuration';
import { Language } from '../../../layers/common/nodejs/models/polly-upload-request';

class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public thisFunctionNamespace: Immutable<string>;
  public isOffline: Immutable<boolean>;
  public stage: Immutable<string>;
  public repositoryServiceFunction: Immutable<string>;
  public s3bucketName: Immutable<string>;
  public functionEndpoint: Immutable<string>;

  public constructor() {
    this.thisFunctionNamespace = FunctionNamespace.PollySynthesizer;
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.stage = this._env.get('STAGE').required().asString();
    this.repositoryServiceFunction = this._env.get('REPOSITORY_SERVICE_FUNCTION').required().asString();
    this.s3bucketName = this._env.get('S3_MEDIA_BUCKET').required().asString();
    this.functionEndpoint = this._env.get('FUNCTION_ENDPOINT').default('').asString();

    Object.freeze(this);
  }
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

type VoiceEntry = [Language, string];

const germanVoiceEntry: VoiceEntry = [Language.DE, Orator.Marlene.toString()];
const frenchVoiceEntry: VoiceEntry = [Language.FR, Orator.Celine.toString()];
const spanishVoiceEntry: VoiceEntry = [Language.ES, Orator.Conchita.toString()];
const russianVoiceEntry: VoiceEntry = [Language.RU, Orator.Tatyana.toString()];

export const voiceMap: Map<Language, string> = new Map([
  germanVoiceEntry,
  frenchVoiceEntry,
  spanishVoiceEntry,
  russianVoiceEntry
]);

export const languageCodeMap: Map<Language, string> = new Map([
  [Language.DE, LanguageCode['de-DE'].toString()],
  [Language.ES, LanguageCode['es-ES'].toString()],
  [Language.FR, LanguageCode['fr-FR'].toString()],
  [Language.RU, LanguageCode['ru-RU'].toString()]
]);

export const config = new Config();
