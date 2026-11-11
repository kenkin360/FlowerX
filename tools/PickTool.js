
var PickTool=Function.extend(EditorTool, function () {
	var _=this(PickTool);
	PickTool=_[PickTool];
	function PickTool() {
		_['base'].apply(this, ['select', 'near_me', 'Pick (V)', 'v']);
	}

	_['public'].ApplyAntsStyle=function (object) {
		if (!object) {
			return;
		}
		object.set({
			borderColor: '#38bdf8'
			, cornerColor: '#ffffff'
			, cornerStrokeColor: '#0284c7'
			, cornerSize: 9
			, cornerStyle: 'circle'
			, transparentCorners: false
			, borderDashArray: [6, 6]
			, borderScaleFactor: 2
			, padding: 4
		});
	};

	_['public'].OnActivate=function (ctx) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) {
			return;
		}
		if ((ctx.Surface.Selection)&&(!ctx.Surface.Selection.IsEmpty())) {
			ctx.Surface.Selection.Clear();
			ctx.Surface.RenderSelectionOverlay();
		}
		canvas.selection=false;
		canvas.skipTargetFind=false;
		canvas.perPixelTargetFind=true;
		canvas.targetFindTolerance=6;
		canvas.defaultCursor='default';
		canvas.isDrawingMode=false;
		let tool=this;
		canvas.forEachObject(function (object) {
			let isBg=!!object.isBackground;
			let canSelect=!object.isUI&&!object.isFillLayer&&!isBg;
			object.selectable=canSelect;
			object.evented=canSelect;
			object.perPixelTargetFind=true;
			if (canSelect) {
				tool.ApplyAntsStyle(object);
			}
		});
		canvas.requestRenderAll();
	};

	_['public'].OnDeactivate=function (ctx) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) {
			return;
		}
		canvas.discardActiveObject();
		canvas.selection=false;
		canvas.skipTargetFind=true;
		canvas.defaultCursor='crosshair';
		canvas.forEachObject(function (object) {
			object.selectable=false;
			object.evented=false;
		});
		canvas.requestRenderAll();
	};

	_['public'].OnMouseDown=function (ctx, option) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) {
			return;
		}
		if ((ctx.Surface.Selection)&&(!ctx.Surface.Selection.IsEmpty())) {
			ctx.Surface.Selection.Clear();
			ctx.Surface.RenderSelectionOverlay();
		}
		let target=option.target;
		if (target instanceof fabric.ActiveSelection) {
			canvas.discardActiveObject();
			if ((target._objects)&&(target._objects.length>0)) {
				let singleTarget=target._objects[target._objects.length-1];
				this.ApplyAntsStyle(singleTarget);
				canvas.setActiveObject(singleTarget);
			}
			canvas.requestRenderAll();
			return;
		}
		if ((target)&&(!target.isBackground)&&(!target.isUI)&&(!target.isFillLayer)) {
			this.ApplyAntsStyle(target);
			if (canvas.getActiveObject()!==target) {
				canvas.setActiveObject(target);
				canvas.requestRenderAll();
			}
			return;
		}
		canvas.discardActiveObject();
		canvas.requestRenderAll();
		canvas.defaultCursor='default';
	};

	_['public'].OnMouseUp=function (ctx) {
		let canvas=ctx.Surface?.Canvas;
		if (canvas) {
			let active=canvas.getActiveObject();
			if (active instanceof fabric.ActiveSelection) {
				canvas.discardActiveObject();
				if ((active._objects)&&(active._objects.length>0)) {
					canvas.setActiveObject(active._objects[active._objects.length-1]);
				}
				canvas.requestRenderAll();
			}
		}
	};
});
