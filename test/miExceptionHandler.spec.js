/*global describe, beforeEach, it, inject, expect*/
describe("exception handler", function () {
  var errName,
    errPayload,
    errCause = "user",
    errMessage = "test error",
    errTest = new Error(errMessage);
  beforeEach(module('miAnalytics'));
  beforeEach(inject(function (miLogger) {
    var testLogAction = function (name, payload) {
      errName = name;
      errPayload = payload;
    };
    // console.log(Object.keys(errTest), errPayload);
    miLogger.setLogAction(testLogAction);
  }));
  it("should throw an error", inject(function ($exceptionHandler) {
    expect(function () {
      $exceptionHandler(errTest, errCause);
    }).to.throw(errTest);
  }));
  it("should log an error event", function () {
    expect(errName).to.equal('error');
  });
  it("should log the entire error object", function () {
    expect(errPayload).to.include.keys('details');
    expect(errPayload).to.include.keys('description');
  });
  it("should include the error message", function () {
    expect(errPayload.details.message).to.include(errMessage);
  });
  it("should include the error cause", function () {
    expect(errPayload.details.message).to.include(errCause);
  });
});