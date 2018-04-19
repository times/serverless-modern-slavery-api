const { store, process } = require("./app");
const { upload } = require("./app/helpers");

const processJson = json => {
  let result;

  try {
    result = JSON.parse(json);
  } catch (e) {
    result = {};
  }

  return result;
};

/*
 * Store data - query string data stored in database
 */
module.exports.store = (event, context, callback) => {
  const { body: bodyJSON } = event;
  const { value } = processJson(bodyJSON);

  if (!value) {
    callback(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid POST body passed."
      })
    });
    return;
  }

  store(value)
    .then(() => {
      callback(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        statusCode: 200,
        body: null
      });
    })
    .catch(error => {
      callback(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        statusCode: 500,
        body: JSON.stringify(error)
      });
    });
};

/*
 * Process data - calculate totals and store JSON on S3
 */
module.exports.process = (event, context, callback) => {
  process()
    .then(upload)
    .then(() => callback())
    .catch(error => callback(error));
};
