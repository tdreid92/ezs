#!/bin/bash

#
#aws dynamodb scan \
#    --table-name CryptocurrencyRates_DEV \
#    --endpoint-url http://localhost:8000 #Rename to HashKey
#TODO: fix -no-cli-pager
aws dynamodb create-table \
  --table-name CryptocurrencyRates_DEV \
  --attribute-definitions AttributeName=ExchangeRateKey,AttributeType=S \
  --key-schema AttributeName=ExchangeRateKey,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
  --endpoint-url http://localhost:8000

