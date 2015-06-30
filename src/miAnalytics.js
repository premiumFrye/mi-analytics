(function () {
  'use strict';
  /**
   * Service to configure logging action
   */
  var miLoggerService = ['$q', '$rootScope', function ($q, $rootScope) {
    var miLogger = {},
      logService,
      logAction,
      defaultPayload,
      prepStateChangePayload = function (event, toState, toParams, fromState, fromParams, error) {
        angular.noop(event);
        var payload = {};
        payload.toState = toState.name;
        payload.fromState = fromState.name;
        if (error) {
          payload.error = error;
        }
        angular.forEach(toParams, function (value, key) {
          if (!value) {
            delete toParams[key];
          }
        });
        if (Object.keys(toParams).length > 0) {
          payload.toParams = JSON.stringify(toParams);
        }
        angular.forEach(fromParams, function (value, key) {
          if (!value) {
            delete fromParams[key];
          }
        });
        if (Object.keys(fromParams).length > 0) {
          payload.fromParams = JSON.stringify(fromParams);
        }

        return payload;
      },
      logStateChange = function (event, toState, toParams, fromState, fromParams) {
        return miLogger.logAction('stateChange', prepStateChangePayload(event, toState, toParams, fromState, fromParams));
      },
      logStateChangeError = function (event, toState, toParams, fromState, fromParams, error) {
        return miLogger.logAction('error', {'type': 'stateChange', 'details': prepStateChangePayload(event, toState, toParams, fromState, fromParams, error)});
      },
      logStateNotFound = function (event, unfoundState, fromState) {
        angular.noop(event);
        return miLogger.logAction('error', {'type': 'stateNotFound', 'details': { 'toState': unfoundState.to, 'fromState': fromState.name}});
      };

    $rootScope.$on('$stateChangeSuccess', logStateChange);
    $rootScope.$on('$routeChangeSuccess', logStateChange);
    $rootScope.$on('$routeChangeError', logStateChangeError);
    $rootScope.$on('$stateChangeError', logStateChangeError);
    $rootScope.$on('$stateNotFound', logStateNotFound);
    /**
     * bread and butter of service: trigger event name, and payload, and register optional callback

     * @param  {string}   eventName
     * @param  {object}   eventPayload
     * @param  {Function} callback (optional)
     * @return {promise} returns value of logActions as $q.when wrapped promise so you can handle your own
     *                   (assumed to be a promise) otherwise, returns own promise
     */
    miLogger.logAction = function (eventName, eventPayload, callback) {
      var dfd,
        callbackWrapper = function (error, success) {
          // keen js wants to run callbacks synchronously, in which case dfd won't be defined yet: cover that here
          if (!dfd) {
            dfd = $q.defer();
          }
          if (callback) {
            return callback(error, success);
          }
          if (error) {
            dfd.reject(error);
          }
          dfd.resolve(success);
          return dfd.promise;
        };
      if (angular.isObject(eventPayload)) {
        angular.extend(eventPayload, defaultPayload);
      }
      if (!callback) {
        if (angular.isFunction(logAction)) {
          dfd = logAction(eventName, eventPayload, callbackWrapper);
        } else if (angular.isFunction(logService[logAction])) {
          dfd = logService[logAction](eventName, eventPayload, callbackWrapper);
        }
        return new Error(logAction + " is not a method on the log service provided: please correct configuration");
      }
      // user's registered logAction must have returned a promise, or something we'll wrap in a promise.
      if (dfd) {
        // neat: http://stackoverflow.com/questions/22546007/how-can-i-tell-if-an-object-is-an-angular-q-promise#answer-22546086
        return $q.when(dfd);
      }
      dfd = $q.defer();
      return dfd.promise;

    };
    /**
     * must set a function definition which does your posting
     * if method requires object ('this' context), provide string name of method
     * on newLogService to be called for logging action
     * if method standalone (like $http.post), function definition will suffice
     *
     * @newLogAction (function || string) takes 2 params:
     *           @eventName (string) whatever you want to call your event
     *           @payload   (object) whatever you want to send
     * @newLogService (object) object which has method @newLogAction, if needed
     */
    miLogger.setLogAction = function (newLogAction, newLogService) {
      if (!angular.isFunction(newLogAction) && !newLogService) {
        return new Error('must provide function for calling on logging action');
      }
      if (angular.isString(newLogAction) && !newLogService[newLogAction]) {
        return new Error('must provide an object && method name on object for calling on logging actions');
      }
      logAction = newLogAction;
      logService = newLogService;
    };
    /**
     * set default payload to be included in every logAction (e.g. userId, or time)
     * any matching keys in object in logAction request will get clobbered by defaults
     *
     * @param {object} payload with unique keys to be merged with each payload
     */
    miLogger.setDefaultPayload = function (payload) {
      defaultPayload = payload;
    };

    return miLogger;
  }],
    /**
     * Catch and report when a mobile app is opened with a URL scheme (https://github.com/EddyVerbruggen/Custom-URL-scheme)
     */
    openUrlListenerService = ['miLogger', function (miLogger) {
      var openUrlListener = {},
        actionDescription,
        openUrl = function (url) {
          if (url) {
            if (url.toLowerCase().indexOf('sms') > -1) {
              actionDescription = 'via SMS';
            } else if (url.toLowerCase().indexOf('email') > -1) {
              actionDescription = 'via Email';
            } else {
              actionDescription = 'Manually';
            }
            miLogger.logAction('launch', {
              'description': actionDescription
            });
            window.cordova.removeDocumentEventHandler('handleopenurl');
            window.cordova.addStickyDocumentEventHandler('handleopenurl');
            document.removeEventListener('handleopenurl', openUrlListener.handleOpenUrl);
            openUrlListener.urlHandled = true;
          }
        };
      openUrlListener.handleOpenUrl = function (e) {
        openUrl(e.url);
      };

      openUrlListener.onResume = function () {
        document.addEventListener('handleopenurl', openUrlListener.handleOpenUrl, false);
        setTimeout(function () {
          // if handleopenurl callback hasn't been fired 10 sec after resume, log that the app was opened manually
          if (!openUrlListener.urlHandled) {
            miLogger.logAction('launch', {
              'description': 'Manual Resume'
            });
          }
        }, 10000);
      };

      return openUrlListener;

    }],
    /**
     * Works with above service to report when mobile app is launched
     */
    openUrlRunBlock = ['openUrlListener', 'miLogger', function (openUrlListener, miLogger) {
      if (openUrlListener) {
        openUrlListener.urlHandled = false;
        document.addEventListener('handleopenurl', openUrlListener.handleOpenUrl, false);
        document.addEventListener('resume', openUrlListener.onResume, false);
        // if handleopenurl callback hasn't been fired after 10 sec, log that the app was opened manually
        setTimeout(function () {
          if (!openUrlListener.urlHandled) {
            miLogger.logAction('launch', {
              'description': 'Manual Open'
            });
          }
        }, 10000);

      }
    }],
    /**
     * Catch and report bad http responses
     */
    miLoggerHttpInterceptor = ['$httpProvider', function ($httpProvider) {
      $httpProvider.interceptors.push(['miLogger', '$q', function (miLogger, $q) {
        return {
          'responseError': function (response) {
            miLogger.logAction('error', {
              'description': 'API Error',
              'details': response
            });
            return $q.reject(response);
          }
        };
      }]);
    }],
    /**
     * Catch and report exceptions thrown by angular
     */
    exceptionHandlerService = ['$injector', function ($injector) {
      return function (exception, cause) {
        var miLogger = $injector.get('miLogger');
        if (cause) {
          exception.message += ' (caused by "' + cause + '")';
        }
        miLogger.logAction('error', {
          'description': 'Javascript',
          'details': {
            'name': exception.name,
            'message': exception.message,
            'stack': exception.stack
          }
        });
        throw exception;
      };
    }],
    /**
     * A handy directive for logging click actions
     */
    miLogClickDirective = ['miLogger', function (miLogger) {
    return {
      restrict: 'A',
      link: function (scope, iElm, iAttrs) {
        // would prefer to have used something tied in with ng-click, but using controllerAs
        // made it difficult to call prev registered click events
        iElm.bind('click', function () {
          var payload = {'description': iAttrs.miLogClick};
          if (iAttrs.miLogData) {
            if (iAttrs.miLogData.indexOf('\'') > -1) { /// replace any '' with "" so JSON.parse doesn't bomb out
              iAttrs.miLogData = iAttrs.miLogData.replace(/'/g, '\"');
            }
            payload.details = JSON.parse(iAttrs.miLogData); /// put details on if it's there
          }
          miLogger.logAction('click', payload);
        });
        // clean up after ourselves. not catching $ionicView events here, for some reason
        scope.$on('$stateChangeStart', function () {
          iElm.unbind('click');
        });
        // may as well support ngRoute too
        scope.$on('$routeChangeStart', function () {
          iElm.unbind('click');
        });
      }
    };
  }];


  angular.module('miAnalytics', [])
    .config(miLoggerHttpInterceptor)
    .service('$exceptionHandler', exceptionHandlerService)
    .service('miLogger', miLoggerService)
    .service('openUrlListener', openUrlListenerService)
    .directive('miLogClick', miLogClickDirective)
    .run(openUrlRunBlock);
}());
