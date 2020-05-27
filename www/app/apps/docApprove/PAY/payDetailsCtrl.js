/*
Created by User on 27/05/2020.
*/
angular.module('pele')
  .controller('payDetailsCtrl', ['$scope', '$location', 'ApiService', '$ionicScrollDelegate', '$stateParams', '$ionicLoading', '$ionicModal', 'PelApi', '$ionicHistory', '$ionicPopup', '$cordovaFileTransfer',
    function($scope, $location, ApiService, $ionicScrollDelegate, $stateParams, $ionicLoading, $ionicModal, PelApi, $ionicHistory, $ionicPopup, $cordovaFileTransfer) {
      $scope.actionNote = {};

      $scope.formData = {
        subject: "",
        forwardUserName: ""
      }
  
      $scope.appId = $stateParams.AppId;

      $scope.activeGroup = PelApi.sessionStorage.activeAccordionGroup;

      $scope.toggleActive = function(g) {
        $scope.activeGroup === g.VENDOR_NAME ? $scope.activeGroup = "" : $scope.activeGroup = g.VENDOR_NAME;
        PelApi.sessionStorage.activeAccordionGroup = $scope.activeGroup;
      }

      $scope.toggleActionItem = function(action) {
        action.display = !action.display;
        if (action.display) action.left_icon = 'ion-chevron-down';
        else action.left_icon = 'ion-chevron-left';
      }

      $scope.toggleInvoicesShown = function(supplierIndScroll) {
        $location.hash(supplierIndScroll.VENDOR_NAME);
        $ionicScrollDelegate.anchorScroll();
      }

      $scope.onSlideMove = function(data) {
        //alert("You have selected " + data.index + " tab");
      };      

      $scope.tabs = [{
        "text": "סבב מאשרים"
      }, {
        "text": "פרטי הצוואה"
      }];

      $scope.notifLinks = PelApi.getDocApproveServiceUrl("SubmitNotif");

      $scope.getData = function() {
        PelApi.showLoading({
          noBackdrop: true
        });

        PelApi.deleteAttachDirecoty();

        var links = PelApi.getDocApproveServiceUrl("GetUserNotifNew");
        var retGetUserNotifications = PelApi.GetUserNotifications(links, $scope.appId, $stateParams.docId, $stateParams.docInitId);
        retGetUserNotifications.success(function(data) {
          var apiData = PelApi.checkApiResponse(data);

          if (apiData.error) return false;          
          $scope.docDetails = PelApi.getJsonString(apiData.Result, "JSON[0]", true);
          $scope.suppliers  = $scope.docDetails.SUPPLIERS || [];
          $scope.activeGroup = "";
          $scope.chatSubjects = $scope.docDetails.CHAT_SUBJECTS || [];
          $scope.chatPersons = $scope.docDetails.CHAT_PERSONS || [];
          PelApi.extendActionHistory($scope.docDetails);
          $scope.buttonsArr = $scope.docDetails.BUTTONS || [];  
          

        }).error(function(error, httpStatus, headers, config) {
          var time = config.responseTimestamp - config.requestTimestamp;
          var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
          PelApi.throwError("api", "GetUserNotifNew", "httpStatus : " + httpStatus + tr)
        }).finally(function() {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        });
      };
      
      $scope.submitUpdateInfo = function() {
        PelApi.showLoading();

        PelApi.SubmitNotification($scope.notifLinks, $scope.appId, $scope.docDetails.NOTIFICATION_ID, '', 'APPROVE')
          .success(function(data) {
            var apiData = PelApi.checkApiResponse(data);
            if (apiData.error) return false;
            $ionicHistory.goBack();
          }).error(
            function(error, httpStatus, headers, config) {
              var time = config.responseTimestamp - config.requestTimestamp;
              var tr = ' (TS  : ' + (time / 1000) + ' seconds)';
              PelApi.throwError("api", "SubmitNotif", "httpStatus : " + httpStatus + tr)
            }).finally(function() {
            $ionicLoading.hide();
            $scope.$broadcast('scroll.refreshComplete');
          });
      };

      $scope.sendQuestion = function (formQuestion) {

        PelApi.showLoading();
         
        ApiService.post("SendChat", $scope.docDetails.appId, {
          p1: $scope.docDetails.RECIPIENT_ROLE,
          p2: formQuestion.forwardUserName,
          p3: 'DOC',
          p4: formQuestion.subject,
          p5: formQuestion.text,
          p6: $scope.docDetails.DOC_INIT_ID
        })
        .success(function (data, status, headers, config) {
          var result = ApiService.checkResponse(data, status, config)
          $ionicHistory.goBack();
        })
        .error(function(errorStr, httpStatus, headers, config) {
          ApiService.checkResponse({
            error: errorStr
          }, httpStatus, config);
          
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
        });   
    };

    $scope.displayChatQuesNew = function() {
      PelApi.displayChatQuesNew($scope);
    }

    $scope.getData();

  }
]);
