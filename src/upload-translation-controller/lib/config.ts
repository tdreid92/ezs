import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker-configuration';

class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public thisFunction: Immutable<string>;
  public stageName: Immutable<string>;
  public isOffline: Immutable<boolean>;
  public functionEndpoint: Immutable<string>;
  public repositoryHandlerFunction: Immutable<string>;

  public constructor() {
    this.thisFunction = FunctionNamespace.UploadTranslationController;
    this.stageName = this._env.get('STAGE_NAME').default('').asString();
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.repositoryHandlerFunction = this._env.get('REPOSITORY_HANDLER_FUNCTION').default('').asString();
    this.functionEndpoint = this._env.get('FUNCTION_ENDPOINT').default('').asString();

    Object.freeze(this);
  }
}

export const config = new Config();
