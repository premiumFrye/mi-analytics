/*global describe, beforeEach, it, inject, expect*/
describe('http interceptor', function () {
  var http,
    httpBackend,
    rootScope,
    errDescription,
    errPayload,
    errResponse,
    testLogAction = function (description, payload) {
      errDescription = description;
      errPayload = payload;
    };
  beforeEach(module('miAnalytics'));
  beforeEach(inject(function (miLogger, _$httpBackend_, _$http_, _$rootScope_) {
    httpBackend = _$httpBackend_;
    http = _$http_;
    rootScope = _$rootScope_;

    miLogger.setLogAction(testLogAction);
    httpBackend.expectGET('foo')
      .respond(401, '');
    http.get('foo')
      .then(angular.noop, function (err) {
        errResponse = err;
      });
    httpBackend.flush();
    rootScope.$digest();
  }));
  it('reports http errors', function () {
    expect(errDescription).to.equal('error');
  });
  it('reports with description "API Error"', function () {
    expect(errPayload.description).to.equal('API Error');
  });
  it('report entire response payload', function () {
    expect(errPayload.details).to.have.keys(['data', 'status', 'headers', 'config', 'statusText']);
  });
  it('pass response back to http resolve', function () {
    expect(errPayload.details).to.eql(errResponse);
  });

});