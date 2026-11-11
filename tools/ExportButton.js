
var ExportButton=Function.extend(ToolButton, function () {
	var _=this(ExportButton);
	ExportButton=_[ExportButton];
	function ExportButton() {
		_['base'].apply(this, ['export', 'file_download', 'Export source URLs']);
	}

	_['public'].Execute=function (actions) {
		actions.ExportJSON();
	};

	_['public'].IsDisabled=function (context) {
		return!!context.IsCanvasBusy;
	};
});
