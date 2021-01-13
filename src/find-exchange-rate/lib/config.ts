import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';

//todo test failures
class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public isOffline: Immutable<boolean>;
  public stage: Immutable<string>;
  public tableName: Immutable<string>;
  public tableEndpoint: Immutable<string>; //todo resolve default endpoint

  public constructor() {
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.stage = this._env.get('STAGE').default('').asString();
    this.tableName = this._env.get('DYNAMODB_TABLE').default('').asString();
    this.tableEndpoint = this._env.get('DYNAMODB_ENDPOINT').default('').asString();
    Object.freeze(this);
  }
}

export const config = new Config();
