'use strict';

/*global app: false */

/**
 * The clazz controller.
 *
 */
app.controller('ClazzDefCtrl', ['$rootScope', '$state', '$scope', '$http', '$templateCache', 'AlertFactory', '$filter', function($rootScope, $state, $scope, $http, $templateCache, AlertFactory, $filter) {


  $scope.totalClazzes = 0;
  $scope.clazzesPerPage = 10;
  $scope.data = {}
  getResultsPage(1)
  $scope.pagination = {
    current: 1
  };

  $scope.pageChanged = function(newPage) {
    getResultsPage(newPage);
  };

  function getResultsPage(pageNumber) {
    //play start paging from 0 --> (pageNumber-1)
    $http.get('/clazzes/partners/me?p='+(pageNumber-1)+'&s=1&f='+($rootScope.clazzesSearchString == null ? '':$rootScope.clazzesSearchString))
      .then(function(result) {
        $rootScope.clazzes = result.data
        $scope.totalClazzes = result.data.total
      });
  }

  $scope.onTimeStartSet = function (newDate, oldDate) {
    $scope.data.dateStart = $filter('date')(newDate, "EEE, dd.MM.yyyy hh:mm");
  }

  $scope.onTimeEndSet = function (newDate, oldDate) {
    if ($scope.data.dateStart < $scope.data.dateEnd) {
      $scope.data.dateEnd = $scope.data.dateStart
    }
    console.log($scope.data.dateStart)
    console.log($scope.data.dateEnd)
    $scope.data.dateEnd = $filter('date')(newDate, "EEE, dd.MM.yyyy hh:mm");
  }

  $scope.beforeRenderStart = function ($view, $dates, $leftDate, $upDate, $rightDate) {
    var currentDate = new Date();

    var yearViewDate = new Date(currentDate.getFullYear(), 0);
    var yearViewDateValue = yearViewDate.getTime();

    var monthViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth());
    var monthViewDateValue = monthViewDate.getTime();

    var dayViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    var dayViewDateValue = dayViewDate.getTime();

    var hourViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours());
    var hourViewDateValue = hourViewDate.getTime();

    var minuteViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes());
    var minuteViewDateValue = minuteViewDate.getTime();

    for (var index = 0; index < $dates.length; index++) {

      var date = $dates[index];

      // Disable if it's in the past
      var dateValue = date.localDateValue();
      switch ($view) {

        case 'year':
          if (dateValue < yearViewDateValue) {
            date.selectable = false;
          }
          break;

        case 'month':
          if (dateValue < monthViewDateValue) {
            date.selectable = false;
          }
          break;

        case 'day':
          if (dateValue < dayViewDateValue) {
            date.selectable = false;
          }
          break;

        case 'hour':
          if (dateValue < hourViewDateValue) {
            date.selectable = false;
          }
          break;

        case 'minute':
          if (dateValue < minuteViewDateValue) {
            date.selectable = false;
          }
          break;
      }
    }
  }


  $scope.beforeRenderEnd = function ($view, $dates, $leftDate, $upDate, $rightDate, selectedDate) {
    $scope.beforeRenderStart($view, $dates, $leftDate, $upDate, $rightDate)
    var currentDate = new Date();
    var hourViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours());
    var hourViewDateValue = hourViewDate.getTime();

    var minuteViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes());
    var minuteViewDateValue = minuteViewDate.getTime();

    for (var index = 0; index < $dates.length; index++) {

      var date = $dates[index];

      // Disable if it's in the past
      var dateValue = date.localDateValue();
      switch ($view) {

        case 'hour':
          if (dateValue < hourViewDateValue) {
            date.selectable = false;
          }
          break;

        case 'minute':
          if (dateValue < minuteViewDateValue) {
            date.selectable = false;
          }
          break;
      }
    }
  }

}]);

