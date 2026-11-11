
var PencilTool=Function.extend(EditorTool, function () {
	var _=this(PencilTool);
	PencilTool=_[PencilTool];
	function PencilTool() {
		_['base'].apply(this, ['pencil', 'edit', 'Pencil (D)', 'd']);
		this.HasBrushSize=true;
		this.HasColor=true;
		this.ShowsColorIndicator=true;
		this.ShowsColor=true;
	}

	_['public'].OnActivate=function (ctx) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) return;
		canvas.isDrawingMode=true;
		canvas.selection=false;
		canvas.skipTargetFind=true;
		canvas.discardActiveObject();
		canvas.forEachObject(function (object) {
			if (!object.isUI) {
				object.selectable=false;
				object.evented=false;
			}
		});
		let brush=new fabric.PencilBrush(canvas);
		brush.width=ctx.BrushSize||8;
		brush.color=String(ctx.Color||'#FF0000');
		canvas.freeDrawingBrush=brush;
		canvas.defaultCursor='crosshair';
		canvas.requestRenderAll();
	};

	_['public'].OnDeactivate=function (ctx) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) return;
		canvas.isDrawingMode=false;
	};

	_['public'].OnPropertiesUpdate=function (ctx, props) {
		let canvas=ctx.Surface.Canvas;
		if ((!canvas)||(!canvas.freeDrawingBrush)) return;
		canvas.freeDrawingBrush.width=props.BrushSize;
		canvas.freeDrawingBrush.color=String(props.Color);
	};

	_['public'].OnMouseUpCanvas=function (ctx) {
		ctx.Document.SaveHistory();
		ctx.Document.CheckEmpty();
	};
});
