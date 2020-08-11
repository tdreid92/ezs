#!/bin/bash

abs_path_root="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"/../
abs_path_resources="${abs_path_root}"resources/values/

read_port() {
  yq r "${abs_path_resources}"parameters.yaml "ports.${1}"
}

# Read yaml as key-value pairs
read_parameter_overrides() {
  yq r "${abs_path_resources}"parameters.yaml -j "parameterOverrides" | # Read with yq and pipe to jq
  jq -j 'to_entries | map("\(.key)=\(.value|tostring),") | .[]' | # Split to single line, comma-separated output
  sed 's/.\{1\}$//' # Remove last comma
}

# Generate temporary json file from development.yaml
read_environment_variables() {
  local output_path="${abs_path_resources}"envVars.json
  yq r "${abs_path_resources}"parameters.yaml -jP "environmentVariables" > "${output_path}"
  # TODO: check if last line was success
  echo "${output_path}"
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

require jq
require yq

CMD="$1"

case $CMD in
  -e | --env-vars ) read_environment_variables "$2" ;;
  -o | --parameter-overrides ) read_parameter_overrides "$2" ;;
  -p | --port ) read_port "$2" ;;
  *) show_help ;;
esac