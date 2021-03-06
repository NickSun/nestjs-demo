#!/bin/bash

GREEN="\033[0;32m"
RESET="\033[0m"

source .env

echo -e "${GREEN}Docker login${RESET}"
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${AWS_ECR_REPOSITORY_DOMAIN_URI}"

echo -e "${GREEN}Create nestjs-demo-repo stack${RESET}"
aws cloudformation create-stack \
  --stack-name nestjs-demo-repo \
  --template-body file://cloudformation/aws-ecr-repository.yaml \
  --capabilities CAPABILITY_NAMED_IAM
aws cloudformation wait stack-create-complete \
  --stack-name nestjs-demo-repo

echo -e "${GREEN}Build image and push${RESET}"
docker build -t nestjs-demo .
docker tag nestjs-demo:latest "${AWS_ECR_REPOSITORY_DOMAIN_URI}/nestjs-demo:latest"
docker push "${AWS_ECR_REPOSITORY_DOMAIN_URI}/nestjs-demo:latest"

echo -e "${GREEN}Create nestjs-demo-network stack${RESET}"
aws cloudformation create-stack \
  --stack-name nestjs-demo-network \
  --template-body file://cloudformation/network.yaml \
  --capabilities CAPABILITY_NAMED_IAM
aws cloudformation wait stack-create-complete --stack-name nestjs-demo-network

echo -e "${GREEN}Create nestjs-demo-service stack${RESET}"
aws cloudformation create-stack \
  --stack-name nestjs-demo-service \
  --template-body file://cloudformation/service-fargate-public-subnet-public-lb.yaml  \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters "ParameterKey=ImageUrl, ParameterValue=${AWS_ECR_REPOSITORY_DOMAIN_URI}/nestjs-demo:latest"
aws cloudformation wait stack-create-complete --stack-name nestjs-demo-service

echo -e "${GREEN}Public URL:${RESET}"
aws cloudformation list-exports | grep 'elb.amazonaws.com' | cut -d '"' -f4