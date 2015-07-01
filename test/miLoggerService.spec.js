/*global describe, beforeEach, it, inject, expect*/
describe('miLogger', function () {
  var logResult;
  beforeEach(module('miAnalytics'));
  describe('logging service', function () {
    beforeEach(inject(function ($rootScope, $q, miLogger) {
      var testLogAction = function (message) {
          var dfd = $q.defer();
          if (message === 'success') {
            dfd.resolve({result: 'success'});
          }
          if (message === 'failure') {
            dfd.resolve({result: 'failure'});
          }
          return dfd.promise;
        };

      miLogger.setLogAction(testLogAction);
      miLogger.logAction('success', {payload: 'test payload'})
        .then(function (result) {
          logResult = result;
          // expect(result.result).to.equal('success');
        }, function (failure) {
          logResult = failure;
        });
      logResult = 'fail test';

      $rootScope.$apply();
    }));
    it("set log action", function () {
      expect(logResult.result).to.equal('success');
    });
  });
});