/*global describe, beforeEach, it, inject, expect*/
describe('miLogger', function () {
  var logResult,
    testPayload = {data: 'test payload'};
  beforeEach(module('miAnalytics'));
  describe('logging service using promises', function () {
    beforeEach(inject(function ($rootScope, $q, miLogger) {
      var testLogAction = function (message, payload) {
          var dfd = $q.defer();
          if (message === 'success') {
            dfd.resolve({'result': 'success', 'payload': payload});
          }
          if (message === 'failure') {
            dfd.resolve({'result': 'failure'});
          }
          return dfd.promise;
        };

      miLogger.setLogAction(testLogAction);
      miLogger.logAction('success', testPayload)
        .then(function (result) {
          logResult = result;
        }, function (failure) {
          logResult = failure;
        });
      logResult = 'fail test';

      $rootScope.$apply();
    }));
    it("set and call log action", function () {
      expect(logResult.result).to.equal('success');
    });
    it("receive a payload", function () {
      expect(logResult.payload).to.equal(testPayload);
    });
  });
  describe('logging service using callbacks', function () {
    beforeEach(inject(function ($rootScope, miLogger) {
      var testLogAction = function (message, payload, callback) {
          if (message === 'error') {
            callback(true);
          } else {
            callback(false, payload);
          }
        },
        testCallback = function (error, success) {
          if (error) {
            return 'error';
          }
          return success;
        };
      miLogger.setLogAction(testLogAction);
      miLogger.logAction('success', testPayload, testCallback)
        .then(function (result) {
          logResult = result;
        }, function (failure) {
          logResult = failure;
        });
      $rootScope.$apply();
    }));
    it("set and call log action", function () {
      expect(logResult).to.equal(testPayload);
    });
  });
});