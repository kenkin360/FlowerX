
var LineTool=Function.extend(EditorTool, function () {
	var _=this(LineTool);
	LineTool=_[LineTool];
	function LineTool() {
		_['base'].apply(this, ['line', 'straighten', 'Line (L)', 'l']);
		this.HasBrushSize=true;
		this.HasColor=true;
		_(this).m_currentLine=null;
		_(this).m_isDragging=false;
	}

	_['public'].OnActivate=function (ctx) {
		let canvas=ctx.Surface.Canvas;
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

	_['public'].OnDeactivate=function (ctx) {
		this.Cancel(ctx);
	};

	_['public'].OnMouseDown=function (ctx, option) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) return;
		let point=ctx.Surface.GetVirtualPointer(option);
		let line=new fabric.Line([point.x, point.y, point.x, point.y], {
			stroke: String(ctx.Color||'#FF0000')
			, strokeWidth: ctx.BrushSize||8
			, strokeLineCap: 'round'
			, selectable: false
			, evented: false
			, perPixelTargetFind: true
		});
		_(this).m_currentLine=line;
		_(this).m_isDragging=true;
		canvas.add(line);
		ctx.NotifyBusyChange(true);
	};

	_['public'].OnMouseMove=function (ctx, event) {
		if ((!_(this).m_isDragging)||(!_(this).m_currentLine)) return;
		let point=ctx.Surface.GetVirtualPointer(event);
		_(this).m_currentLine.set({x2: point.x, y2: point.y});
		ctx.Surface.Canvas.renderAll();
	};

	_['public'].OnMouseUp=function (ctx, event) {
		if (!_(this).m_isDragging) return;
		_(this).m_isDragging=false;
		let line=_(this).m_currentLine;
		if (line) {
			line.set({selectable: false, evented: false, perPixelTargetFind: true});
			line.setCoords();
			_(this).m_currentLine=null;
			ctx.Surface.Canvas.renderAll();
			ctx.Document.SaveHistory();
			ctx.Document.CheckEmpty();
		}
		ctx.NotifyBusyChange(false);
	};

	_['public'].Cancel=function (ctx) {
		let line=_(this).m_currentLine;
		let canvas=ctx?.Surface?.Canvas;
		if ((line)&&(canvas)) {
			canvas.remove(line);
			canvas.renderAll();
		}
		_(this).m_currentLine=null;
		_(this).m_isDragging=false;
		if (ctx) ctx.NotifyBusyChange(false);
	};

	_['public'].IsBusy=function () {
		return _(this).m_isDragging;
	};
	_['private'].m_currentLine=null;
	_['private'].m_isDragging=false;
});
