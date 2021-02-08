import { from, IEnv, IOptionalVariable, IPresentVariable } from 'env-var';
import { Immutable } from '../../../layers/common/nodejs/types/immutable';
import { FunctionNamespace } from '../../../layers/common/nodejs/models/invoker/invoker';

class Config {
  private _env: IEnv<IPresentVariable, IOptionalVariable> = from(process.env);
  public thisFunctionNamespace: Immutable<string>;
  public stage: Immutable<string>;
  public isOffline: Immutable<boolean>;
  public tableName: Immutable<string>;
  public tableEndpoint: Immutable<string>;
  public s3bucketName: Immutable<string>;

  public constructor() {
    this.thisFunctionNamespace = FunctionNamespace.RepositoryService;
    this.stage = this._env.get('STAGE').required().asString();
    this.isOffline = this._env.get('IS_OFFLINE').default('false').asBool();
    this.tableName = this._env.get('DYNAMODB_TABLE').required().asString();
    this.tableEndpoint = this._env.get('DYNAMODB_ENDPOINT').default('').asString();
    this.s3bucketName = this._env.get('MEDIA_BUCKET_NAME').required().asString();
    Object.freeze(this);
  }
}

export const config = new Config();
