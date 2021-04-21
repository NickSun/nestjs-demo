#!/bin/bash

GREEN="\033[0;32m"
RESET="\033[0m"

echo -e "${GREEN}Remove log group${RESET}"
aws logs delete-log-group --log-group-name production-service-nestjs-demo

echo -e "${GREEN}Remove nestjs-demo-service stack${RESET}"
aws cloudformation delete-stack --stack-name nestjs-demo-service
aws cloudformation wait stack-delete-complete --stack-name nestjs-demo-service

echo -e "${GREEN}Remove nestjs-demo-network stack${RESET}"
aws cloudformation delete-stack --stack-name nestjs-demo-network
aws cloudformation wait stack-delete-complete --stack-name nestjs-demo-network

echo -e "${GREEN}Remove nestjs-demo-repo stack${RESET}"
aws ecr batch-delete-image --repository-name nestjs-demo --image-ids imageTag=latest
aws cloudformation delete-stack --stack-name nestjs-demo-repo
aws cloudformation wait stack-delete-complete --stack-name nestjs-demo-repo