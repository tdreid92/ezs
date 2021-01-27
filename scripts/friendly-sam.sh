#!/bin/bash
# shellcheck disable=SC2086

# TODO: resolve better pathing properties
abs_path="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
abs_path_template="${abs_path}"/../.aws-sam/build/template.yaml
abs_path_env_parser="${abs_path}"/env-parser.sh
abs_path_dynamodb="${abs_path}"/dynamodb
app_name=${0}

#----------------------------------------------- FN ----------------------------------------------

# 1 = arg
function run_fn_cmd() {
  if [ $1 == api ]; then
    start_api
  elif [ $1 == lambda ]; then
    start_lambda
  elif [ $1 == local ] || [ $1 == start ]; then
    start_local
  else
    show_fn_help
  fi
}

function set_local_function_config() {
  export parameter_overrides=$($abs_path_env_parser parameter-overrides development.yaml)
}

function start_local() {
  set_local_function_config
  echo "Parameter Overrides: ${parameter_overrides}"
  yarn concurrently "./$app_name start_functions api" "./$app_name start_functions lambda"
}

# 1 = lambda or api
function start_functions() {
  local mode=$1
  if [ $1 != api ] && [ $1 != lambda ] ; then
    show_help
  fi
  sam local start-${1} \
    --port "$($abs_path_env_parser port ${1})" \
    --parameter-overrides "${parameter_overrides}" \
    --template "${abs_path_template}" \
    --debug
}

#----------------------------------------------- DB ----------------------------------------------

# 1 = arg
function run_db_cmd() {
  if [ $1 == get ] || [ $1 == read ]; then
    get_item
  elif [ $1 == put ] || [ $1 == write ]; then
    put_items
  elif [ $1 == list ] || [ $1 == scan ]; then
    scan_items
  elif [ $1 == start ]; then
    start_local_db
  elif [ $1 == stop ]; then
    stop_local_db
  else
    show_db_help
  fi
}

function get_local_db_config() {
  export tableName=$($abs_path_env_parser parameter-overrides development.yaml TableName)
  export tablePort=$($abs_path_env_parser port dynamodb)
  export tableEndpoint="http://localhost:$tablePort"
  echo "TableName=$tableName, tablePort=$tablePort, tableEndpoint=$tableEndpoint"
}

function start_local_db() {
  cd "$abs_path_dynamodb" && docker-compose up -d #TODO whats -d do?

  local counter=10
  until (create_table -or $counter -gt 10); do
    sleep 1
  done
}

function stop_local_db() {
  cd "$abs_path_dynamodb" && docker-compose down
}

function create_table() {
  get_local_db_config

  aws dynamodb create-table \
    --table-name $tableName \
    --cli-input-json file://$abs_path_dynamodb/create-table.json \
    --endpoint-url $tableEndpoint \
    --no-cli-pager
}

function get_item() {
  get_local_db_config

  aws dynamodb get-item \
    --table-name $tableName \
    --key file://$abs_path_dynamodb/get-item.json \
    --endpoint-url $tableEndpoint \
    --no-cli-pager
}

function put_items() {
  get_local_db_config

  aws dynamodb put-item \
    --table-name $tableName \
    --item file://$abs_path_dynamodb/put-item.json \
    --endpoint-url $tableEndpoint \
    --no-cli-pager
}

function scan_items() {
  get_local_db_config

  aws dynamodb scan \
    --table-name $tableName \
    --endpoint-url $tableEndpoint \
    --no-cli-pager
}

#---------------------------------------------- HELP ---------------------------------------------

function show_help() {
  # TODO: write this as product nears completion and all features are fleshed out
  echo "Help me, Sam!"
}

function show_fn_help() {
  echo "Only api | lambda | local | permitted"
}

function show_db_help() {
  echo "Only 'read | get | write | put | scan | list | start | stop' permitted."
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
start_functions) start_functions "$2" ;;
#start-lambda) start_local_functions "functions" "$2" ;;
start-local) set_local_function_config && start_local ;;
fn) run_fn_cmd "$2" ;;
db) run_db_cmd "$2" ;;
*) show_help ;;
esac
