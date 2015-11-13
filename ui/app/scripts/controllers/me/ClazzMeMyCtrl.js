'use strict';

/*global app: false */

/**
 * The clazz controller.
 *
 */
app.controller('ClazzMeCtrl', ['$rootScope', '$state', '$scope', '$http', '$templateCache', 'AlertFactory', function($rootScope, $state, $scope, $http, $templateCache, AlertFactory) {


  $scope.totalClazzes = 0;
  $scope.clazzesPerPage = 10;
  getResultsPage(1)
  $scope.pagination = {
    current: 1
  };

  $scope.pageChanged = function(newPage) {
    getResultsPage(newPage);
  };

  function getResultsPage(pageNumber) {
    //play start paging from 0 --> (pageNumber-1)
    $http.get('/trainees/me/clazzes?p='+(pageNumber-1)+'&s=1&f='+($rootScope.clazzesSearchString == null ? '':$rootScope.clazzesSearchString))
      .then(function(result) {
        $rootScope.clazzes = result.data
        $scope.totalClazzes = result.data.total
      });
  }

}]);

