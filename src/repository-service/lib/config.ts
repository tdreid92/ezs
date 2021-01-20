import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker-configuration';

//todo test failures
class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public thisFunction: Immutable<string>;
  public stage: Immutable<string>;
  public isOffline: Immutable<boolean>;
  public tableName: Immutable<string>;
  public tableEndpoint: Immutable<string>; //todo resolve default endpoint

  public constructor() {
    this.thisFunction = FunctionNamespace.RepositoryService;
    this.stage = this._env.get('STAGE').default('').asString();
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.tableName = this._env.get('DYNAMODB_TABLE').default('').asString();
    this.tableEndpoint = this._env.get('DYNAMODB_ENDPOINT').default('').asString();
    Object.freeze(this);
  }
}

export const config = new Config();
