
var CopyButton=Function.extend(ToolButton, function () {
	var _=this(CopyButton);
	CopyButton=_[CopyButton];
	function CopyButton() {
		_['base'].apply(this, ['copy', 'content_copy', 'Copy (\u2318C)']);
	}

	_['public'].Execute=function (actions) {
		actions.ExecuteCanvasCommand('Copy');
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy;
	};
});
