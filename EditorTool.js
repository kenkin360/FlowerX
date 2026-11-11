
var EditorTool=Function.extend(ToolButton, function () {
	var _=this(EditorTool);
	EditorTool=_[EditorTool];
	function EditorTool(key, icon, title, shortcut) {
		_['base'].apply(this, arguments);
		this.HasBrushSize=false;
		this.HasColor=false;
		this.HasProportionConstraint=false;
		this.HasSprayMode=false;
		this.ShowsColorIndicator=false;
		this.ShowsColor=false;
	}

	_['public'].Execute=function (actions) {
		if ((actions)&&(typeof actions.SelectTool==='function')) {
			actions.SelectTool(this);
		}
	};

	_['public'].IsDisabled=function (context) {
		if ((context)&&(context.IsCanvasBusy)&&(!(this.Id==='bezier'&&String(context.Tool)==='bezier'))) {
			return true;
		}
		return false;
	};

	_['public'].OnActivate=function (canvasContext) {
	};

	_['public'].OnDeactivate=function (canvasContext) {
	};

	_['public'].OnPropertiesUpdate=function (canvasContext, props) {
	};

	_['public'].OnMouseDown=function (canvasContext, event) {
	};

	_['public'].OnMouseMove=function (canvasContext, event) {
	};

	_['public'].OnMouseUp=function (canvasContext, event) {
	};

	_['public'].OnMouseUpCanvas=function (canvasContext) {
	};

	_['public'].Cancel=function (canvasContext) {
	};

	_['public'].IsBusy=function () {
		return false;
	};
	_['public'].HasBrushSize=false;
	_['public'].HasColor=false;
	_['public'].HasProportionConstraint=false;
	_['public'].HasSprayMode=false;
	_['public'].ShowsColorIndicator=false;
	_['public'].ShowsColor=false;
});
