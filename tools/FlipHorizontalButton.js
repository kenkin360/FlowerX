
var FlipHorizontalButton=Function.extend(ToolButton, function () {
	var _=this(FlipHorizontalButton);
	FlipHorizontalButton=_[FlipHorizontalButton];
	function FlipHorizontalButton() {
		_['base'].apply(this, ['flip-horizontal', 'swap_horiz', 'Horizontal Flip']);
	}

	_['public'].Execute=function (actions) {
		actions.ExecuteCanvasCommand('FlipHorizontal');
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy;
	};
});
