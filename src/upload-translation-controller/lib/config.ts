import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker';

class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public thisFunctionNamespace: Immutable<string>;
  public stage: Immutable<string>;
  public isOffline: Immutable<boolean>;
  public repositoryServiceFunction: Immutable<string>;
  public functionEndpoint: Immutable<string>;
  public pollySynthesizerFunction: Immutable<string>;

  public constructor() {
    this.thisFunctionNamespace = FunctionNamespace.UploadTranslationController;
    this.stage = this._env.get('STAGE').required().asString();
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.repositoryServiceFunction = this._env.get('REPOSITORY_SERVICE_FUNCTION').required().asString();
    this.functionEndpoint = this._env.get('FUNCTION_ENDPOINT').default('').asString();
    this.pollySynthesizerFunction = this._env.get('POLLY_SYNTHESIZER_FUNCTION').required().asString();

    Object.freeze(this);
  }
}

export const config = new Config();
