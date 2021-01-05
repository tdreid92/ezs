#!/bin/bash

# TODO: resolve better pathing properties
abs_path="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
abs_path_template="${abs_path}"/../.aws-sam/build/template.yaml
abs_path_yaml_read="${abs_path}"/yaml-read.sh
app=${0}

function start_local() {
  yarn concurrently "./${app} start-lambda --no-config" "./${app} start-api --no-config"
}

# shellcheck disable=SC2155
function set_configuration() {
  export parameter_overrides=$($abs_path_yaml_read -o)
  export environmentVariables=$($abs_path_yaml_read -e development)
  echo "Parameter Overrides: ${parameter_overrides}"
  echo "Environment Variables: " && cat "${environmentVariables}"
}

function start_sam_local() {
    local type=${1}
    local no_config=${2}

    if [ -z "${no_config}" ]; then
      set_configuration
    fi

    sam local start-"${type}" \
    --port "$($abs_path_yaml_read -p "${type}")" \
    --parameter-overrides "${parameter_overrides}" \
    --env-vars "${environmentVariables}" \
    --template "${abs_path_template}" \
    --debug
}

# 1 = table name, 2 = port
function create-dynamodb-table() {
 aws dynamodb create-table \
  --table-name "${1}" \
  --attribute-definitions AttributeName=ExchangeRateKey,AttributeType=S \
  --key-schema AttributeName=ExchangeRateKey,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --endpoint-url http://localhost:"${2}" \
  --no-cli-pager
}

function start-db() {
  local dynamodbPort=$($abs_path_yaml_read -p dynamodb)
  local tableName=$($abs_path_yaml_read -o TableName)

  cd "$abs_path" && docker-compose up -d

  local counter=10
  until (create-dynamodb-table "${tableName}" "${dynamodbPort}" -or $counter -gt 10)
  do
    sleep 1
  done
}


show_help() {
  # TODO: write this as product nears completion and all features are fleshed out
  echo "Help me!"
}

require() {
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
  start-local ) set_configuration && start_local ;;
  start-db ) start-db ;;
  *) show_help ;;
esac