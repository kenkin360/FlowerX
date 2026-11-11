
var RectSelectTool=Function.extend(EditorTool, function () {
	var _=this(RectSelectTool);
	RectSelectTool=_[RectSelectTool];
	function RectSelectTool() {
		_['base'].apply(this, ['rectselect', 'select_all', 'Select Region (M)', 'm']);
		_(this).m_startPoint=null;
		_(this).m_currentRect=null;
		_(this).m_isDragging=false;
		_(this).m_mode='replace';
	}

	_['public'].OnActivate=function (ctx) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) return;
		canvas.discardActiveObject();
		canvas.selection=false;
		canvas.skipTargetFind=true;
		canvas.defaultCursor='crosshair';
		canvas.isDrawingMode=false;
		canvas.forEachObject(function (object) {
			if (!object.isUI) {
				object.selectable=false;
				object.evented=false;
			}
		});
		canvas.requestRenderAll();
		ctx.Surface.RenderSelectionOverlay();
	};

	_['public'].OnDeactivate=function (ctx) {
		this.Cancel(ctx);
	};

	_['public'].OnMouseDown=function (ctx, option) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) return;
		if (canvas.getActiveObject()) {
			canvas.discardActiveObject();
			canvas.requestRenderAll();
		}
		let evt=option.e||{};
		let point=ctx.Surface.GetVirtualPointer(option);
		let isMac=typeof navigator!=='undefined'&&navigator.platform.toUpperCase().includes('MAC');
		let isCtrl=evt.ctrlKey||(isMac?evt.metaKey:false);
		let isShift=evt.shiftKey;
		let mode='replace';
		if (isCtrl) {
			mode='difference';
		}
		else if (isShift) {
			mode='union';
		}
		_(this).m_startPoint=point;
		_(this).m_mode=mode;
		_(this).m_isDragging=true;
		let preview=new fabric.Rect({
			left: point.x
			, top: point.y
			, width: 0
			, height: 0
			, fill: mode==='difference'?'rgba(239, 68, 68, 0.15)':'rgba(56, 189, 248, 0.15)'
			, stroke: mode==='difference'?'#ef4444':'#38bdf8'
			, strokeWidth: 1.5
			, strokeDashArray: [4, 4]
			, selectable: false
			, evented: false
			, originX: 'left'
			, originY: 'top'
			, isUI: true
		});
		_(this).m_currentRect=preview;
		canvas.add(preview);
		ctx.NotifyBusyChange(true);
	};

	_['public'].OnMouseMove=function (ctx, event) {
		let inst=_(this);
		if ((!inst.m_isDragging)||(!inst.m_currentRect)) return;
		let point=ctx.Surface.GetVirtualPointer(event);
		let start=inst.m_startPoint;
		let left=Math.min(start.x, point.x);
		let top=Math.min(start.y, point.y);
		let width=Math.abs(start.x-point.x);
		let height=Math.abs(start.y-point.y);
		inst.m_currentRect.set({
			left,
			top,
			width,
			height
		});
		ctx.Surface.Canvas.renderAll();
	};

	_['public'].OnMouseUp=function (ctx) {
		let inst=_(this);
		if (!inst.m_isDragging) return;
		inst.m_isDragging=false;
		let rect=inst.m_currentRect;
		let canvas=ctx.Surface.Canvas;
		if ((rect)&&(canvas)) {
			let left=rect.left;
			let top=rect.top;
			let width=rect.width;
			let height=rect.height;
			canvas.remove(rect);
			inst.m_currentRect=null;
			inst.m_startPoint=null;
			if ((width>2)&&(height>2)) {
				ctx.Surface.Selection.ApplyRect(left, top, width, height, inst.m_mode);
			}
			else if (inst.m_mode==='replace') {
				ctx.Surface.Selection.Clear();
			}
			canvas.requestRenderAll();
			ctx.Surface.RenderSelectionOverlay();
		}
		ctx.NotifyBusyChange(false);
	};

	_['public'].Cancel=function (ctx) {
		let inst=_(this);
		let canvas=ctx?.Surface?.Canvas;
		if ((inst.m_currentRect)&&(canvas)) {
			canvas.remove(inst.m_currentRect);
		}
		inst.m_currentRect=null;
		inst.m_startPoint=null;
		inst.m_isDragging=false;
		if (canvas) canvas.renderAll();
		if (ctx) {
			ctx.NotifyBusyChange(false);
			ctx.Surface.RenderSelectionOverlay();
		}
	};

	_['public'].IsBusy=function () {
		return _(this).m_isDragging;
	};
	_['private'].m_startPoint=null;
	_['private'].m_currentRect=null;
	_['private'].m_isDragging=false;
	_['private'].m_mode='replace';
});
