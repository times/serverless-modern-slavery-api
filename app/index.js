'use strict';

// amazon sdk - set region
const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-west-1' });

// database client
const DynamoDB = new AWS.DynamoDB();
const tableName = 'offsideOrNot';

// S3 client
const S3 = new AWS.S3();

// uuid generator
const uuidV1 = require('uuid/v1');

/*
 * Store data - query string data stored in database
 */

module.exports.store = query => {
  return new Promise((resolve, reject) => {
    // set record
    const record = {
      uuid: { S: uuidV1() },
      type: { S: query.type },
      level: { S: query.level },
      plays: { S: query.plays },
    };

    // update record
    if (query.type == 'clip') {
      record.clip = { S: query.clip };
      record.decision = { S: query.decision };
      record.correct = { S: query.correct };
    } else if (query.type == 'level') {
      record.score = { S: query.score };
    }

    // store record in database
    return storeInDB(record, (err, data) => {
      return err ? resolve({ error: err }) : resolve({ success: true });
    });
  });
};

/*
 * DynamoDB - store
 */

const storeInDB = (record, callback) => {
  const dynamoParams = { Item: record, TableName: tableName };
  DynamoDB.putItem(dynamoParams, callback);
};

/*
 * Retrieve data - return JSON representation of data
 */

module.exports.retrieve = query => {
  return readFromS3();
};

/*
 * S3 - upload
 */

const readFromS3 = body => {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: 'nuk-tnl-editorial-prod-staticassets',
      Key: '2017/bespoke/offside-or-not/retrieve.json',
    };

    S3.getObject(params, function(err, data) {
      return err
        ? reject(err)
        : resolve(JSON.parse(new Buffer(data.Body).toString()));
    });
  });
};

/*
 * Process data - calculate totals and store JSON on S3
 */

module.exports.process = query => {
  return scanDB(null, [])
    .then(data => {
      return createResponse(data);
    })
    .then(body => {
      return uploadToS3(body);
    })
    .catch(err => {
      resolve({ error: err });
    });
};

/*
 * DynamoDB - scan
 */

const scanDB = (key, data) => {
  const dynamoParams = { TableName: tableName };
  if (key) dynamoParams.ExclusiveStartKey = key;

  return new Promise((resolve, reject) => {
    DynamoDB.scan(dynamoParams, (err, response) => {
      if (err) return reject(err);

      data.push(response);

      if (typeof response.LastEvaluatedKey != 'undefined')
        return resolve(scanDB(response.LastEvaluatedKey, data));

      return resolve(data);
    });
  });
};

/*
 * S3 - upload
 */

const uploadToS3 = body => {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: 'nuk-tnl-editorial-prod-staticassets',
      Key: '2017/bespoke/offside-or-not/retrieve.json',
      Body: JSON.stringify(body),
      ContentType: 'application/json',
      ACL: 'public-read',
    };

    S3.putObject(params, function(err, data) {
      return err ? reject(err) : resolve(data);
    });
  });
};

/*
 * Create JSON response
 */

const createResponse = data => {
  // set levels object
  const levels = [];
  for (let i = 0; i < 3; i++) {
    levels[i] = { scores: [], clips: [], ft: 0, t: 0 };
    //levels[i] = { scores: [], clips: [], ft: 6, t: 6 };
    for (let ii = 0; ii < 6; ii++) {
      levels[i].scores[ii] = { ft: 0, t: 0 };
      //levels[i].scores[ii] = { ft: 1, t: 1 };
    }
    for (let ii = 0; ii < 5; ii++) {
      levels[i].clips[ii] = { fc: 0, ft: 0, c: 0, t: 0 };
      //levels[i].clips[ii] = { fc: 1, ft: 2, c: 1, t: 2 };
    }
  }

  // calculate scores and correct answers
  for (let i = 0; i < data.length; i++) {
    for (let ii = 0; ii < data[i].Items.length; ii++) {
      const item = data[i].Items[ii];
      if (item.type.S == 'level') {
        // set record fields
        const level = item.level.S;
        const score = parseInt(item.score.S);
        const plays = item.plays.S;
        // set total values
        levels[level].t += 1;
        levels[level].scores[score].t += 1;
        // set total values for first time plays
        if (plays == '1') {
          levels[level].ft += 1;
          levels[level].scores[score].ft += 1;
        }
      } else if (item.type.S == 'clip') {
        // set record fields
        const level = item.level.S;
        const clip = item.clip.S;
        const correct = item.correct.S;
        const plays = item.plays.S;
        // set correct and total values
        if (correct == 'true') levels[level].clips[clip].c += 1;
        levels[level].clips[clip].t += 1;
        // set correct and total values for first time plays
        if (plays == '1') {
          if (correct == 'true') levels[level].clips[clip].fc += 1;
          levels[level].clips[clip].ft += 1;
        }
      }
    }
  }

  // calculate score percentages
  for (let i = 0; i < levels.length; i++) {
    let ftp = 0;
    let tp = 0;
    for (let ii = 0; ii < levels[i].scores.length; ii++) {
      levels[i].scores[ii].fp = levels[i].scores[ii].ft / levels[i].ft * 100;
      levels[i].scores[ii].p = levels[i].scores[ii].t / levels[i].t * 100;
      // set running totals
      levels[i].scores[ii].ftp = Math.round(ftp);
      levels[i].scores[ii].tp = Math.round(tp);
      // increment running totals
      ftp += levels[i].scores[ii].fp;
      tp += levels[i].scores[ii].p;
    }
  }

  // calculate correct percentages
  for (let i = 0; i < levels.length; i++) {
    for (let ii = 0; ii < levels[i].clips.length; ii++) {
      levels[i].clips[ii].fp = Math.round(
        levels[i].clips[ii].fc / levels[i].clips[ii].ft * 100
      );
      levels[i].clips[ii].p = Math.round(
        levels[i].clips[ii].c / levels[i].clips[ii].t * 100
      );
    }
  }

  return { levels: levels };
};
