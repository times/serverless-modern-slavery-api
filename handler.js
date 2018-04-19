'use strict';

const { store, retrieve, process } = require('./app');

/*
 * Store data - query string data stored in database
 */

module.exports.store = (event, context, callback) => {
  store(event.queryStringParameters)
    .then(respond => {
      callback(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        statusCode: 200,
        body: JSON.stringify(respond),
      });
    })
    .catch(error => {
      callback(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        statusCode: 500,
        body: JSON.stringify(error),
      });
    });
};

/*
 * Retrieve data - return JSON representation of data
 */

module.exports.retrieve = (event, context, callback) => {
  retrieve()
    .then(respond => {
      callback(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        statusCode: 200,
        body: JSON.stringify(respond),
      });
    })
    .catch(error => {
      callback(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        statusCode: 500,
        body: JSON.stringify(error),
      });
    });
};

/*
 * Process data - calculate totals and store JSON on S3
 */

module.exports.process = (event, context, callback) => {
  process()
    .then(respond => {
      callback(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        statusCode: 200,
        body: JSON.stringify(respond),
      });
    })
    .catch(error => {
      callback(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        statusCode: 500,
        body: JSON.stringify(error),
      });
    });
};

