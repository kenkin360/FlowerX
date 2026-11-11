
var FillTool=Function.extend(EditorTool, function () {
	var _=this(FillTool);
	FillTool=_[FillTool];
	function FillTool() {
		_['base'].apply(this, ['fill', 'format_color_fill', 'Fill (F)', 'f']);
		this.HasBrushSize=false;
		this.HasColor=true;
		this.ShowsColorIndicator=true;
		this.ShowsColor=true;
	}

	_['public'].OnActivate=function (ctx) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) return;
		canvas.isDrawingMode=false;
		canvas.defaultCursor='crosshair';
	};

	_['public'].OnMouseDown=function (ctx, option) {
		let point=ctx.Surface.GetVirtualPointer(option);
		if (ctx.FloodFill) {
			ctx.FloodFill.Execute(point.x, point.y, ctx.Color);
		}
	};
});
