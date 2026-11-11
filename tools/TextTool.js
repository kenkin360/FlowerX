
var TextTool=Function.extend(EditorTool, function () {
	var _=this(TextTool);
	TextTool=_[TextTool];
	function TextTool() {
		_['base'].apply(this, ['text', 'title', 'Text (T)', 't']);
		this.HasBrushSize=false;
		this.HasColor=false;
	}

	_['public'].OnActivate=function (ctx) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) return;
		canvas.isDrawingMode=false;
		canvas.defaultCursor='text';
	};

	_['public'].OnMouseDown=function (ctx, option) {
		let canvas=ctx.Surface.Canvas;
		if ((!canvas)||(canvas.getActiveObject())) return;
		let point=ctx.Surface.GetVirtualPointer(option);
		let text=new fabric.IText('Type something', {
			left: point.x
			, top: point.y
			, fontFamily: 'Google Sans Text'
			, fontSize: 32
			, fill: String(ctx.Color||'#FFFFFF')
			, selectable: true
			, evented: true
			, originX: 'left'
			, originY: 'top'
		});
		canvas.add(text);
		canvas.setActiveObject(text);
		text.enterEditing();
		ctx.Document.SaveHistory();
		ctx.Document.CheckEmpty();
		ctx.Document.NotifyInteraction();
	};
});
