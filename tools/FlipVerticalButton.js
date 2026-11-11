
var FlipVerticalButton=Function.extend(ToolButton, function () {
	var _=this(FlipVerticalButton);
	FlipVerticalButton=_[FlipVerticalButton];
	function FlipVerticalButton() {
		_['base'].apply(this, ['flip-vertical', 'swap_vert', 'Vertical Flip']);
	}

	_['public'].Execute=function (actions) {
		actions.ExecuteCanvasCommand('FlipVertical');
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy;
	};
});
