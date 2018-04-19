# Offside Or Not

## Requirements

- Node.js installed globally on your machine
- Serverless installed globally on your machine
- Access to an Amazon Web Services account


## Usage

This is a [Serverless](https://serverless.com/) app for AWS Lambda. 

Copy `.env.sample.yml` to `.env.yml` and fill in the values.

For Lambda, `handler.js` handles core requests and passes them to the main app in `app/main.js`. You can run this locally as follows:

    $ serverless offline start


## Deployment

The skill is deployed to AWS Lambda via Serverless. Configure Serverless in the `serverless.yml` file, and deploy by running:

    $ serverless deploy

_See the Serverless docs for additional deployment commands._
