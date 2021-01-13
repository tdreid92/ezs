#!/bin/bash
# shellcheck disable=SC2086

# TODO: resolve better pathing properties
abs_path="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
abs_path_template="${abs_path}"/../.aws-sam/build/template.yaml
abs_path_yaml_read="${abs_path}"/yaml-read.sh
app=${0}

function start_local() {
  yarn concurrently "./${app} start-lambda --no-config" "./${app} start-api --no-config"
}

# shellcheck disable=SC2155
function set_local_configuration() {
  export parameter_overrides=$($abs_path_yaml_read --parameter-overrides development.yaml)
  echo "Parameter Overrides: ${parameter_overrides}"
}

# 1 = lambda or api
function start_sam_local() {
  local no_config=${2}

  if [ -z "${no_config}" ]; then
    set_local_configuration
  fi

  sam local start-${1} \
    --port "$($abs_path_yaml_read --port ${1})" \
    --parameter-overrides "${parameter_overrides}" \
    --template "${abs_path_template}" \
    --debug
}

# 1 = table name, 2 = port
function create_dynamodb_table() {
  aws dynamodb create-table \
    --table-name ${1} \
    --attribute-definitions AttributeName=ExchangeRateKey,AttributeType=S \
    --key-schema AttributeName=ExchangeRateKey,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --endpoint-url http://localhost:${2} \
    --no-cli-pager
}

function start_local_db() {
  local dynamodbPort=$($abs_path_yaml_read --port dynamodb)
  local tableName=$($abs_path_yaml_read --parameter-overrides development.yaml TableName)

  cd "$abs_path" && docker-compose up -d

  local counter=10
  until (create_dynamodb_table ${tableName} ${dynamodbPort} -or $counter -gt 10); do
    sleep 1
  done
}

function show_help() {
  # TODO: write this as product nears completion and all features are fleshed out
  echo "Help me!"
}

function require() {
  if [ ! -x "$(command -v ${1})" ]; then
    echo "Error: requires ${1}" 1>&2
    if [[ "$OSTYPE" == "darwin"* ]]; then
      if [ ! -x "$(command -v brew)" ]; then
        echo "Install Brew: https://brew.sh/" 1>&2
      fi
      echo "brew install ${1}" 1>&2
    fi
    exit 1
  fi
}

#------------------------------------------------------------------

require sam

CMD="$1"

case $CMD in
  start-api ) start_sam_local "api" "${2}" ;;
  start-lambda ) start_sam_local "lambda" "${2}" ;;
  start-local ) set_local_configuration && start_local ;;
  start-db ) start_local_db ;;
*) show_help ;;
esac
