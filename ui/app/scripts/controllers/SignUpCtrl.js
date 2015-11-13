'use strict';

/*global app: false */

/**
 * The sign up controller.
 */
app.controller('SignUpCtrl', ['$scope', '$auth', '$location', '$state', function($scope, $auth, $location, $state) {

  /**
   * The submit method.
   */
  $scope.submit = function() {
    $auth.signup({
      firstname: $scope.formData.firstname,
      lastname: $scope.formData.lastname,
      street: $scope.formData.street,
      plz: $scope.formData.plz,
      zip: $scope.formData.zip,
      city: $scope.formData.city,
      state: "None",
      email: $scope.formData.email,
      password: $scope.formData.password,
      aboId: $scope.formData.aboId
    }).then(function() {
      /*DO AUTOLOGIN AFTER SIGN UP*/
      $auth.login({ email: $scope.formData.email, password: $scope.formData.password, rememberMe: true })
        .then(function() {
          $location.path("/me")
        })
    }).catch(function(response) {
      $scope.errorMessage = {};
      angular.forEach(response.data.message, function(message, field) {
        console.log(response.data.message)
        // response.data.message -> Message ist partner.exists oder invalid.data
        // example {"message":"invalid.data","detail":{"obj.zip":[{"msg":["error.invalid"],"args":[]}]}}
        if (response.data.message == 'invalid.data') {
          if (response.data.detail.hasOwnProperty('obj.firstname')) {
            $scope.form.firstname.$setValidity(response.data.message, false);
          }
          if (response.data.detail.hasOwnProperty('obj.lastname')) {
            $scope.form.lastname.$setValidity(response.data.message, false);
          }
          if (response.data.detail.hasOwnProperty('obj.email')) {
            $scope.form.email.$setValidity(response.data.message, false);
          }
          if (response.data.detail.hasOwnProperty('obj.password')) {
            $scope.form.password.$setValidity(response.data.message, false);
          }
          if (response.data.detail.hasOwnProperty('obj.street')) {
            $scope.form.street.$setValidity(response.data.message, false);
          }
          if (response.data.detail.hasOwnProperty('obj.zip')) {
            $scope.form.zip.$setValidity(response.data.message, false);
          }
        } else {
          // partner.exists case or others
          $scope.form.email.$setValidity(response.data.message, false);
        }
      });
    });
  };

  // calling our submit function.
  $scope.submitOfferRedirect = function (selectedOfferName, selectedOfferId) {
    $scope.formData.aboId = selectedOfferId
    $scope.formData.aboName = selectedOfferName
    $location.hash('home');
    $anchorScroll();
    $state.go('home.signUp.profile')
  };

  /*
  $scope.checkValidity = function (fieldValue, callback) {

    $http.post('/yourUrl', { data: fieldValue }).success(function (res) {
      return callback(res);
    });
  };
  */


}]);

app.directive('checker', function () {
  //http://stackoverflow.com/questions/16841587/angularjs-validity-not-reset-once-setvalidity-called
  //http://stackoverflow.com/questions/23011819/angularjs-setvalidity-not-working-while-checking-for-email-uniqueness
  return {
    restrict: 'A',
    scope: {
      checkValidity: '=checkValidity' // isolate directive's scope and inherit only checking function from parent's one
    },
    require: 'ngModel', // controller to be passed into directive linking function
    link: function (scope, elem, attr, ctrl) {
      //var email = elem.attr('name');

      // check validity on field blur
      elem.bind('blur keyup, input', function () {
        ctrl.$setValidity('partner.exists', true);
        ctrl.$setValidity('invalid.data', true);
        /*
        scope.checkValidity(elem.val(), function (res) {
          if (res.valid) {
            ctrl.$setValidity(email, true);
          } else {
            ctrl.$setValidity(email, false);
          }
        });
        */
      });

      // set "valid" by default on typing
      /*elem.bind('keyup', function () {
        ctrl.$setValidity('partner.exists', true);
      });*/
    }
  };
});
