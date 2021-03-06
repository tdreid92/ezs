#!/bin/bash
# shellcheck disable=SC2086

# TODO: resolve better pathing properties
abs_path_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/..
abs_path_resources="${abs_path_root}"/resources/values

# Read yaml specified port
# 1 = value
function read_dev_port() {
  yq e ".Ports.${1}" "${abs_path_resources}"/development.yaml
}

# Read yaml as key-value pairs, if value supplied, just return that value
function read_parameter_overrides() {
  local fileName=${1}
  local value=${2}

  if [ -n "${value}" ]; then
    value=".${value}"
    yq e ".ParameterOverrides${value}" "${abs_path_resources}"/${fileName} -j |
      sed 's/"//g' # Remove quotes
  else
    yq e ".ParameterOverrides${value}" "${abs_path_resources}"/${fileName} -j | # Read with yq and pipe to jq
      jq -j 'to_entries | map("\(.key)=\(.value|tostring) ") | .[]' | # Split to single line, comma-separated output
      sed 's/.\{1\}$//' # Remove last comma
  fi
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

require jq
require yq

CMD="$1"

case $CMD in
  -o | parameter-overrides ) read_parameter_overrides "$2" "$3" ;;
  -p | port ) read_dev_port "$2" ;;
*) show_help ;;
esac
