/*global describe, beforeEach, it, inject, expect*/
describe("ExampleCtrl", function () {
  var errName,
    errPayload,
    retarded = new Error("test error");
  beforeEach(module('miAnalytics'));
  beforeEach(inject(function (miLogger) {
    var testLogAction = function (name, payload) {
      errName = name;
      errPayload = payload;
    };
    miLogger.setLogAction(testLogAction);
  }));
  it("should throw an error", inject(function ($exceptionHandler) {
    expect(function () {
      $exceptionHandler(retarded, 'user');
    }).to.throw(retarded);
  }));
  it("should log the error", function () {
    expect(errName).to.equal('error');
  });
  it("should log the entire error", function () {
    console.log(errPayload, retarded, errPayload == retarded, errPayload === retarded);
  });
});