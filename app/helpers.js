const AWS = require("aws-sdk");
const DynamoDB = new AWS.DynamoDB({
  region: "eu-west-1"
});
const S3 = new AWS.S3({
  region: "eu-west-1"
});

const DYNAMODB_TABLE_NAME = "modernSlaveryPredictions";
const S3_BUCKET_NAME = "nuk-tnl-editorial-prod-staticassets";
const S3_BUCKET_PATH = "2018/modern-slavery-results/results.json";

/*
 * DynamoDB - store
 */
module.exports.store = record =>
  new Promise((resolve, reject) => {
    const dynamoParams = { Item: record, TableName: DYNAMODB_TABLE_NAME };

    DynamoDB.putItem(dynamoParams, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });

/**
 * DynamoDB - scan
 */
module.exports.scan = () =>
  new Promise((resolve, reject) => {
    DynamoDB.scan({ TableName: DYNAMODB_TABLE_NAME }, (err, response) => {
      if (err) return reject(err);
      return resolve(response);
    });
  });

/**
 * S3 - upload
 */
module.exports.upload = body =>
  new Promise((resolve, reject) => {
    S3.putObject(
      {
        Bucket: S3_BUCKET_NAME,
        Key: S3_BUCKET_PATH,
        Body: JSON.stringify(body),
        ContentType: "application/json",
        ACL: "public-read"
      },
      err => {
        if (err) return reject(err);
        return resolve();
      }
    );
  });
