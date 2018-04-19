const dynamoPutItem = jest.fn();
const dynamoScan = jest.fn();
const s3PutObject = jest.fn();
class mockDynamoDB {
  putItem = dynamoPutItem;
  scan = dynamoScan;
}
class mockS3 {
  putObject = s3PutObject;
}
jest.mock("aws-sdk", () => ({
  DynamoDB: mockDynamoDB,
  S3: mockS3
}));

const {
  DYNAMODB_TABLE_NAME,
  S3_BUCKET_NAME,
  S3_BUCKET_PATH,
  store,
  scan,
  upload
} = require("../helpers");

describe("helpers", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("#store()", () => {
    it("should call DynamoDB.putItem passing in the correct arguments", () => {
      dynamoPutItem.mockImplementation((_, callback) => callback(null, {}));

      const record = {
        uuid: { S: "abcde" },
        value: { N: "10000" }
      };

      return store(record).then(() => {
        expect(dynamoPutItem.mock.calls[0][0]).toEqual({
          Item: record,
          TableName: DYNAMODB_TABLE_NAME
        });
      });
    });

    it("should reject with an error if DynamoDB.putItem errors", () => {
      dynamoPutItem.mockImplementation((_, callback) =>
        callback("Dynamo error")
      );

      expect.assertions(1);

      return store({
        uuid: { S: "abcde" },
        value: { N: "10000" }
      }).catch(err => {
        expect(err).toEqual("Dynamo error");
      });
    });

    it("should resolve if DynamoDB.putItem is successful", () => {
      dynamoPutItem.mockImplementation((_, callback) =>
        callback(null, "Dynamo response")
      );

      return store({
        uuid: { S: "abcde" },
        value: { N: "10000" }
      }).then(res => {
        expect(res).toEqual("Dynamo response");
      });
    });
  });

  describe("#scan()", () => {
    it("should call DynamoDB.scan passing in the correct arguments", () => {
      dynamoScan.mockImplementation((_, callback) => callback(null, {}));

      return scan().then(() => {
        expect(dynamoScan.mock.calls[0][0]).toEqual({
          TableName: DYNAMODB_TABLE_NAME
        });
      });
    });

    it("should reject with an error if DynamoDB.scan fails", () => {
      dynamoScan.mockImplementation((_, callback) =>
        callback("Dynamo Scan error")
      );

      return scan().catch(err => {
        expect(err).toEqual("Dynamo Scan error");
      });
    });

    it("should resolve if DynamoDB.scan succeeds", () => {
      dynamoScan.mockImplementation((_, callback) =>
        callback(null, "Dynamo Scan success")
      );

      return scan().then(res => {
        expect(res).toEqual("Dynamo Scan success");
      });
    });
  });

  describe("#upload()", () => {
    it("should call S3.putObject passing in the correct arguments", () => {
      s3PutObject.mockImplementation((_, callback) => callback(null, {}));

      return upload({ foo: "bar" }).then(() => {
        expect(s3PutObject.mock.calls[0][0]).toEqual({
          Bucket: S3_BUCKET_NAME,
          Key: S3_BUCKET_PATH,
          Body: '{"foo":"bar"}',
          ContentType: "application/json",
          ACL: "public-read"
        });
      });
    });

    it("should reject with an error if S3.putObject fails", () => {
      s3PutObject.mockImplementation((_, callback) =>
        callback("S3 putObject error")
      );

      return upload().catch(err => {
        expect(err).toEqual("S3 putObject error");
      });
    });

    it("should resolve if S3.putObject succeeds", () => {
      s3PutObject.mockImplementation((_, callback) =>
        callback(null, "S3 putObject success")
      );

      return upload().then(res => {
        expect(res).toEqual("S3 putObject success");
      });
    });
  });
});
