function Conversation($scope, date){
	Model.folders.systemFolders.forEach(function(folderName){
		Model.folders[folderName].on('mails.change', function(e){
			$scope.$apply(folderName);
			$scope.$apply('newItem');
		});
	});

	$scope.resetScope = function(){
		$scope.openInbox();
	};

	$scope.viewsContainers = {};
	$scope.openView = function(view, name){
		$scope.newItem = {};
		$scope.selection.selectAll = false;
		var viewsPath = '/conversation/public/template/';
		$scope.viewsContainers[name] = viewsPath + view + '.html';
	};

	$scope.containsView = function(name, view){
		var viewsPath = '/conversation/public/template/';
		return $scope.viewsContainers[name] === viewsPath + view + '.html';
	};

	$scope.openFolder = function(folderName){
		Model.folders.openFolder(folderName);
		$scope.openView(folderName, 'main');
	};

	$scope.nextPage = function(){
		Model.folders.current.nextPage();
	}

	$scope.selection = {
		selectAll: false
	};

	$scope.switchSelectAll = function(){
		if($scope.selection.selectAll){
			Model.folders.current.mails.selectAll();
		}
		else{
			Model.folders.current.mails.deselectAll();
		}
	};

	$scope.viewMail = function(mail){
		$scope.openView('view-mail', 'main');
		Model.folders.current.mails.current = mail;
		mail.open();
	};

	$scope.editDraft = function(draft){
		$scope.openView('write-mail', 'main');
		draft.open();
		$scope.newItem = draft;
	};

	$scope.saveDraft = function(){
		Model.folders.draft.saveDraft($scope.newItem);
	};

	$scope.sendMail = function(){

	};

	$scope.removeSelection = function(){

	};

	$scope.inbox = Model.folders.inbox;
	$scope.outbox = Model.folders.outbox;
	$scope.draft = Model.folders.draft;
	$scope.trash = Model.folders.trash;

	$scope.newItem = {};

	$scope.openView('inbox', 'main');
}