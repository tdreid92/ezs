import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';

//todo test failures
class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public isOffline: Immutable<boolean>;
  public stage: Immutable<string>;
  public lambdaEndpoint: Immutable<string>;
  public lambdaFindExchangeRate: Immutable<string>;

  public constructor() {
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.stage = this._env.get('STAGE').default('').asString();
    this.lambdaEndpoint = this._env.get('LAMBDA_ENDPOINT').default('').asString();
    this.lambdaFindExchangeRate = this._env.get('LAMBA_FINDEXCHANGERATE').default('').asString();
    Object.freeze(this);
  }
}

export const config = new Config();
