import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker-configuration';

class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public thisFunctionNamespace: Immutable<FunctionNamespace>;
  public isOffline: Immutable<boolean>;
  public stage: Immutable<string>;
  public repositoryServiceFunction: Immutable<string>;
  public functionEndpoint: Immutable<string>;

  public constructor() {
    this.thisFunctionNamespace = FunctionNamespace.GetTranslationController;
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.stage = this._env.get('STAGE').required().asString();
    this.repositoryServiceFunction = this._env.get('REPOSITORY_SERVICE_FUNCTION').required().asString();
    this.functionEndpoint = this._env.get('FUNCTION_ENDPOINT').default('').asString();

    Object.freeze(this);
  }
}

export const config = new Config();
