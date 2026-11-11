
var CanvasSurface=Function.extend(Object, function () {
	var _=this(CanvasSurface);
	CanvasSurface=_[CanvasSurface];

	CanvasSurface.GetViewportDimensions=function (container) {
		let w=container&&container.clientWidth||(typeof window!=='undefined'?window.innerWidth-64:1280);
		let h=container&&container.clientHeight||(typeof window!=='undefined'?window.innerHeight-150:720);
		return {
			width: Math.max(1, Math.round(w))
			, height: Math.max(1, Math.round(h))
		};
	};
	function CanvasSurface(callbacks) {
		_['base'].apply(this, arguments);
		this.BaseDimensions=CanvasSurface.GetViewportDimensions();
		this.LastPanPoint={
			x: 0
			, y: 0
		};
		this.Selection=new SelectionRegion(this.BaseDimensions.width, this.BaseDimensions.height);
		_(this).m_marchingAntsRaf=null;
		_(this).m_dashOffset=0;
		_(this).m_callbacks=callbacks||{};
	}

	_['public'].Init=function (element, container) {
		let surface=this;
		if (container) {
			this.BaseDimensions=CanvasSurface.GetViewportDimensions(container);
			this.Selection.Resize(this.BaseDimensions.width, this.BaseDimensions.height);
		}
		let canvas=new fabric.Canvas(element, {
			backgroundColor: '#000000'
			, selection: false
			, preserveObjectStacking: true
			, enableRetinaScaling: true
			, fireRightClick: true
			, stopContextMenu: true
			, perPixelTargetFind: true
			, targetFindTolerance: 6
		});
		this.Canvas=canvas;
		let defaultSelectionStyles={
			borderColor: '#38bdf8'
			, cornerColor: '#ffffff'
			, cornerStrokeColor: '#0284c7'
			, cornerSize: 9
			, cornerStyle: 'circle'
			, transparentCorners: false
			, borderDashArray: [6, 6]
			, borderScaleFactor: 2
			, padding: 4
		};
		if (fabric.FabricObject) {
			fabric.FabricObject.ownDefaults=Object.assign(fabric.FabricObject.ownDefaults||{}, defaultSelectionStyles);
		}
		if (fabric.InteractiveObject) {
			fabric.InteractiveObject.ownDefaults=Object.assign(fabric.InteractiveObject.ownDefaults||{}, defaultSelectionStyles);
		}
		this.StartMarchingAnts();
		canvas.on('selection:created', function (opt) {
			surface.EnsureSingleSelection(opt);
		});
		canvas.on('selection:updated', function (opt) {
			surface.EnsureSingleSelection(opt);
		});
		canvas.on('mouse:wheel', function (option) {
			surface.ZoomAt(option.e.offsetX, option.e.offsetY, option.e.deltaY);
			option.e.preventDefault();
			option.e.stopPropagation();
		});
		canvas.on('mouse:down', function (opt) {
			let evt=opt.e;
			if ((evt.button===1)||(evt.altKey)&&(evt.button===0)) {
				surface.IsPanning=true;
				surface.LastPanPoint={
					x: evt.clientX
					, y: evt.clientY
				};
				canvas.defaultCursor='grab';
			}
		});
		canvas.on('mouse:move', function (opt) {
			if (surface.IsPanning) {
				let evt=opt.e;
				let vpt=canvas.viewportTransform;
				vpt[4]+=evt.clientX-surface.LastPanPoint.x;
				vpt[5]+=evt.clientY-surface.LastPanPoint.y;
				surface.UpdateViewportMask();
				canvas.requestRenderAll();
				surface.LastPanPoint={
					x: evt.clientX
					, y: evt.clientY
				};
			}
		});
		canvas.on('mouse:up', function () {
			if (surface.IsPanning) {
				surface.IsPanning=false;
				canvas.defaultCursor='default';
			}
		});
		this.UpdateBoundaryClip();
	};

	_['public'].ZoomAt=function (x, y, deltaY) {
		let canvas=this.Canvas;
		if (!canvas) {
			return;
		}
		let zoom=canvas.getZoom()*Math.pow(0.999, deltaY);
		zoom=Math.max(0.1, Math.min(10, zoom));
		canvas.zoomToPoint({x, y}, zoom);
		this.CurrentZoom=zoom;
		this.CenterImage();
		if (_(this).m_callbacks.OnZoomChange) {
			_(this).m_callbacks.OnZoomChange(zoom);
		}
	};

	_['public'].ZoomIn=function () {
		if (!this.Canvas) {
			return;
		}
		let zoom=Math.min(10, this.Canvas.getZoom()*1.25);
		let center={
			x: this.Canvas.getWidth()/2
			, y: this.Canvas.getHeight()/2
		};
		this.Canvas.zoomToPoint(center, zoom);
		this.CurrentZoom=zoom;
		this.CenterImage();
		if (_(this).m_callbacks.OnZoomChange) {
			_(this).m_callbacks.OnZoomChange(zoom);
		}
	};

	_['public'].ZoomOut=function () {
		if (!this.Canvas) {
			return;
		}
		let zoom=Math.max(0.1, this.Canvas.getZoom()/1.25);
		let center={
			x: this.Canvas.getWidth()/2
			, y: this.Canvas.getHeight()/2
		};
		this.Canvas.zoomToPoint(center, zoom);
		this.CurrentZoom=zoom;
		this.CenterImage();
		if (_(this).m_callbacks.OnZoomChange) {
			_(this).m_callbacks.OnZoomChange(zoom);
		}
	};

	_['public'].ResetZoom=function () {
		if (!this.Canvas) {
			return;
		}
		this.Canvas.setZoom(1);
		this.CurrentZoom=1;
		this.CenterImage();
		if (_(this).m_callbacks.OnZoomChange) {
			_(this).m_callbacks.OnZoomChange(1);
		}
	};

	_['public'].CenterAndResetZoom=function () {
		this.ResetZoom();
	};

	_['public'].CenterImage=function () {
		let canvas=this.Canvas;
		if (!canvas) {
			return;
		}
		let zoom=canvas.getZoom();
		let panX=(canvas.getWidth()-this.BaseDimensions.width*zoom)/2;
		let panY=(canvas.getHeight()-this.BaseDimensions.height*zoom)/2;
		canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY]);
		this.UpdateViewportMask();
		canvas.requestRenderAll();
	};

	_['public'].UpdateViewportMask=function () {
		let canvas=this.Canvas;
		let upper=canvas?.upperCanvasEl;
		if (!upper) {
			return;
		}
		if (!this.HasLoadedImage) {
			upper.style.clipPath='';
			return;
		}
		let vpt=canvas.viewportTransform;
		let right=canvas.getWidth()-vpt[4]-this.BaseDimensions.width*vpt[0];
		let bottom=canvas.getHeight()-vpt[5]-this.BaseDimensions.height*vpt[3];
		let topInset=Math.max(0, Math.min(canvas.getHeight(), vpt[5]));
		let rightInset=Math.max(0, Math.min(canvas.getWidth(), right));
		let bottomInset=Math.max(0, Math.min(canvas.getHeight(), bottom));
		let leftInset=Math.max(0, Math.min(canvas.getWidth(), vpt[4]));
		upper.style.clipPath=`inset(${topInset}px ${rightInset}px ${bottomInset}px ${leftInset}px)`;
	};

	_['public'].EnsureSingleSelection=function (opt) {
		let canvas=this.Canvas;
		if (!canvas) {
			return;
		}
		let active=canvas.getActiveObject();
		if (!active) {
			return;
		}
		if ((active instanceof fabric.ActiveSelection)||(active._objects)&&(active._objects.length>1)) {
			let topObject=null;
			if ((opt)&&(opt.target)&&(!(opt.target instanceof fabric.ActiveSelection))) {
				topObject=opt.target;
			}
			else if ((active._objects)&&(active._objects.length>0)) {
				topObject=active._objects[active._objects.length-1];
			}
			if (topObject) {
				canvas.setActiveObject(topObject);
				canvas.requestRenderAll();
			}
		}
	};

	_['public'].StartMarchingAnts=function () {
		let surface=this;
		let $this=_(this);
		let lastTime=0;
		function animate(time) {
			if (!surface.Canvas) {
				return;
			}
			let canvas=surface.Canvas;
			let active=canvas.getActiveObject();
			let hasSelectionRegion=surface.Selection&&!surface.Selection.IsEmpty();
			if (time-lastTime>40) {
				lastTime=time;
				$this.m_dashOffset=($this.m_dashOffset+1)%12;
				if (active) {
					active.strokeDashOffset=$this.m_dashOffset;
					canvas.requestRenderAll();
				}
				if (hasSelectionRegion) {
					surface.RenderSelectionOverlay();
				}
			}
			$this.m_marchingAntsRaf=requestAnimationFrame(animate);
		}
		$this.m_marchingAntsRaf=requestAnimationFrame(animate);
	};

	_['public'].RenderSelectionOverlay=function () {
		let canvas=this.Canvas;
		if (!canvas) {
			return;
		}
		let ctx=canvas.contextTop;
		if (!ctx) {
			return;
		}
		let active=canvas.getActiveObject();
		if (!active) {
			canvas.clearContext(ctx);
		}
		if ((this.Selection)&&(!this.Selection.IsEmpty())) {
			ctx.save();
			if (canvas.viewportTransform) {
				let vpt=canvas.viewportTransform;
				ctx.transform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5]);
			}
			this.Selection.DrawMarchingAnts(ctx, _(this).m_dashOffset);
			ctx.restore();
		}
	};

	_['public'].UpdateBoundaryClip=function () {
		if (!this.Canvas) {
			return;
		}
		this.Canvas.backgroundColor=this.HasLoadedImage?'':'#000000';
		this.Canvas.clipPath=this.HasLoadedImage?new fabric.Rect({
			left: 0
			, top: 0
			, width: this.BaseDimensions.width
			, height: this.BaseDimensions.height
			, originX: 'left'
			, originY: 'top'
			, fill: '#ffffff'
		}):null;
		if (this.Canvas.wrapperEl) {
			this.Canvas.wrapperEl.style.backgroundColor=this.HasLoadedImage?'#232327':'#000000';
		}
		this.UpdateViewportMask();
		this.Canvas.requestRenderAll();
	};

	_['public'].Destroy=function () {
		let $this=_(this);
		if ($this.m_marchingAntsRaf) {
			cancelAnimationFrame($this.m_marchingAntsRaf);
			$this.m_marchingAntsRaf=null;
		}
		if (this.Canvas) {
			this.Canvas.dispose();
			this.Canvas=null;
		}
	};

	_['public'].Resize=function (containerWidth, containerHeight, hasImportedImage) {
		if ((!this.Canvas)||(!containerWidth)||(!containerHeight)) {
			return;
		}
		let targetW=Math.round(containerWidth);
		let targetH=Math.round(containerHeight);
		if ((this.Canvas.getWidth()===targetW)&&(this.Canvas.getHeight()===targetH)) {
			return;
		}
		this.Canvas.setDimensions({
			width: targetW
			, height: targetH
		});
		if (!hasImportedImage) {
			this.BaseDimensions={
				width: targetW
				, height: targetH
			};
			if (this.Selection) {
				this.Selection.Resize(targetW, targetH);
			}
		}
		this.UpdateBoundaryClip();
		this.CenterImage();
	};

	_['public'].ClientToVirtualPoint=function (clientX, clientY) {
		if (!this.Canvas) {
			return {
				x: 0
				, y: 0
			};
		}
		let upper=this.Canvas.upperCanvasEl||this.Canvas.getElement();
		let rect=upper.getBoundingClientRect();
		let scaleX=upper.width/(rect.width||upper.clientWidth||1);
		let scaleY=upper.height/(rect.height||upper.clientHeight||1);
		let vpt=this.Canvas.viewportTransform||[1, 0, 0, 1, 0, 0];
		let inverse=fabric.util.invertTransform(vpt);
		let point=fabric.util.transformPoint(
			{
				x: (clientX-rect.left)*scaleX
				, y: (clientY-rect.top)*scaleY
			},
			inverse
		);
		return {
			x: point.x
			, y: point.y
		};
	};

	_['public'].GetVirtualPointer=function (event) {
		if (!this.Canvas) {
			return {
				x: 0
				, y: 0
			};
		}
		let nativeEvent=event&&event.e?event.e:event;
		if ((nativeEvent)&&(typeof nativeEvent.clientX==='number')) {
			return this.ClientToVirtualPoint(nativeEvent.clientX, nativeEvent.clientY);
		}
		if ((event)&&(event.scenePoint)&&(typeof event.scenePoint.x==='number')) {
			return {
				x: event.scenePoint.x
				, y: event.scenePoint.y
			};
		}
		if ((nativeEvent)&&(typeof this.Canvas.getScenePoint==='function')) {
			let point=this.Canvas.getScenePoint(nativeEvent);
			if ((point)&&(typeof point.x==='number')) {
				return {
					x: point.x
					, y: point.y
				};
			}
		}
		return {
			x: 0
			, y: 0
		};
	};

	_['public'].SampleColorAtClientPos=function (clientX, clientY) {
		if (!this.Canvas) {
			return null;
		}
		let point=this.ClientToVirtualPoint(clientX, clientY);
		let width=Math.round(this.BaseDimensions.width);
		let height=Math.round(this.BaseDimensions.height);
		if ((width<=0)||(height<=0)) {
			return null;
		}
		let x=Math.round(Math.max(0, Math.min(width-1, point.x)));
		let y=Math.round(Math.max(0, Math.min(height-1, point.y)));
		let snapshot=document.createElement('canvas');
		snapshot.width=width;
		snapshot.height=height;
		let context=snapshot.getContext('2d', {
			willReadFrequently: true
		});
		if (!context) {
			return null;
		}
		context.fillStyle='#000000';
		context.fillRect(0, 0, width, height);
		this.Canvas.getObjects().filter(function (object) {
			return!object.isUI;
		}).forEach(function (object) {
			context.save();
			let matrix=object.calcTransformMatrix?object.calcTransformMatrix():null;
			if (matrix) {
				context.transform(...matrix);
				object.drawObject(context);
			}
			else {
				object.render(context);
			}
			context.restore();
		});
		let pixel=context.getImageData(x, y, 1, 1).data;
		let hex=function (value) {
			return Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0');
		};
		return ('#'+hex(pixel[0])+hex(pixel[1])+hex(pixel[2])).toUpperCase();
	};
	_['public'].Canvas=null;
	_['public'].BaseDimensions=null;
	_['public'].IsPanning=false;
	_['public'].LastPanPoint=null;
	_['public'].Selection=null;
	_['public'].HasLoadedImage=false;
	_['public'].CurrentZoom=1;
	_['private'].m_marchingAntsRaf=null;
	_['private'].m_dashOffset=0;
	_['private'].m_callbacks=null;
});
