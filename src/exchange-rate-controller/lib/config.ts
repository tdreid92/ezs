import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';

//todo test failures
class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public isOffline: Immutable<boolean>;
  public lambdaEndpoint: Immutable<string>;

  public constructor() {
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.lambdaEndpoint = this._env.get('LAMBDA_ENDPOINT').default('').asString();
    Object.freeze(this);
  }
}

export const config = new Config();
