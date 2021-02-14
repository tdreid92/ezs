#!/bin/bash
# shellcheck disable=SC2086

abs_path_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"/..
abs_path_open_api="${abs_path_root}"/resources/open-api.yaml


mkdir -p $abs_path_root/.aws-sam/build/resources && cp $abs_path_open_api $abs_path_root/.aws-sam/build/resources/open-api.yaml