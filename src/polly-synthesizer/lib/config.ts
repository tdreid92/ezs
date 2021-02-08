import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker';
import { Language } from '../../../layers/common/nodejs/models/translation';

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
    this.s3bucketName = this._env.get('MEDIA_BUCKET_NAME').required().asString();
    this.functionEndpoint = this._env.get('FUNCTION_ENDPOINT').default('').asString();

    Object.freeze(this);
  }
}

const enum LanguageCode {
  'de-DE' = 'de-DE',
  'fr-FR' = 'fr-FR',
  'es-ES' = 'fr-FR',
  'ru-RU' = 'fr-FR'
}

const enum Orator {
  Marlene = 'Marlene',
  Celine = 'Celine',
  Conchita = 'Conchita',
  Tatyana = 'Tatyana'
}

export const voiceMap: Map<Language, Orator> = new Map([
  [Language.DE, Orator.Marlene],
  [Language.FR, Orator.Celine],
  [Language.ES, Orator.Conchita],
  [Language.RU, Orator.Tatyana]
]);

export const languageCodeMap: Map<Language, LanguageCode> = new Map([
  [Language.DE, LanguageCode['de-DE']],
  [Language.ES, LanguageCode['es-ES']],
  [Language.FR, LanguageCode['fr-FR']],
  [Language.RU, LanguageCode['ru-RU']]
]);

export const config = new Config();
