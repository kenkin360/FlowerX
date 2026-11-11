
var DrawingCanvasFloodFill=Function.extend(Object, function () {
	var _=this(DrawingCanvasFloodFill);
	DrawingCanvasFloodFill=_[DrawingCanvasFloodFill];
	function DrawingCanvasFloodFill(canvas, baseDimensions, onComplete) {
		_['base'].apply(this, arguments);
		_(this).m_canvas=canvas;
		_(this).m_baseDimensions=baseDimensions;
		_(this).m_onComplete=onComplete;
	}

	_['public'].SetBaseDimensions=function (dims) {
		if ((dims)&&(typeof dims.width==='number')&&(typeof dims.height==='number')) {
			_(this).m_baseDimensions={width: dims.width, height: dims.height};
		}
	};

	_['public'].Execute=function (clickX, clickY, color) {
		var canvas=_(this).m_canvas;
		var baseDimensions=_(this).m_baseDimensions;
		var onComplete=_(this).m_onComplete;
		if ((!canvas)||(!baseDimensions)) return;
		var W=Math.round(baseDimensions.width);
		var H=Math.round(baseDimensions.height);
		if ((W<=0)||(H<=0)) return;
		var startX=Math.round(Math.max(0, Math.min(W-1, clickX)));
		var startY=Math.round(Math.max(0, Math.min(H-1, clickY)));
		canvas.discardActiveObject();
		var snapshotCanvas=document.createElement('canvas');
		snapshotCanvas.width=W;
		snapshotCanvas.height=H;
		var sCtx=snapshotCanvas.getContext('2d', {willReadFrequently: true});
		if (!sCtx) return;
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
		var imgData=sCtx.getImageData(0, 0, W, H);
		var data=imgData.data;
		var startIndex=(startY*W+startX)*4;
		var targetR=data[startIndex];
		var targetG=data[startIndex+1];
		var targetB=data[startIndex+2];
		var targetA=data[startIndex+3];
		var c=String(color).replace('#', '');
		if (c.length===3) {
			c=c.split('').map(function (ch) {
				return ch+ch;
			}).join('');
		}
		var num=parseInt(c, 16);
		var fillR=num>>16&255;
		var fillG=num>>8&255;
		var fillB=num&255;
		var fillA=255;
		if ((Math.abs(targetR-fillR)<3)&&(Math.abs(targetG-fillG)<3)&&(Math.abs(targetB-fillB)<3)&&(Math.abs(targetA-fillA)<3)) {
			return;
		}
		var totalPixels=W*H;
		var visited=new Uint8Array(totalPixels);
		var queue=new Int32Array(totalPixels);
		var head=0;
		var tail=0;
		var startPos=startY*W+startX;
		queue[tail++]=startPos;
		visited[startPos]=1;
		var tolerance=48;
		var matchTarget=function (pos2) {
			var idx2=pos2*4;
			var dr=Math.abs(data[idx2]-targetR);
			var dg=Math.abs(data[idx2+1]-targetG);
			var db=Math.abs(data[idx2+2]-targetB);
			var da=Math.abs(data[idx2+3]-targetA);
			return dr+dg+db+da<=tolerance;
		};
		while (head<tail) {
			var pos=queue[head++];
			var x=pos%W;
			var y=pos/W|0;
			if (x>0) {
				var next=pos-1;
				if ((!visited[next])&&(matchTarget(next))) {
					visited[next]=1;
					queue[tail++]=next;
				}
			}
			if (x<W-1) {
				var next=pos+1;
				if ((!visited[next])&&(matchTarget(next))) {
					visited[next]=1;
					queue[tail++]=next;
				}
			}
			if (y>0) {
				var next=pos-W;
				if ((!visited[next])&&(matchTarget(next))) {
					visited[next]=1;
					queue[tail++]=next;
				}
			}
			if (y<H-1) {
				var next=pos+W;
				if ((!visited[next])&&(matchTarget(next))) {
					visited[next]=1;
					queue[tail++]=next;
				}
			}
		}
		if (tail===0) return;
		var expandRadius=2;
		var expandedMask=new Uint8Array(visited);
		for (var r=0; r<expandRadius; r++) {
			var currentSnapshot=new Uint8Array(expandedMask);
			for (var y=0; y<H; y++) {
				for (var x=0; x<W; x++) {
					var idx=y*W+x;
					if (currentSnapshot[idx]===1) {
						if (x>0) expandedMask[idx-1]=1;
						if (x<W-1) expandedMask[idx+1]=1;
						if (y>0) expandedMask[idx-W]=1;
						if (y<H-1) expandedMask[idx+W]=1;
					}
				}
			}
		}
		var minX=W;
		var maxX=0;
		var minY=H;
		var maxY=0;
		var fillCanvas=document.createElement('canvas');
		fillCanvas.width=W;
		fillCanvas.height=H;
		var fCtx=fillCanvas.getContext('2d');
		if (!fCtx) return;
		var fillImgData=fCtx.createImageData(W, H);
		var fillData=fillImgData.data;
		var hasAnyExpanded=false;
		for (var y=0; y<H; y++) {
			for (var x=0; x<W; x++) {
				var p=y*W+x;
				if (expandedMask[p]===1) {
					hasAnyExpanded=true;
					var pIdx=p*4;
					fillData[pIdx]=fillR;
					fillData[pIdx+1]=fillG;
					fillData[pIdx+2]=fillB;
					fillData[pIdx+3]=fillA;
					if (x<minX) minX=x;
					if (x>maxX) maxX=x;
					if (y<minY) minY=y;
					if (y>maxY) maxY=y;
				}
			}
		}
		if (!hasAnyExpanded) return;
		var cropW=Math.max(1, maxX-minX+1);
		var cropH=Math.max(1, maxY-minY+1);
		fCtx.putImageData(fillImgData, 0, 0);
		var croppedCanvas=document.createElement('canvas');
		croppedCanvas.width=cropW;
		croppedCanvas.height=cropH;
		var cCtx=croppedCanvas.getContext('2d');
		if (!cCtx) return;
		cCtx.drawImage(fillCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
		var fabricImage=new fabric.FabricImage(croppedCanvas, {
			left: minX
			, top: minY
			, originX: 'left'
			, originY: 'top'
			, selectable: false
			, evented: false
			, hasControls: false
			, hasBorders: false
			, lockMovementX: true
			, lockMovementY: true
			, lockScalingX: true
			, lockScalingY: true
			, lockRotation: true
			, hoverCursor: 'crosshair'
		});
		fabricImage.isFillLayer=true;
		canvas.add(fabricImage);
		canvas.requestRenderAll();
		if (onComplete) {
			onComplete();
		}
	};
	_['private'].m_canvas=null;
	_['private'].m_baseDimensions=null;
	_['private'].m_onComplete=null;
});
