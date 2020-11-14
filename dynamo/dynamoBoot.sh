#!/bin/bash

#
#aws dynamodb scan \
#    --table-name CryptocurrencyRates_DEV \
#    --endpoint-url http://localhost:8000 #Rename to HashKey
aws dynamodb create-table \
  --table-name CryptocurrencyRates_DEV \
  --attribute-definitions AttributeName=RateKey,AttributeType=S \
  --key-schema AttributeName=RateKey,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --endpoint-url http://localhost:8000 \
  --no-cli-pager
