# mi-analytics #
### A BYO analytics module for angular ###

* A module with services to capture and report angular exceptions, http errors, page/stae views, and a directive for user click events
* **alpha**

### Getting Started ###

1. run `bower install mi-analytcs`, or download the source code and include miAnalytics.js in your project
2. include the angular module in your app

```
#!javsacript
angular.module('myAwesomeApp', 'miAnalytics')
  .run(function(miLogger) {
    // configure function definition to be called with every logging action 
    miLogger.setLogAction(myLogActionDefinition);
    // configure an object and method name to be called with every logging action
    miLogger.setLogAction(
      'send', // name of method to call
      new MyLoggingService() // an object which has above named method to call with each logging action
    );
  });
```

* Congratulations! your above logging action will now automatically report all exceptions thrown by angular, http errors, and state changes with either ngRoute or ui-router

3. (optional) Use `mi-log-action` to register click events

```
#!html
<my-view>
  <input type="text" ng-model="name"/>
  <!-- log this button being clicked with the label 'form submit', include $scope.name in its payload -->
  <button mi-log-click="form submit" mi-log-data="{{name}}"/>
</my-view>
```

4. (optional) Use `miLogger.logAction` to log whatever you'd like

```
#!javascript
angular.module('myAwesomeApp')
  .controller(function ($scope, $location, $timeout, miLogger) {
    var cancelTimeout = function () {
      $timeout.cancel(longView)
    },
      pokeUser = function (error, success) {
        // if previous try didn't work, just try again after 5 seconds
        if (error) {
          $timeout(reportLongView, 5000);
        }
        //console.log('success logging action: ', success);
        window.alert("You're still here? It's over...go home...go..");
      };
      reportLongView = function () {
        miLogger.logAction('long view', {state: $location.state(), time: '30000'}, pokeUser);
      },
      longView = $timeout(reportLongView, 30000);

    $scope.$on('$stateChangeStart', cancelTimeout);
    // or ui-router: $scope.$on('$routeChangeStart');
  });

```

** Above example just waits 30 seconds to log a 'long view' event, with the payload {state: [stateName], time: 30000}, and then calls the callback pokeUser. If logAction fails, the callback pokeUser function receives an error and tries again in 5 seconds. Alternatively, if the function registered in `setLogAction` returns a callback, `logAction` will forward that promise.

5. Continuing that fearless sifting and winnowing by which alone better apps may be made.