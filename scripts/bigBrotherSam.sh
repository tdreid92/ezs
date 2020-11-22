#!/bin/bash

# TODO: resolve better pathing properties
abs_path_root="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"/..
abs_path_template="${abs_path_root}"/.aws-sam/build/template.yaml
abs_path_yamlWarden="${abs_path_root}"/scripts/yamlWarden.sh

start_local() {
  yarn concurrently "./scripts/bigBrotherSam.sh start-lambda --no-config" "./scripts/bigBrotherSam.sh start-api --no-config"
}

# shellcheck disable=SC2155
set_configuration() {
  export parameter_overrides=$($abs_path_yamlWarden -o development)
  export environmentVariables=$($abs_path_yamlWarden -e development)
  echo "Parameter Overrides: ${parameter_overrides}"
  echo "Environment Variables: " && cat "${environmentVariables}"
}

sam_local_start() {
    local type=${1}
    local no_config=${2}

    if [ -z "${no_config}" ]; then
      set_configuration
    fi

    sam local start-"${type}" \
    --port "$($abs_path_yamlWarden -p "${type}")" \
    --parameter-overrides "${parameter_overrides}" \
    --env-vars "${environmentVariables}" \
    --template "${abs_path_template}" \
    --debug
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
  start-api ) sam_local_start "api" "${2}" ;;
  start-lambda ) sam_local_start "lambda" "${2}" ;;
  start-local ) set_configuration && start_local ;;
  *) show_help ;;
esac