#!/bin/bash

# TODO: resolve better pathing properties
abs_path_root="$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"/..
abs_path_resources="${abs_path_root}"/resources/values

# Read yaml specified port
read_port() {
  yq e ".Ports.${1}" "${abs_path_resources}"/development.yaml
}

# Read yaml as key-value pairs, if arg supplied, just return that value
read_parameter_overrides() {
  local value;
  local arg="${1}"
  if [ -n "${arg}" ]; then
    value=".${arg}"
    yq e ".ParameterOverrides${value}" "${abs_path_resources}"/development.yaml -j |
    sed 's/"//g' # Remove quotes
  else
    yq e ".ParameterOverrides${value}" "${abs_path_resources}"/development.yaml -j | # Read with yq and pipe to jq
    jq -j 'to_entries | map("\(.key)=\(.value|tostring) ") | .[]' | # Split to single line, comma-separated output
    sed 's/.\{1\}$//' # Remove last comma
  fi
}

# Generate temporary json file from development.yaml
read_environment_variables() {
  local output_path="${abs_path_resources}"/envVars.json
  yq e -n ".EnvironmentVariables" "${abs_path_resources}"/development.yaml -jP >  "${output_path}"
  echo "${output_path}"
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

require jq
require yq

CMD="$1"

case $CMD in
  -e | --env-vars ) read_environment_variables "$2" ;;
  -o | --parameter-overrides ) read_parameter_overrides "$2" ;;
  -p | --port ) read_port "$2" ;;
  *) show_help ;;
esac