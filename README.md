# ECS Fargate Deployment

This repository is using AWS CDK v2 and is not compatible with AWS CDK v1 bootstrap stack.

## Commands:

Run the following commands inside `infrastructure` directory for building, deploying and destroying the stacks

First time setup:
Setup aws cdk in your bash
```
npm install
npm run build
cdk deploy VpcStack
cdk deploy EcrStack
```
logged into your AWS account and go to ECR, click "view push commands" to build and push images 
use "docker buildx build --platform="linux/arm64" -t  " to build linux image. 

then run the following
```
cdk deploy EcsStack
```
After ECS has deployed, go to EC2 and check copy load balance DNS, use port 8081, you should see hello message. Then deploy all to setup CI/CD pipeline
```
cdk deploy --all
cdk destroy --all
```
