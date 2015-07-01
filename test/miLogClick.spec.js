/*global describe, beforeEach, it, inject, expect*/
describe('miLogClick', function () {
  var logDetails,
    logName;
  beforeEach(module('miAnalytics'));
  beforeEach(inject(function ($compile, $rootScope, miLogger) {
    var scope = $rootScope.$new(),
      element = angular.element("<div mi-log-click=\"test-event\" mi-log-data=\"{'data': 'test'}\">I'm a test!</div>'"),
      logAction = function (name, object) {
        logName = name;
        logDetails = {'event': name, 'payload': object};
      };
    $compile(element)(scope);
    miLogger.setLogAction(logAction);
    element.triggerHandler('click');

  }));
  it('sends click event', function () {
    expect(logName).to.eql('click');
  });
  it('send event name', function () {
    expect(logDetails.payload.description).to.eql('test-event');
  });
  it('send details in mi-log-data', function () {
    expect(logDetails).to.eql({'event': 'click', 'payload': {'description': 'test-event', 'details' : {'data': 'test'}}});
  });
});