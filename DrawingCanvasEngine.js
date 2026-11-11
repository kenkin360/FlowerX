
var DrawingCanvasEngine=Function.extend(Object, function () {
	var _=this(DrawingCanvasEngine);
	DrawingCanvasEngine=_[DrawingCanvasEngine];
	function DrawingCanvasEngine(toolBar, callbacks) {
		_['base'].apply(this, arguments);
		this.ToolBar=toolBar;
		this.Surface=new CanvasSurface({
			OnZoomChange: function (zoom) {
				if ((callbacks)&&(typeof callbacks.OnZoomChange==='function')) {
					callbacks.OnZoomChange(zoom);
				}
			}
		});
		let workspace=this;
		this.Document=new CanvasDocument(this.Surface, {
			OnContentChange: function (empty) {
				if ((callbacks)&&(typeof callbacks.OnContentChange==='function')) {
					callbacks.OnContentChange(empty);
				}
			}
			, OnInteraction: function () {
				if ((callbacks)&&(typeof callbacks.OnInteraction==='function')) {
					callbacks.OnInteraction();
				}
			}
			, OnDimensionsChange: function (dimensions, isImageLoaded) {
				workspace.ScheduleResize();
				if ((callbacks)&&(typeof callbacks.OnDimensionsChange==='function')) {
					callbacks.OnDimensionsChange(dimensions, isImageLoaded);
				}
			}
		});
		this.Tools=new CanvasTools(this.Surface, this.Document, toolBar, {
			OnBusyChange: function (busy) {
				if ((callbacks)&&(typeof callbacks.OnBusyChange==='function')) {
					callbacks.OnBusyChange(busy);
				}
			}
			, OnColorChange: function (color) {
				if ((callbacks)&&(typeof callbacks.OnColorChange==='function')) {
					callbacks.OnColorChange(color);
				}
			}
		});
		this.Clipboard=null;
		_(this).m_container=null;
		_(this).m_observer=null;
		_(this).m_resizeRaf=null;
		_(this).m_callbacks=callbacks||{};
	}

	_['public'].Init=function (element, container) {
		_(this).m_container=container;
		this.Surface.Init(element, container);
		this.Document.Init();
		this.Tools.Init();
		let document2=this.Document;
		let surface=this.Surface;
		let tools=this.Tools;
		let toolBar=this.ToolBar;
		let callbacks=_(this).m_callbacks;
		this.Clipboard=new DrawingCanvasClipboard(
			this.Surface.Canvas,
			this.Surface,
			toolBar,
			function () {
				document2.SaveHistory();
				document2.CheckEmpty();
			},
			function () {
				return surface.BaseDimensions;
			},
			function (newTool) {
				tools.SetActiveTool(newTool);
				if ((callbacks)&&(typeof callbacks.OnToolChange==='function')) {
					callbacks.OnToolChange(newTool);
				}
			}
		);
		let canvas=this.Surface.Canvas;
		canvas.on('object:modified', function () {
			document2.SaveHistory();
		});
		canvas.on('path:created', function (e) {
			if ((e)&&(e.path)&&(tools.ActiveTool?.Id!=='select')) {
				e.path.set({selectable: false, evented: false});
			}
			document2.CheckEmpty();
			document2.SaveHistory();
			document2.NotifyInteraction();
		});
		canvas.on('object:removed', function () {
			document2.CheckEmpty();
			document2.SaveHistory();
		});
		canvas.on('object:added', function () {
			document2.CheckEmpty();
		});
		canvas.on('mouse:down', function (option) {
			tools.OnMouseDown(option);
		});
		canvas.on('mouse:up', function () {
			tools.OnMouseUpCanvas();
		});
		let workspace=this;
		_(this).m_observer=new ResizeObserver(function () {
			workspace.ScheduleResize();
		});
		if (container) {
			_(this).m_observer.observe(container);
		}
		this.ScheduleResize();
	};

	_['public'].ZoomIn=function () {
		this.Surface.ZoomIn();
	};

	_['public'].ZoomOut=function () {
		this.Surface.ZoomOut();
	};

	_['public'].ResetZoom=function () {
		this.Surface.ResetZoom();
	};

	_['public'].CenterAndResetZoom=function () {
		this.Surface.CenterAndResetZoom();
	};

	_['public'].ScheduleResize=function () {
		let $this=_(this);
		if ($this.m_resizeRaf) {
			cancelAnimationFrame($this.m_resizeRaf);
		}
		let workspace=this;
		$this.m_resizeRaf=requestAnimationFrame(function () {
			$this.m_resizeRaf=null;
			workspace.Resize();
		});
	};

	_['public'].Resize=function () {
		let container=_(this).m_container;
		if (!container) {
			return;
		}
		let width=container.clientWidth;
		let height=container.clientHeight;
		if ((!width)||(!height)) {
			return;
		}
		let hasImportedImage=this.Document.HasImportedImage;
		this.Surface.Resize(width, height, hasImportedImage);
		if ((!hasImportedImage)&&(this.Tools.FloodFill)) {
			this.Tools.FloodFill.SetBaseDimensions(this.Surface.BaseDimensions);
		}
	};

	_['public'].Clear=function () {
		let container=_(this).m_container;
		let viewportDims=container?{width: container.clientWidth, height: container.clientHeight}:null;
		this.Document.Clear(viewportDims);
		this.ScheduleResize();
	};

	_['public'].Destroy=function () {
		let $this=_(this);
		if ($this.m_resizeRaf) {
			cancelAnimationFrame($this.m_resizeRaf);
			$this.m_resizeRaf=null;
		}
		if ($this.m_observer) {
			$this.m_observer.disconnect();
		}
		$this.m_observer=null;
		$this.m_container=null;
		this.Tools.Destroy();
		this.Surface.Destroy();
		this.Clipboard=null;
	};
	_['public'].Surface=null;
	_['public'].Document=null;
	_['public'].Tools=null;
	_['public'].ToolBar=null;
	_['public'].Clipboard=null;
	_['private'].m_container=null;
	_['private'].m_observer=null;
	_['private'].m_resizeRaf=null;
	_['private'].m_callbacks=null;
});
