
var CanvasDocument=Function.extend(Object, function () {
	var _=this(CanvasDocument);
	CanvasDocument=_[CanvasDocument];
	function CanvasDocument(surface, callbacks) {
		_['base'].apply(this, arguments);
		this.Surface=surface;
		_(this).m_callbacks=callbacks||{};
	}

	_['public'].Init=function () {
		let drawingDocument=this;
		this.History=new DrawingCanvasHistory(this.Surface.Canvas, function () {
			drawingDocument.CheckEmpty();
		});
		this.History.Save();
	};

	_['public'].NotifyInteraction=function () {
		if (_(this).m_callbacks.OnInteraction) {
			_(this).m_callbacks.OnInteraction();
		}
	};

	_['public'].CheckEmpty=function () {
		let canvas=this.Surface.Canvas;
		let empty=!canvas||canvas.getObjects().every(function (object) {
			return object.isUI;
		});
		if (_(this).m_callbacks.OnContentChange) {
			_(this).m_callbacks.OnContentChange(empty);
		}
		return empty;
	};

	_['public'].SaveHistory=function () {
		if (this.History) {
			this.History.Save();
		}
	};

	_['public'].GetDimensions=function () {
		return {Width: this.Surface.BaseDimensions.width, Height: this.Surface.BaseDimensions.height};
	};

	_['public'].Clear=function (viewportDims) {
		let canvas=this.Surface.Canvas;
		if (!canvas) {
			return;
		}
		canvas.clear();
		canvas.backgroundColor='#000000';
		this.HasImportedImage=false;
		this.Surface.HasLoadedImage=false;
		let dims=viewportDims||CanvasSurface.GetViewportDimensions();
		this.Surface.BaseDimensions={width: dims.width, height: dims.height};
		if (this.Surface.Selection) {
			this.Surface.Selection.Resize(dims.width, dims.height);
			this.Surface.Selection.Clear();
		}
		this.Surface.UpdateBoundaryClip();
		this.Surface.ResetZoom();
		if (this.FloodFill) {
			this.FloodFill.SetBaseDimensions(this.Surface.BaseDimensions);
		}
		if (_(this).m_callbacks.OnDimensionsChange) {
			_(this).m_callbacks.OnDimensionsChange(this.Surface.BaseDimensions, false);
		}
		if (this.History) {
			this.History.Clear();
			this.History.Save();
		}
		this.CheckEmpty();
	};

	_['public'].GetCanvasData=function () {
		let canvas=this.Surface.Canvas;
		if (!canvas) {
			return '';
		}
		let transform=canvas.viewportTransform.slice();
		try {
			canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
			return canvas.toDataURL({
				format: 'png'
				, left: 0
				, top: 0
				, width: this.Surface.BaseDimensions.width
				, height: this.Surface.BaseDimensions.height
			});
		}
		finally {
			canvas.setViewportTransform(transform);
			this.Surface.UpdateViewportMask();
			canvas.requestRenderAll();
		}
	};

	_['public'].HasDrawnContent=function () {
		let canvas=this.Surface.Canvas;
		if ((!!canvas)&&(canvas.getObjects().some(function (object) {
			return!object.isUI;
		}))) {
			return true;
		}
		return false;
	};

	_['public'].ClearBackground=function () {
		let canvas=this.Surface.Canvas;
		if (!canvas) {
			return;
		}
		canvas.getObjects().filter(function (object) {
			return object.isBackground;
		}).forEach(function (object) {
			canvas.remove(object);
		});
		this.HasImportedImage=false;
		this.Surface.HasLoadedImage=false;
		canvas.renderAll();
		this.SaveHistory();
		this.CheckEmpty();
	};

	_['public'].LoadFromDataUrl=function (dataUrl) {
		return this.InsertImage(dataUrl, 0.5);
	};

	_['public'].AddImage=function (dataUrl, forceFullFit) {
		return this.InsertImage(dataUrl, 0.8, forceFullFit);
	};

	_['public'].InsertImage=async function (dataUrl, scale, forceFullFit) {
		let canvas=this.Surface.Canvas;
		if (!canvas) {
			return;
		}
		try {
			let image=await fabric.FabricImage.fromURL(dataUrl);
			if (canvas!==this.Surface.Canvas) {
				return;
			}
			this.NotifyInteraction();
			let lockProps={
				lockMovementX: true
				, lockMovementY: true
				, lockScalingX: true
				, lockScalingY: true
				, lockRotation: true
				, hasControls: false
				, hasBorders: false
				, selectable: false
				, evented: false
				, hoverCursor: 'default'
			};
			let imgW=image.width||1280;
			let imgH=image.height||720;
			let shouldFitFull=forceFullFit||!this.HasDrawnContent();
			if (shouldFitFull) {
				this.Surface.ResetZoom();
				let dimensions={width: imgW, height: imgH};
				this.Surface.BaseDimensions=dimensions;
				this.HasImportedImage=true;
				this.Surface.HasLoadedImage=true;
				if (this.Surface.Selection) {
					this.Surface.Selection.Resize(dimensions.width, dimensions.height);
					this.Surface.Selection.Clear();
				}
				this.Surface.UpdateBoundaryClip();
				if (this.FloodFill) {
					this.FloodFill.SetBaseDimensions(dimensions);
				}
				if (_(this).m_callbacks.OnDimensionsChange) {
					_(this).m_callbacks.OnDimensionsChange(dimensions, true);
				}
				image.set({
					...lockProps
					, left: 0
					, top: 0
					, scaleX: 1
					, scaleY: 1
					, originX: 'left'
					, originY: 'top'
				});
				image.isBackground=true;
			}
			else {
				let dimensions=this.Surface.BaseDimensions;
				let factor=Math.min(dimensions.width*scale/imgW, dimensions.height*scale/imgH);
				image.set({
					...lockProps
					, scaleX: factor
					, scaleY: factor
					, left: dimensions.width/2
					, top: dimensions.height/2
					, originX: 'center'
					, originY: 'center'
				});
			}
			canvas.add(image);
			canvas.sendObjectToBack(image);
			canvas.discardActiveObject();
			if (shouldFitFull) {
				this.Surface.CenterAndResetZoom();
			}
			else {
				canvas.renderAll();
			}
			this.SaveHistory();
			this.CheckEmpty();
		}
		catch (error) {
			console.error('Failed to add image:', error);
		}
	};
	_['public'].Surface=null;
	_['public'].History=null;
	_['public'].FloodFill=null;
	_['public'].HasImportedImage=false;
	_['private'].m_callbacks=null;
});
