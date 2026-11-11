
var UndoButton=Function.extend(ToolButton, function () {
	var _=this(UndoButton);
	UndoButton=_[UndoButton];
	function UndoButton() {
		_['base'].apply(this, ['undo', 'undo', 'Undo (\u2318Z)']);
	}

	_['public'].Execute=function (actions) {
		actions.ExecuteCanvasCommand('Undo');
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy;
	};
});
