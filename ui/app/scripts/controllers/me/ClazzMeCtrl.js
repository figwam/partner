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
    $http.get('/clazzes/trainees/me?p='+(pageNumber-1)+'&s=1&f='+($rootScope.clazzesSearchString == null ? '':$rootScope.clazzesSearchString))
      .then(function(result) {
        $rootScope.clazzes = result.data
        $scope.totalClazzes = result.data.total
      });
  }

  $scope.book = function(idClazz) {
    var body={"idClazz":idClazz};
    $http({
      method: "POST",
      url: "/trainees/me/registrations",
      data: body,
      headers: { 'Content-Type': 'application/json; charset=UTF-8'},
      cache: $templateCache}).
      then(function(response) {
        $scope.status = response.status;
        $scope.data = response.data;
        getResultsPage($scope.pagination.current)
        AlertFactory.addAlert("jdsgkfdakhjfgslk","success")
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
      });
  };

  $scope.bookDelete = function(idRegistration) {
    $http({
      method: "DELETE",
      url: "/trainees/me/registrations/"+idRegistration,
      cache: $templateCache}).
      then(function(response) {
        $scope.status = response.status;
        $scope.data = response.data;
        getResultsPage($scope.pagination.current)
        AlertFactory.addAlert("jdsgkfdakhjfgslk","danger")
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
      });
  };


  $scope.submitSearch = function(idTrainee){
    $rootScope.clazzesSearchString = $scope.searchString
    if ($state.current.name != 'me.clazzes') $state.go('me.clazzes')
    getResultsPage(1);
  };
}]);



app.filter('searchFor', function(){
  return function(arr, searchString){
    if(!searchString){
      return arr;
    }
    var result = [];
    searchString = searchString.toLowerCase();
    angular.forEach(arr, function(item){
      if(item.searchMeta.toLowerCase().indexOf(searchString) !== -1){
        result.push(item);
      }
    });
    return result;
  };
});
