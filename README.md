# Modern Slavery API

[ ![Codeship Status for times/serverless-modern-slavery-api](https://app.codeship.com/projects/9083c3b0-2617-0136-763c-6eae248083f7/status?branch=master)](https://app.codeship.com/projects/286759)

## Requirements

* Node.js >8 installed globally on your machine
* `serverless` installed globally on your machine
* Access to an Amazon Web Services account

## Usage

This is a [Serverless](https://serverless.com/) app for AWS Lambda.

For Lambda, `handler.js` handles core requests and passes them to the main app in `app/main.js`. You can run this locally as follows:

    $ yarn start

## Deployment

The skill is deployed to AWS Lambda via Serverless:

    $ yarn deploy --profile= --deploymentBucket=

_See the Serverless docs for additional deployment commands._
