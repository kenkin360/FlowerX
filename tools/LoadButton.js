
var LoadButton=Function.extend(ToolButton, function () {
	var _=this(LoadButton);
	LoadButton=_[LoadButton];
	function LoadButton() {
		_['base'].apply(this, ['load', 'folder_open', 'Load image from this device']);
	}

	_['public'].Execute=function (actions) {
		actions.Load();
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy;
	};
});
