
var OpenButton=Function.extend(ToolButton, function () {
	var _=this(OpenButton);
	OpenButton=_[OpenButton];
	function OpenButton() {
		_['base'].apply(this, ['open', 'add_photo_alternate', 'Open image from Flow']);
	}

	_['public'].Execute=function (actions) {
		actions.Open();
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy;
	};
});
