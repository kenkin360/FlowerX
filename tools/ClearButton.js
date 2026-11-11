
var ClearButton=Function.extend(ToolButton, function () {
	var _=this(ClearButton);
	ClearButton=_[ClearButton];
	function ClearButton() {
		_['base'].apply(this, ['clear', 'delete', 'Clear Canvas']);
	}

	_['public'].Execute=function (actions) {
		actions.ExecuteCanvasCommand('Clear');
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy;
	};
});
