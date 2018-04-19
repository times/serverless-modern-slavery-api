jest.mock("../helpers", () => ({
  store: jest.fn(),
  scan: jest.fn()
}));
jest.mock("uuid/v4", () => () => "abcde");
const { store, process } = require("../index");
const helpers = require("../helpers");

describe("app", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  describe("#store()", () => {
    it("should call helpers.store passing in the correct arguments", () => {
      helpers.store.mockImplementation(() => Promise.resolve());
      return store(10000).then(() => {
        expect(helpers.store).toHaveBeenCalledWith({
          uuid: { S: "abcde" },
          value: { N: "10000" }
        });
      });
    });

    it("should return the result of helpers.store", () => {
      helpers.store.mockImplementation(() => Promise.reject("Some error"));

      expect.assertions(1);

      return store(10000).catch(err => {
        expect(err).toEqual("Some error");
      });
    });
  });

  describe("#process()", () => {
    it("should return the correct sorted records", () => {
      helpers.scan.mockImplementation(() =>
        Promise.resolve({
          Items: [
            {
              value: {
                N: 12345
              }
            },
            {
              value: {
                N: 84729
              }
            },
            {
              value: {
                N: 234
              }
            }
          ]
        })
      );

      return process().then(records => {
        expect(records).toEqual({ count: 3, records: [234, 12345, 84729] });
      });
    });
  });
});
