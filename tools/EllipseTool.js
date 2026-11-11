
var EllipseTool=Function.extend(EditorTool, function () {
	var _=this(EllipseTool);
	EllipseTool=_[EllipseTool];
	function EllipseTool() {
		_['base'].apply(this, ['ellipse', 'circle', 'Ellipse (O)', 'o']);
		this.HasBrushSize=true;
		this.HasColor=true;
		this.HasProportionConstraint=true;
		_(this).m_currentEllipse=null;
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
		let ellipse=new fabric.Ellipse({
			left: point.x
			, top: point.y
			, rx: 0
			, ry: 0
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
		_(this).m_currentEllipse=ellipse;
		_(this).m_isDragging=true;
		canvas.add(ellipse);
		ctx.NotifyBusyChange(true);
	};

	_['public'].OnMouseMove=function (ctx, event) {
		if ((!_(this).m_isDragging)||(!_(this).m_currentEllipse)) return;
		let point=ctx.Surface.GetVirtualPointer(event);
		let start=_(this).m_startPoint;
		let rx=Math.abs(start.x-point.x)/2;
		let ry=Math.abs(start.y-point.y)/2;
		if (ctx.ConstrainProportions) {
			let r=Math.max(rx, ry);
			rx=r;
			ry=r;
		}
		_(this).m_currentEllipse.set({
			rx,
			ry
			, left: point.x>=start.x?start.x:start.x-rx*2
			, top: point.y>=start.y?start.y:start.y-ry*2
		});
		ctx.Surface.Canvas.renderAll();
	};

	_['public'].OnMouseUp=function (ctx, event) {
		if (!_(this).m_isDragging) return;
		_(this).m_isDragging=false;
		let ellipse=_(this).m_currentEllipse;
		if (ellipse) {
			ellipse.set({selectable: false, evented: false, perPixelTargetFind: true});
			ellipse.setCoords();
			_(this).m_currentEllipse=null;
			_(this).m_startPoint=null;
			ctx.Surface.Canvas.renderAll();
			ctx.Document.SaveHistory();
			ctx.Document.CheckEmpty();
		}
		ctx.NotifyBusyChange(false);
	};

	_['public'].Cancel=function (ctx) {
		let ellipse=_(this).m_currentEllipse;
		let canvas=ctx?.Surface?.Canvas;
		if ((ellipse)&&(canvas)) {
			canvas.remove(ellipse);
			canvas.renderAll();
		}
		_(this).m_currentEllipse=null;
		_(this).m_startPoint=null;
		_(this).m_isDragging=false;
		if (ctx) ctx.NotifyBusyChange(false);
	};

	_['public'].IsBusy=function () {
		return _(this).m_isDragging;
	};
	_['private'].m_currentEllipse=null;
	_['private'].m_startPoint=null;
	_['private'].m_isDragging=false;
});
