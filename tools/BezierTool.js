
var BezierTool=Function.extend(EditorTool, function () {
	var _=this(BezierTool);
	BezierTool=_[BezierTool];
	function BezierTool() {
		_['base'].apply(this, ['bezier', 'show_chart', 'Bezier (B)', 'b']);
		this.HasBrushSize=true;
		this.HasColor=true;
		_(this).m_drawingPhase=0;
		_(this).m_currentPath=null;
		_(this).m_helperLines=[];
		_(this).m_points=[];
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
		let inst=_(this);
		inst.m_isDragging=true;
		if (inst.m_drawingPhase===0) {
			inst.m_points=[point, point, point, point];
			let path=new fabric.Path([['M', point.x, point.y], ['L', point.x, point.y]], {
				stroke: String(ctx.Color||'#FF0000')
				, strokeWidth: ctx.BrushSize||8
				, fill: 'transparent'
				, strokeLineCap: 'round'
				, strokeLineJoin: 'round'
				, selectable: false
				, evented: false
				, perPixelTargetFind: true
				, objectCaching: false
			});
			inst.m_currentPath=path;
			canvas.add(path);
			inst.m_drawingPhase=1;
			ctx.NotifyBusyChange(true);
		}
		else {
			inst.m_drawingPhase++;
			this.UpdatePath(ctx);
		}
	};

	_['public'].OnMouseMove=function (ctx, event) {
		let inst=_(this);
		if ((!inst.m_isDragging)||(!inst.m_currentPath)) return;
		let point=ctx.Surface.GetVirtualPointer(event);
		let phase=inst.m_drawingPhase;
		if (phase===1) {
			inst.m_points[1]=point;
			inst.m_points[2]=point;
			inst.m_points[3]=point;
		}
		else if (phase===2) {
			inst.m_points[2]=point;
		}
		else if (phase===3) {
			inst.m_points[3]=point;
		}
		this.UpdatePath(ctx);
	};

	_['public'].OnMouseUp=function (ctx, event) {
		let inst=_(this);
		if (!inst.m_isDragging) return;
		inst.m_isDragging=false;
		if (inst.m_drawingPhase===3) {
			let path=inst.m_currentPath;
			if (path) {
				path.set({selectable: false, evented: false, perPixelTargetFind: true, objectCaching: true});
				path.setCoords();
			}
			this.CleanupHelpers(ctx);
			inst.m_drawingPhase=0;
			inst.m_currentPath=null;
			inst.m_points=[];
			ctx.Surface.Canvas.renderAll();
			ctx.NotifyBusyChange(false);
			ctx.Document.SaveHistory();
			ctx.Document.CheckEmpty();
		}
	};

	_['public'].UpdatePath=function (ctx) {
		let inst=_(this);
		let canvas=ctx.Surface.Canvas;
		let pathObj=inst.m_currentPath;
		if ((!canvas)||(!pathObj)) return;
		let points=inst.m_points;
		let start=points[0];
		let end=points[1];
		let c1=points[2];
		let c2=points[3];
		let phase=inst.m_drawingPhase;
		let pathCommands=[['M', start.x, start.y]];
		if (phase===1) pathCommands.push(['L', end.x, end.y]);
		else if (phase===2) pathCommands.push(['Q', c1.x, c1.y, end.x, end.y]);
		else if (phase===3) pathCommands.push(['C', c1.x, c1.y, c2.x, c2.y, end.x, end.y]);
		let tempPath=new fabric.Path(pathCommands);
		pathObj.set({
			path: pathCommands
			, width: tempPath.width
			, height: tempPath.height
			, left: tempPath.left
			, top: tempPath.top
			, pathOffset: tempPath.pathOffset
		});
		pathObj.setCoords();
		let helpers=inst.m_helperLines;
		if (helpers.length===0) {
			let common={selectable: false, evented: false, excludeFromExport: true};
			let line1=new fabric.Line([start.x, start.y, c1.x, c1.y], Object.assign({}, common, {stroke: 'rgba(255,255,255,0.2)', strokeDashArray: [4, 4]}));
			let line2=new fabric.Line([end.x, end.y, c2.x, c2.y], Object.assign({}, common, {stroke: 'rgba(255,255,255,0.2)', strokeDashArray: [4, 4]}));
			let p1=new fabric.Circle(Object.assign({}, common, {left: c1.x, top: c1.y, radius: 4, fill: '#18A0FB', originX: 'center', originY: 'center' }));
			let p2=new fabric.Circle(Object.assign({}, common, {left: c2.x, top: c2.y, radius: 4, fill: '#18A0FB', originX: 'center', originY: 'center' }));
			[line1, line2, p1, p2].forEach(function (o) {
				o.isUI=true;
			});
			inst.m_helperLines=[line1, line2, p1, p2];
			canvas.add(line1, line2, p1, p2);
		}
		else {
			helpers[0].set({x1: start.x, y1: start.y, x2: c1.x, y2: c1.y});
			helpers[1].set({x1: end.x, y1: end.y, x2: c2.x, y2: c2.y});
			helpers[2].set({left: c1.x, top: c1.y});
			helpers[3].set({left: c2.x, top: c2.y});
			helpers.forEach(function (o) {
				o.set({visible: phase>1});
			});
		}
		canvas.renderAll();
	};

	_['public'].CleanupHelpers=function (ctx) {
		let inst=_(this);
		let canvas=ctx?.Surface?.Canvas;
		if ((canvas)&&(inst.m_helperLines.length>0)) {
			inst.m_helperLines.forEach(function (obj) {
				canvas.remove(obj);
			});
		}
		inst.m_helperLines=[];
	};

	_['public'].Cancel=function (ctx) {
		let inst=_(this);
		let canvas=ctx?.Surface?.Canvas;
		if ((inst.m_currentPath)&&(canvas)) {
			canvas.remove(inst.m_currentPath);
		}
		this.CleanupHelpers(ctx);
		inst.m_drawingPhase=0;
		inst.m_currentPath=null;
		inst.m_points=[];
		inst.m_isDragging=false;
		if (canvas) canvas.renderAll();
		if (ctx) ctx.NotifyBusyChange(false);
	};

	_['public'].IsBusy=function () {
		return _(this).m_drawingPhase>0;
	};

	_['public'].IsDisabled=function (ctx) {
		if ((ctx)&&(ctx.IsCanvasBusy)&&(ctx.ActiveTool)&&(ctx.ActiveTool.Id==='bezier')) {
			return false;
		}
		return!!(ctx&&ctx.IsCanvasBusy);
	};
	_['private'].m_drawingPhase=0;
	_['private'].m_currentPath=null;
	_['private'].m_helperLines=null;
	_['private'].m_points=null;
	_['private'].m_isDragging=false;
});
