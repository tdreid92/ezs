import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker-configuration';

class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public isOffline: Immutable<boolean>;
  public stageName: Immutable<string>;
  public functionEndpoint: Immutable<string>;
  public uploadTranslationFunction: Immutable<string>;
  public thisFunction: Immutable<string>;

  public constructor() {
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.stageName = this._env.get('STAGE_NAME').default('').asString();
    this.functionEndpoint = this._env.get('FUNCTION_ENDPOINT').default('').asString();
    this.uploadTranslationFunction = this._env.get('UPLOAD_TRANSLATION_FUNCTION').default('').asString();
    this.thisFunction = FunctionNamespace.TranslationController;

    Object.freeze(this);
  }
}

export const config = new Config();
