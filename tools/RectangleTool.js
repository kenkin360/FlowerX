
var RectangleTool=Function.extend(EditorTool, function () {
	var _=this(RectangleTool);
	RectangleTool=_[RectangleTool];
	function RectangleTool() {
		_['base'].apply(this, ['rectangle', 'rectangle', 'Rectangle (R)', 'r']);
		this.HasBrushSize=true;
		this.HasColor=true;
		this.HasProportionConstraint=true;
		_(this).m_currentRect=null;
		_(this).m_startPoint=null;
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
		let rect=new fabric.Rect({
			left: point.x
			, top: point.y
			, width: 0
			, height: 0
			, fill: 'transparent'
			, stroke: String(ctx.Color||'#FF0000')
			, strokeWidth: ctx.BrushSize||8
			, selectable: false
			, evented: false
			, perPixelTargetFind: true
			, originX: 'left'
			, originY: 'top'
		});
		_(this).m_startPoint=point;
		_(this).m_currentRect=rect;
		_(this).m_isDragging=true;
		canvas.add(rect);
		ctx.NotifyBusyChange(true);
	};

	_['public'].OnMouseMove=function (ctx, event) {
		if ((!_(this).m_isDragging)||(!_(this).m_currentRect)) return;
		let point=ctx.Surface.GetVirtualPointer(event);
		let start=_(this).m_startPoint;
		let width=Math.abs(start.x-point.x);
		let height=Math.abs(start.y-point.y);
		if (ctx.ConstrainProportions) {
			let side=Math.max(width, height);
			width=side;
			height=side;
		}
		_(this).m_currentRect.set({
			left: point.x>=start.x?start.x:start.x-width
			, top: point.y>=start.y?start.y:start.y-height,
			width,
			height
		});
		ctx.Surface.Canvas.renderAll();
	};

	_['public'].OnMouseUp=function (ctx, event) {
		if (!_(this).m_isDragging) return;
		_(this).m_isDragging=false;
		let rect=_(this).m_currentRect;
		if (rect) {
			rect.set({selectable: false, evented: false, perPixelTargetFind: true});
			rect.setCoords();
			_(this).m_currentRect=null;
			_(this).m_startPoint=null;
			ctx.Surface.Canvas.renderAll();
			ctx.Document.SaveHistory();
			ctx.Document.CheckEmpty();
		}
		ctx.NotifyBusyChange(false);
	};

	_['public'].Cancel=function (ctx) {
		let rect=_(this).m_currentRect;
		let canvas=ctx?.Surface?.Canvas;
		if ((rect)&&(canvas)) {
			canvas.remove(rect);
			canvas.renderAll();
		}
		_(this).m_currentRect=null;
		_(this).m_startPoint=null;
		_(this).m_isDragging=false;
		if (ctx) ctx.NotifyBusyChange(false);
	};

	_['public'].IsBusy=function () {
		return _(this).m_isDragging;
	};
	_['private'].m_currentRect=null;
	_['private'].m_startPoint=null;
	_['private'].m_isDragging=false;
});
