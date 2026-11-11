
var SelectionRegion=Function.extend(Object, function () {
	var _=this(SelectionRegion);
	SelectionRegion=_[SelectionRegion];
	function SelectionRegion(width, height) {
		_['base'].apply(this, arguments);
		this.Width=Math.max(1, Math.round(width||800));
		this.Height=Math.max(1, Math.round(height||600));
		_(this).m_mask=new Uint8Array(this.Width*this.Height);
		_(this).m_rectangles=[];
		_(this).m_boundarySegments=[];
	}

	_['public'].Resize=function (width, height) {
		width=Math.max(1, Math.round(width));
		height=Math.max(1, Math.round(height));
		if ((width===this.Width)&&(height===this.Height)) {
			return;
		}
		let newMask=new Uint8Array(width*height);
		let minW=Math.min(this.Width, width);
		let minH=Math.min(this.Height, height);
		let oldMask=_(this).m_mask;
		for (let y=0; y<minH; y++) {
			let srcOffset=y*this.Width;
			let dstOffset=y*width;
			for (let x=0; x<minW; x++) {
				newMask[dstOffset+x]=oldMask[srcOffset+x];
			}
		}
		this.Width=width;
		this.Height=height;
		_(this).m_mask=newMask;
		this.RebuildGeometry();
	};

	_['public'].Clear=function () {
		_(this).m_mask.fill(0);
		_(this).m_rectangles=[];
		_(this).m_boundarySegments=[];
	};

	_['public'].IsEmpty=function () {
		let mask=_(this).m_mask;
		for (let i=0; i<mask.length; i++) {
			if (mask[i]===1) {
				return false;
			}
		}
		return true;
	};

	_['public'].ApplyRect=function (rx, ry, rw, rh, mode) {
		let W=this.Width;
		let H=this.Height;
		let x0=Math.max(0, Math.min(W, Math.round(rx)));
		let y0=Math.max(0, Math.min(H, Math.round(ry)));
		let x1=Math.max(0, Math.min(W, Math.round(rx+rw)));
		let y1=Math.max(0, Math.min(H, Math.round(ry+rh)));
		let left=Math.min(x0, x1);
		let right=Math.max(x0, x1);
		let top=Math.min(y0, y1);
		let bottom=Math.max(y0, y1);
		if ((left>=right)||(top>=bottom)) {
			if (mode==='replace') {
				this.Clear();
			}
			return;
		}
		let mask=_(this).m_mask;
		if (mode==='replace') {
			mask.fill(0);
			for (let y=top; y<bottom; y++) {
				let offset=y*W;
				for (let x=left; x<right; x++) {
					mask[offset+x]=1;
				}
			}
		}
		else if (mode==='union') {
			for (let y=top; y<bottom; y++) {
				let offset=y*W;
				for (let x=left; x<right; x++) {
					mask[offset+x]=1;
				}
			}
		}
		else if (mode==='difference') {
			for (let y=top; y<bottom; y++) {
				let offset=y*W;
				for (let x=left; x<right; x++) {
					mask[offset+x]=0;
				}
			}
		}
		this.RebuildGeometry();
	};

	_['public'].RebuildGeometry=function () {
		let W=this.Width;
		let H=this.Height;
		let mask=_(this).m_mask;
		let rects=[];
		let visited=new Uint8Array(W*H);
		for (let y=0; y<H; y++) {
			let rowOffset=y*W;
			for (let x=0; x<W; x++) {
				let idx=rowOffset+x;
				if ((mask[idx]===1)&&(visited[idx]===0)) {
					let rx=x;
					while ((rx<W)&&(mask[rowOffset+rx]===1)&&(visited[rowOffset+rx]===0)) {
						rx++;
					}
					let rectW=rx-x;
					let ry=y+1;
					let canExpand=true;
					while ((ry<H)&&(canExpand)) {
						let nextRowOffset=ry*W;
						for (let k=x; k<rx; k++) {
							if ((mask[nextRowOffset+k]!==1)||(visited[nextRowOffset+k]!==0)) {
								canExpand=false;
								break;
							}
						}
						if (canExpand) {
							ry++;
						}
					}
					let rectH=ry-y;
					for (let cy=y; cy<ry; cy++) {
						let curOffset=cy*W;
						for (let cx=x; cx<rx; cx++) {
							visited[curOffset+cx]=1;
						}
					}
					rects.push({x, y, width: rectW, height: rectH});
					x=rx-1;
				}
			}
		}
		_(this).m_rectangles=rects;
		let horizontalSegments=[];
		let verticalSegments=[];
		for (let y=0; y<=H; y++) {
			let inTopEdge=false;
			let startTopX=0;
			for (let x=0; x<W; x++) {
				let current=y<H?mask[y*W+x]:0;
				let above=y>0?mask[(y-1)*W+x]:0;
				let hasBoundary=current!==above;
				if (hasBoundary) {
					if (!inTopEdge) {
						inTopEdge=true;
						startTopX=x;
					}
				}
				else {
					if (inTopEdge) {
						horizontalSegments.push({x1: startTopX, y1: y, x2: x, y2: y});
						inTopEdge=false;
					}
				}
			}
			if (inTopEdge) {
				horizontalSegments.push({x1: startTopX, y1: y, x2: W, y2: y});
			}
		}
		for (let x=0; x<=W; x++) {
			let inEdge=false;
			let startY=0;
			for (let y=0; y<H; y++) {
				let current=x<W?mask[y*W+x]:0;
				let left=x>0?mask[y*W+(x-1)]:0;
				let hasBoundary=current!==left;
				if (hasBoundary) {
					if (!inEdge) {
						inEdge=true;
						startY=y;
					}
				}
				else {
					if (inEdge) {
						verticalSegments.push({x1: x, y1: startY, x2: x, y2: y});
						inEdge=false;
					}
				}
			}
			if (inEdge) {
				verticalSegments.push({x1: x, y1: startY, x2: x, y2: H});
			}
		}
		_(this).m_boundarySegments=horizontalSegments.concat(verticalSegments);
	};

	_['public'].GetBoundingBox=function () {
		let rects=_(this).m_rectangles;
		if (rects.length===0) {
			return null;
		}
		let minX=Infinity;
		let minY=Infinity;
		let maxX=-Infinity;
		let maxY=-Infinity;
		for (let i=0; i<rects.length; i++) {
			let r=rects[i];
			if (r.x<minX) {
				minX=r.x;
			}
			if (r.y<minY) {
				minY=r.y;
			}
			if (r.x+r.width>maxX) {
				maxX=r.x+r.width;
			}
			if (r.y+r.height>maxY) {
				maxY=r.y+r.height;
			}
		}
		return {
			x: minX
			, y: minY
			, width: Math.max(0, maxX-minX)
			, height: Math.max(0, maxY-minY)
		};
	};

	_['public'].GetMask=function () {
		return _(this).m_mask;
	};

	_['public'].GetRectangles=function () {
		return _(this).m_rectangles;
	};

	_['public'].DrawMarchingAnts=function (ctx, dashOffset) {
		let segments=_(this).m_boundarySegments;
		let rects=_(this).m_rectangles;
		if ((segments.length===0)&&(rects.length===0)) {
			return;
		}
		ctx.save();
		ctx.fillStyle='rgba(56, 189, 248, 0.08)';
		for (let i=0; i<rects.length; i++) {
			let r=rects[i];
			ctx.fillRect(r.x, r.y, r.width, r.height);
		}
		ctx.strokeStyle='#38bdf8';
		ctx.lineWidth=1.5;
		ctx.setLineDash([5, 5]);
		ctx.lineDashOffset=-dashOffset;
		ctx.beginPath();
		for (let i=0; i<segments.length; i++) {
			let seg=segments[i];
			ctx.moveTo(seg.x1+0.5, seg.y1+0.5);
			ctx.lineTo(seg.x2+0.5, seg.y2+0.5);
		}
		ctx.stroke();
		ctx.restore();
	};
	_['public'].Width=0;
	_['public'].Height=0;
	_['private'].m_mask=null;
	_['private'].m_rectangles=null;
	_['private'].m_boundarySegments=null;
});
