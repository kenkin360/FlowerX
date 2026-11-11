var DrawingCanvasClipboard=Function.extend(Object, function () {
	var _=this(DrawingCanvasClipboard);
	DrawingCanvasClipboard=_[DrawingCanvasClipboard];
	function DrawingCanvasClipboard(canvas, surface, toolBar, onModified, getBaseDimensions, onToolChange) {
		_['base'].apply(this, arguments);
		_(this).m_canvas=canvas;
		_(this).m_surface=surface;
		_(this).m_toolBar=toolBar;
		_(this).m_onModified=onModified;
		_(this).m_getBaseDimensions=getBaseDimensions;
		_(this).m_onToolChange=onToolChange;
	}

	_['public'].HasContent=function () {
		return DrawingCanvasClipboard.Shared.Payload!==null;
	};

	_['public'].Copy=async function () {
		var canvas=_(this).m_canvas;
		var surface=_(this).m_surface;
		if ((!canvas)||(!surface)) return;
		var activeObject=canvas.getActiveObject();
		if ((activeObject)&&(!activeObject.isUI)&&(!activeObject.isBackground)) {
			var cloned=await activeObject.clone();
			DrawingCanvasClipboard.Shared.Payload={
				type: 'object'
				, object: cloned
			};
			DrawingCanvasClipboard.Shared.PasteOffsetCount=0;
			return;
		}
		var selection=surface.Selection;
		if ((selection)&&(!selection.IsEmpty())) {
			var bbox=selection.GetBoundingBox();
			if ((bbox)&&(bbox.width>0)&&(bbox.height>0)) {
				var regionCanvas=this.ExtractSelectionRegionCanvas(selection, bbox);
				if (regionCanvas) {
					DrawingCanvasClipboard.Shared.Payload={
						type: 'region'
						, canvas: regionCanvas,
						bbox
					};
					DrawingCanvasClipboard.Shared.PasteOffsetCount=0;
					return;
				}
			}
		}
	};

	_['public'].ExtractSelectionRegionCanvas=function (selection, bbox) {
		var canvas=_(this).m_canvas;
		var surface=_(this).m_surface;
		if ((!canvas)||(!surface)) return null;
		var baseDims=surface.BaseDimensions;
		var W=Math.round(baseDims.width);
		var H=Math.round(baseDims.height);
		if ((W<=0)||(H<=0)) return null;
		var snapshot=document.createElement('canvas');
		snapshot.width=W;
		snapshot.height=H;
		var sCtx=snapshot.getContext('2d', {willReadFrequently: true});
		if (!sCtx) return null;
		sCtx.fillStyle='#000000';
		sCtx.fillRect(0, 0, W, H);
		var objects=canvas.getObjects().filter(function (o) {
			return!o.isUI;
		});
		objects.forEach(function (obj) {
			sCtx.save();
			var m=obj.calcTransformMatrix?obj.calcTransformMatrix():null;
			if (m) {
				sCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
				obj.drawObject(sCtx);
			}
			else {
				obj.render(sCtx);
			}
			sCtx.restore();
		});
		var mask=selection.GetMask();
		var fullImageData=sCtx.getImageData(0, 0, W, H);
		var fullData=fullImageData.data;
		var bw=Math.max(1, Math.round(bbox.width));
		var bh=Math.max(1, Math.round(bbox.height));
		var bx=Math.max(0, Math.round(bbox.x));
		var by=Math.max(0, Math.round(bbox.y));
		var outCanvas=document.createElement('canvas');
		outCanvas.width=bw;
		outCanvas.height=bh;
		var outCtx=outCanvas.getContext('2d');
		if (!outCtx) return null;
		var outImgData=outCtx.createImageData(bw, bh);
		var outData=outImgData.data;
		for (var py=0; py<bh; py++) {
			var srcY=by+py;
			if (srcY>=H) continue;
			var srcRowOffset=srcY*W;
			var dstRowOffset=py*bw;
			for (var px=0; px<bw; px++) {
				var srcX=bx+px;
				if (srcX>=W) continue;
				var maskIdx=srcRowOffset+srcX;
				if (mask[maskIdx]===1) {
					var srcPixelIdx=maskIdx*4;
					var dstPixelIdx=(dstRowOffset+px)*4;
					outData[dstPixelIdx]=fullData[srcPixelIdx];
					outData[dstPixelIdx+1]=fullData[srcPixelIdx+1];
					outData[dstPixelIdx+2]=fullData[srcPixelIdx+2];
					outData[dstPixelIdx+3]=fullData[srcPixelIdx+3];
				}
			}
		}
		outCtx.putImageData(outImgData, 0, 0);
		return outCanvas;
	};

	_['public'].Paste=async function () {
		var canvas=_(this).m_canvas;
		var surface=_(this).m_surface;
		var payload=DrawingCanvasClipboard.Shared.Payload;
		if ((!payload)||(!canvas)) return;
		if ((surface)&&(surface.Selection)) {
			surface.Selection.Clear();
			surface.RenderSelectionOverlay();
		}
		var onToolChange=_(this).m_onToolChange;
		if (typeof onToolChange==='function') {
			var toolBar=_(this).m_toolBar;
			var pickTool=toolBar?.GetById('select');
			if (pickTool) {
				onToolChange(pickTool);
			}
		}
		DrawingCanvasClipboard.Shared.PasteOffsetCount++;
		var offset=DrawingCanvasClipboard.Shared.PasteOffsetCount*20;
		if (payload.type==='region') {
			var regionCanvas=payload.canvas;
			var bbox=payload.bbox;
			var pastedImage=new fabric.FabricImage(regionCanvas, {
				left: bbox.x+offset
				, top: bbox.y+offset
				, originX: 'left'
				, originY: 'top'
				, selectable: true
				, evented: true
				, perPixelTargetFind: true
			});
			canvas.discardActiveObject();
			canvas.add(pastedImage);
			canvas.setActiveObject(pastedImage);
			canvas.requestRenderAll();
			if (_(this).m_onModified) {
				_(this).m_onModified();
			}
		}
		else if (payload.type==='object') {
			var clonedObj=await payload.object.clone();
			canvas.discardActiveObject();
			clonedObj.set({
				left: (clonedObj.left??0)+offset
				, top: (clonedObj.top??0)+offset
				, evented: true
				, selectable: true
				, perPixelTargetFind: true
			});
			if (clonedObj instanceof fabric.ActiveSelection) {
				clonedObj.canvas=canvas;
				clonedObj.forEachObject(function (obj) {
					obj.set({selectable: true, evented: true, perPixelTargetFind: true});
					canvas.add(obj);
				});
				clonedObj.setCoords();
			}
			else {
				canvas.add(clonedObj);
			}
			canvas.setActiveObject(clonedObj);
			canvas.requestRenderAll();
			if (_(this).m_onModified) {
				_(this).m_onModified();
			}
		}
	};

	_['public'].Duplicate=async function () {
		await this.Copy();
		await this.Paste();
	};

	_['public'].DeleteSelected=function () {
		var canvas=_(this).m_canvas;
		var surface=_(this).m_surface;
		if (!canvas) return;
		var objs=canvas.getActiveObjects();
		if ((objs)&&(objs.length>0)) {
			canvas.discardActiveObject();
			objs.forEach(function (o) {
				canvas.remove(o);
			});
			canvas.renderAll();
			if (_(this).m_onModified) {
				_(this).m_onModified();
			}
			return;
		}
		if ((surface)&&(surface.Selection)&&(!surface.Selection.IsEmpty())) {
			surface.Selection.Clear();
			canvas.requestRenderAll();
			surface.RenderSelectionOverlay();
		}
	};

	_['public'].BringForward=function () {
		var canvas=_(this).m_canvas;
		if (!canvas) return;
		var activeObject=canvas.getActiveObject();
		if (activeObject) {
			canvas.bringObjectForward(activeObject);
			canvas.requestRenderAll();
			if (_(this).m_onModified) {
				_(this).m_onModified();
			}
		}
	};

	_['public'].SendBackwards=function () {
		var canvas=_(this).m_canvas;
		if (!canvas) return;
		var activeObject=canvas.getActiveObject();
		if (activeObject) {
			canvas.sendObjectBackwards(activeObject);
			canvas.requestRenderAll();
			if (_(this).m_onModified) {
				_(this).m_onModified();
			}
		}
	};

	_['public'].FlipHorizontal=function () {
		var canvas=_(this).m_canvas;
		if (!canvas) return;
		var objects=canvas.getObjects().filter(function (o) {
			return!o.isUI;
		});
		if (objects.length===0) return;
		var baseDims=_(this).m_getBaseDimensions?_(this).m_getBaseDimensions():null;
		var canvasWidth=baseDims&&baseDims.width||canvas.getWidth()||1600;
		canvas.discardActiveObject();
		objects.forEach(function (obj) {
			var center=obj.getCenterPoint();
			var newCenterX=canvasWidth-center.x;
			var angle=obj.angle||0;
			obj.set({
				flipX: !obj.flipX
				, angle: -angle
			});
			obj.setPositionByOrigin(new fabric.Point(newCenterX, center.y), 'center', 'center');
			obj.setCoords();
		});
		canvas.requestRenderAll();
		if (_(this).m_onModified) {
			_(this).m_onModified();
		}
	};

	_['public'].FlipVertical=function () {
		var canvas=_(this).m_canvas;
		if (!canvas) return;
		var objects=canvas.getObjects().filter(function (o) {
			return!o.isUI;
		});
		if (objects.length===0) return;
		var baseDims=_(this).m_getBaseDimensions?_(this).m_getBaseDimensions():null;
		var canvasHeight=baseDims&&baseDims.height||canvas.getHeight()||900;
		canvas.discardActiveObject();
		objects.forEach(function (obj) {
			var center=obj.getCenterPoint();
			var newCenterY=canvasHeight-center.y;
			var angle=obj.angle||0;
			obj.set({
				flipY: !obj.flipY
				, angle: -angle
			});
			obj.setPositionByOrigin(new fabric.Point(center.x, newCenterY), 'center', 'center');
			obj.setCoords();
		});
		canvas.requestRenderAll();
		if (_(this).m_onModified) {
			_(this).m_onModified();
		}
	};
	_['private'].m_canvas=null;
	_['private'].m_surface=null;
	_['private'].m_toolBar=null;
	_['private'].m_onModified=null;
	_['private'].m_getBaseDimensions=null;
	_['private'].m_onToolChange=null;
	DrawingCanvasClipboard.Shared={Payload: null, PasteOffsetCount: 0};
});
