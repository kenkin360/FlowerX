
var PasteButton=Function.extend(ToolButton, function () {
	var _=this(PasteButton);
	PasteButton=_[PasteButton];
	function PasteButton() {
		_['base'].apply(this, ['paste', 'content_paste', 'Paste (\u2318V)']);
	}

	_['public'].Execute=function (actions) {
		actions.ExecuteCanvasCommand('Paste');
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy;
	};
});
