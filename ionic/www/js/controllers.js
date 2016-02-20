angular.module('aurora.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('SettingsCtrl', function($scope, $localstorage, $ionicPopover) {
	//Initialize values
	$scope.settingblock = {
		locAlertOn: true,
		locKPAlert: 3,
		locDayNot: false,
		locWeatherNot: false,
		aSAlertOn: false,
		aSKPAlert: 7,
		aSDayNot: false,
		aSWeatherNot: false,
		gpsUse: true,
		locationZip: 99701
	};
	
	$ionicPopover.fromTemplateUrl('popover-lkpa.html', {
		scope: $scope,
	}).then(function(popover) {
		$scope.popover = popover;
	});
	
	//Load existing settings
	$scope.settingblock = $localstorage.getObject('settings');
	
	//Happens at program close. Goes elsewhere probably
	$scope.saveSettings = function()
	{
		$localstorage.setObject('settings', $scope.settingblock);
	}
})

.controller('AboutCtrl', function($scope) {})

.controller('AllskyCtrl', function($scope) {});