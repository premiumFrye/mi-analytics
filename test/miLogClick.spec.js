/*global describe, beforeEach, it, inject, expect*/
describe('miLogClick', function () {
  var logResult;
  beforeEach(module('miAnalytics'));
  beforeEach(inject(function ($compile, $rootScope, miLogger) {
    var scope = $rootScope.$new(),
      element = angular.element("<div mi-log-click=\"test-event\" mi-log-data=\"{'data': 'test'}\">I'm a test!</div>'"),
      logAction = function (name, object) {
        logResult = {'event': name, 'payload': object};
      };
    $compile(element)(scope);
    miLogger.setLogAction(logAction);
    element.triggerHandler('click');

  }));

  it('should log click events', function () {
    expect(logResult).to.eql({'event': 'click', 'payload': {'description': 'test-event', 'details' : {'data': 'test'}}});
  });
});