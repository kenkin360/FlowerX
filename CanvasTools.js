
var CanvasTools=Function.extend(Object, function () {
	var _=this(CanvasTools);
	CanvasTools=_[CanvasTools];
	function CanvasTools(surface, drawingDocument, toolBar, callbacks) {
		_['base'].apply(this, arguments);
		this.Surface=surface;
		this.Document=drawingDocument;
		this.ToolBar=toolBar;
		this.Color='#FF0000';
		this.BrushSize=8;
		this.SprayMode='noise';
		this.ConstrainProportions=false;
		_(this).m_callbacks=callbacks||{};
		_(this).m_boundMouseMove=this.OnGlobalMouseMove.bind(this);
		_(this).m_boundMouseUp=this.OnGlobalMouseUp.bind(this);
		_(this).m_isPanningViewport=false;
		_(this).m_lastPanClient={x: 0, y: 0};
	}

	_['public'].Init=function () {
		let tools=this;
		let canvas=this.Surface.Canvas;
		this.FloodFill=new DrawingCanvasFloodFill(canvas, this.Surface.BaseDimensions, function () {
			tools.Document.SaveHistory();
			tools.Document.CheckEmpty();
			tools.Document.NotifyInteraction();
		});
		this.Document.FloodFill=this.FloodFill;
		let toolBar=this.ToolBar;
		this.SetActiveTool(toolBar?.GetById('pencil')||toolBar?.GetTools()[0]);
	};

	_['public'].NotifyBusyChange=function (busy) {
		if (_(this).m_callbacks.OnBusyChange) {
			_(this).m_callbacks.OnBusyChange(busy);
		}
	};

	_['public'].UpdateColor=function (color) {
		this.Color=color;
		if (_(this).m_callbacks.OnColorChange) {
			_(this).m_callbacks.OnColorChange(color);
		}
	};

	_['public'].Destroy=function () {
		window.removeEventListener('mousemove', _(this).m_boundMouseMove);
		window.removeEventListener('mouseup', _(this).m_boundMouseUp);
		if (this.ActiveTool) {
			this.ActiveTool.OnDeactivate(this);
		}
		this.FloodFill=null;
		this.Document.FloodFill=null;
	};

	_['public'].SetActiveTool=function (tool) {
		let toolBar=this.ToolBar;
		let nextTool=typeof tool==='string'?toolBar?.GetById(tool)||null:tool;
		if (!nextTool) {
			return;
		}
		if (this.ActiveTool===nextTool) {
			return;
		}
		if (this.ActiveTool) {
			this.ActiveTool.Cancel(this);
			this.ActiveTool.OnDeactivate(this);
		}
		let canvas=this.Surface?.Canvas;
		if ((canvas)&&(nextTool.Id!=='select')) {
			canvas.discardActiveObject();
			canvas.selection=false;
			canvas.skipTargetFind=true;
			canvas.forEachObject(function (object) {
				if (!object.isUI) {
					object.selectable=false;
					object.evented=false;
				}
			});
			canvas.requestRenderAll();
		}
		this.ActiveTool=nextTool;
		this.ActiveTool.OnActivate(this);
	};

	_['public'].UpdateProperties=function (properties) {
		this.Color=properties.Color;
		this.BrushSize=properties.BrushSize;
		this.SprayMode=properties.SprayMode;
		this.ConstrainProportions=properties.ConstrainProportions;
		let toolBar=this.ToolBar;
		let toolObj=typeof properties.Tool==='string'?toolBar?.GetById(properties.Tool)||null:properties.Tool?.Id?toolBar?.GetById(properties.Tool.Id)||null:toolBar?.GetById(String(properties.Tool))||null;
		if ((toolObj)&&(this.ActiveTool!==toolObj)) {
			this.SetActiveTool(toolObj);
		}
		if (this.ActiveTool) {
			this.ActiveTool.OnPropertiesUpdate(this, properties);
		}
	};

	_['public'].CancelDrawing=function () {
		if (this.ActiveTool) {
			this.ActiveTool.Cancel(this);
		}
	};

	_['public'].Undo=function () {
		if ((this.ActiveTool)&&(this.ActiveTool.IsBusy(this))) {
			this.CancelDrawing();
			return;
		}
		if (this.Document.History) {
			this.Document.History.Undo();
		}
	};

	_['public'].OnMouseDown=function (option) {
		let canvas=this.Surface.Canvas;
		if ((!canvas)||(!this.ActiveTool)) {
			return;
		}
		let nativeEvent=option.e;
		if ((nativeEvent)&&(nativeEvent.button===1||nativeEvent.altKey||nativeEvent.spaceKey)) {
			_(this).m_isPanningViewport=true;
			_(this).m_lastPanClient={x: nativeEvent.clientX, y: nativeEvent.clientY};
			canvas.defaultCursor='grab';
			window.addEventListener('mousemove', _(this).m_boundMouseMove);
			window.addEventListener('mouseup', _(this).m_boundMouseUp);
			return;
		}
		if (this.ActiveTool.Id!=='rectselect') {
			if ((this.Surface.Selection)&&(!this.Surface.Selection.IsEmpty())) {
				this.Surface.Selection.Clear();
				this.Surface.RenderSelectionOverlay();
			}
		}
		this.Document.NotifyInteraction();
		window.addEventListener('mousemove', _(this).m_boundMouseMove);
		window.addEventListener('mouseup', _(this).m_boundMouseUp);
		this.ActiveTool.OnMouseDown(this, option);
	};

	_['public'].OnMouseUpCanvas=function () {
		if (this.ActiveTool) {
			this.ActiveTool.OnMouseUpCanvas(this);
		}
	};

	_['public'].OnGlobalMouseMove=function (event) {
		if ((!this.Surface.Canvas)||(!this.ActiveTool)) {
			return;
		}
		if (_(this).m_isPanningViewport) {
			let canvas=this.Surface.Canvas;
			let vpt=canvas.viewportTransform;
			vpt[4]+=event.clientX-_(this).m_lastPanClient.x;
			vpt[5]+=event.clientY-_(this).m_lastPanClient.y;
			this.Surface.UpdateViewportMask();
			canvas.requestRenderAll();
			_(this).m_lastPanClient={x: event.clientX, y: event.clientY};
			return;
		}
		this.ActiveTool.OnMouseMove(this, event);
	};

	_['public'].OnGlobalMouseUp=function (event) {
		window.removeEventListener('mousemove', _(this).m_boundMouseMove);
		window.removeEventListener('mouseup', _(this).m_boundMouseUp);
		if (_(this).m_isPanningViewport) {
			_(this).m_isPanningViewport=false;
			let canvas=this.Surface.Canvas;
			if (canvas) {
				canvas.defaultCursor=this.ActiveTool.Id==='select'?'default':'crosshair';
			}
			return;
		}
		if (this.ActiveTool) {
			this.ActiveTool.OnMouseUp(this, event);
		}
	};
	_['public'].Surface=null;
	_['public'].Document=null;
	_['public'].ToolBar=null;
	_['public'].FloodFill=null;
	_['public'].ActiveTool=null;
	_['public'].Color='#FF0000';
	_['public'].BrushSize=8;
	_['public'].SprayMode='noise';
	_['public'].ConstrainProportions=false;
	_['private'].m_callbacks=null;
	_['private'].m_boundMouseMove=null;
	_['private'].m_boundMouseUp=null;
	_['private'].m_isPanningViewport=false;
	_['private'].m_lastPanClient=null;
});
