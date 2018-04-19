jest.mock("../app", () => ({
  store: jest.fn(),
  process: jest.fn()
}));
jest.mock("../app/helpers", () => ({
  upload: jest.fn()
}));
const { store, process } = require("../handler");
const app = require("../app");
const helpers = require("../app/helpers");

describe("handler", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("#store()", () => {
    it("should return a 400 error if invalid body JSON is passed", done => {
      store(
        {
          body: "NOT_VALID_JSON"
        },
        {},
        (err, response) => {
          expect(err).toEqual(null);
          expect(response).toEqual({
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json"
            },
            statusCode: 400,
            body: JSON.stringify({
              error: "Invalid POST body passed."
            })
          });
          done();
        }
      );
    });

    it("should return a 400 error if a value key is not passed in the body", done => {
      store(
        {
          body: JSON.stringify({
            not: "valid"
          })
        },
        {},
        (err, response) => {
          expect(err).toEqual(null);
          expect(response).toEqual({
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json"
            },
            statusCode: 400,
            body: JSON.stringify({
              error: "Invalid POST body passed."
            })
          });
          done();
        }
      );
    });

    it("should return a 500 error if the data cannot be stored", done => {
      app.store.mockImplementation(() => Promise.reject("Some error"));
      store(
        {
          body: JSON.stringify({
            value: 1000
          })
        },
        {},
        (err, response) => {
          expect(err).toEqual(null);
          expect(response).toEqual({
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json"
            },
            statusCode: 500,
            body: JSON.stringify("Some error")
          });
          done();
        }
      );
    });

    it("should return a 200 OK if the data was stored sucessfully", done => {
      app.store.mockImplementation(() => Promise.resolve());
      store(
        {
          body: JSON.stringify({
            value: 1000
          })
        },
        {},
        (err, response) => {
          expect(err).toEqual(null);
          expect(response).toEqual({
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json"
            },
            statusCode: 200,
            body: null
          });
          done();
        }
      );
    });
  });

  describe("#process()", () => {
    it("should call the callback with an error if the data cannot be processed", done => {
      app.process.mockImplementation(() => Promise.reject("Process error"));

      process({}, {}, (err, response) => {
        expect(err).toEqual("Process error");
        expect(response).not.toBeDefined();
        done();
      });
    });

    it("should call the callback with an error if the upload fails", done => {
      app.process.mockImplementation(() => Promise.resolve());
      helpers.upload.mockImplementation(() => Promise.reject("Upload error"));

      process({}, {}, (err, response) => {
        expect(err).toEqual("Upload error");
        expect(response).not.toBeDefined();
        done();
      });
    });

    it("should call the callback without any arguments if the data processing and upload is a success", done => {
      app.process.mockImplementation(() => Promise.resolve());
      helpers.upload.mockImplementation(() => Promise.resolve());

      process({}, {}, (err, response) => {
        expect(err).not.toBeDefined();
        expect(response).not.toBeDefined();
        done();
      });
    });
  });
});
