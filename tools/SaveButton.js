
var SaveButton=Function.extend(ToolButton, function () {
	var _=this(SaveButton);
	SaveButton=_[SaveButton];
	function SaveButton() {
		_['base'].apply(this, ['save', 'save', 'Save']);
	}

	_['public'].Execute=function (actions) {
		actions.Save();
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy||String(context.SaveState)!=='idle';
	};
});
