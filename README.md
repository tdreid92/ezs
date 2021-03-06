### Eazy SAM Framework

Framework that integrates Typescript, Yarn 2, AWS SAM, Docker, Webpack, ESLint, Prettier, Lambda Layers, and parameterized 
environments configuration.

1. [Yarn 2](https://yarnpkg.com/getting-started/install)
1. [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
1. [AWS CLI 2](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html)
1. [Docker](https://docs.docker.com/get-docker/)
1. [LocalStack](https://github.com/localstack/localstack)
1. [jq](https://github.com/stedolan/jq)
1. [yq](https://github.com/mikefarah/yq)

```bash
brew install yarn
brew install jq
brew install yq
brew tap aws/tap
brew install awslci
brew install aws-sam-cli
brew install localstack
aws configure
```
https://theburningmonk.com/cloudformation-ref-and-getatt-cheatsheet/