/*global describe, beforeEach, it, inject, expect*/
describe('miAnalytics', function () {
  describe('services exposed', function () {
    beforeEach(module('miAnalytics'));
    it("handle opening custom urls schemes on mobile", inject(function (openUrlListener) {
      expect(openUrlListener).to.be.a('object');
    }));
    it("provide a service for handling logging", inject(function (miLogger) {
      expect(miLogger).to.be.a('object');
    }));
  });
});