
var EyedropperTool=Function.extend(EditorTool, function () {
	var _=this(EyedropperTool);
	EyedropperTool=_[EyedropperTool];
	function EyedropperTool() {
		_['base'].apply(this, ['eyedropper', 'colorize', 'Eyedropper (I)', 'i']);
		this.HasBrushSize=false;
		this.HasColor=false;
		this.ShowsColorIndicator=true;
		this.ShowsColor=true;
	}

	_['public'].OnActivate=function (ctx) {
		let canvas=ctx.Surface?.Canvas;
		if (!canvas) return;
		canvas.isDrawingMode=false;
		canvas.selection=false;
		canvas.skipTargetFind=true;
		canvas.defaultCursor='crosshair';
		canvas.discardActiveObject();
		canvas.forEachObject(function (object) {
			if (!object.isUI) {
				object.selectable=false;
				object.evented=false;
			}
		});
		canvas.requestRenderAll();
	};

	_['public'].OnMouseDown=function (ctx, option) {
		let nativeEvent=option.e||option;
		let clientX=nativeEvent.clientX;
		let clientY=nativeEvent.clientY;
		if ((typeof clientX==='number')&&(typeof clientY==='number')) {
			let hexColor=ctx.Surface.SampleColorAtClientPos(clientX, clientY);
			if (hexColor) {
				ctx.UpdateColor(new Color(hexColor));
			}
		}
	};
});
