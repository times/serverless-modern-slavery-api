const uuid = require("uuid/v4");
const { store, scan } = require("./helpers");

const processItem = ({ value }) => parseInt(value.N);

/**
 * Store data - query string data stored in database
 */
module.exports.store = value =>
  store({
    uuid: { S: uuid() },
    value: { N: value.toString() }
  });

/**
 * Process data - calculate totals and store JSON on S3
 */
module.exports.process = () =>
  scan()
    .then(({ Items }) => Items.map(processItem).sort((a, b) => a - b))
    .then(records => ({
      count: records.length,
      records
    }));
