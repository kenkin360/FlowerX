
var RedoButton=Function.extend(ToolButton, function () {
	var _=this(RedoButton);
	RedoButton=_[RedoButton];
	function RedoButton() {
		_['base'].apply(this, ['redo', 'redo', 'Redo (\u2318\u21E7Z)']);
	}

	_['public'].Execute=function (actions) {
		actions.ExecuteCanvasCommand('Redo');
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy;
	};
});
