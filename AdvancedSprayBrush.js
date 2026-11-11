
var AdvancedSprayBrush=Function.extend(fabric.BaseBrush, function () {
	let _=this(AdvancedSprayBrush);
	AdvancedSprayBrush=_[AdvancedSprayBrush];
	function AdvancedSprayBrush(canvas) {
		_['base'].call(this, canvas)(function () {
			this.SprayType='noise';
			this.Density=20;
			this.DotWidth=1.5;
			this.DotWidthVariance=1;
			this.SprayChunks=[];
			_(this).m_sprayInterval=null;
			_(this).m_currentPointer=null;
		});
	}

	_['public'].AddSprayChunk=function (pointer) {
		let width=this.width||10;
		let density=this.Density;
		let dotWidth=this.DotWidth;
		let dotWidthVariance=this.DotWidthVariance;
		for (let i=0; i<density; i++) {
			let angle=fabric.util.getRandomInt(0, 360);
			let radius=fabric.util.getRandomInt(0, width/2);
			let rad=angle*Math.PI/180;
			let px=pointer.x!==void 0?pointer.x:pointer.X;
			let py=pointer.y!==void 0?pointer.y:pointer.Y;
			let x=px+radius*Math.cos(rad);
			let y=py+radius*Math.sin(rad);
			let opacity=fabric.util.getRandomInt(25, 100)/100;
			let size=Math.max(0.5, dotWidth+(Math.random()-0.5)*dotWidthVariance);
			this.SprayChunks.push({
				X: x
				, Y: y
				, Width: size
				, Opacity: opacity
				, Angle: this.SprayType==='hair'?fabric.util.getRandomInt(0, 360):0
			});
		}
	};

	_['public'].RenderChunk=function (ctx, chunk) {
		ctx.save();
		ctx.globalAlpha=chunk.Opacity;
		ctx.fillStyle=this.color;
		ctx.strokeStyle=this.color;
		ctx.lineCap='round';
		if (this.SprayType==='noise') {
			ctx.beginPath();
			ctx.arc(chunk.X, chunk.Y, chunk.Width, 0, Math.PI*2, false);
			ctx.fill();
		}
		else {
			let length=chunk.Width*5;
			let rad=(chunk.Angle??0)*Math.PI/180;
			ctx.lineWidth=Math.max(0.5, chunk.Width/2);
			ctx.beginPath();
			ctx.moveTo(
				chunk.X-Math.cos(rad)*length/2,
				chunk.Y-Math.sin(rad)*length/2
			);
			ctx.lineTo(
				chunk.X+Math.cos(rad)*length/2,
				chunk.Y+Math.sin(rad)*length/2
			);
			ctx.stroke();
		}
		ctx.restore();
	};

	_['public'].onMouseDown=function (pointer) {
		this.SprayChunks=[];
		this.canvas.clearContext(this.canvas.contextTop);
		_(this).m_currentPointer={x: pointer.x, y: pointer.y};
		this.AddSprayChunk(_(this).m_currentPointer);
		this._render();
		if (_(this).m_sprayInterval) {
			clearInterval(_(this).m_sprayInterval);
		}
		let brush=this;
		_(this).m_sprayInterval=setInterval(function () {
			let currentPointer=_(brush).m_currentPointer;
			if (currentPointer) {
				brush.AddSprayChunk(currentPointer);
				brush._render();
			}
		}, 25);
	};

	_['public'].onMouseMove=function (pointer) {
		_(this).m_currentPointer={x: pointer.x, y: pointer.y};
		this.AddSprayChunk(_(this).m_currentPointer);
		this._render();
	};

	_['public'].onMouseUp=function () {
		if (_(this).m_sprayInterval) {
			clearInterval(_(this).m_sprayInterval);
			_(this).m_sprayInterval=null;
		}
		_(this).m_currentPointer=null;
		if (this.SprayChunks.length===0) {
			return;
		}
		this.canvas.clearContext(this.canvas.contextTop);
		let minX=Infinity;
		let minY=Infinity;
		let maxX=-Infinity;
		let maxY=-Infinity;
		for (let i=0; i<this.SprayChunks.length; i++) {
			let chunk=this.SprayChunks[i];
			let pad=this.SprayType==='hair'?chunk.Width*5:chunk.Width+2;
			if (chunk.X-pad<minX) {
				minX=chunk.X-pad;
			}
			if (chunk.X+pad>maxX) {
				maxX=chunk.X+pad;
			}
			if (chunk.Y-pad<minY) {
				minY=chunk.Y-pad;
			}
			if (chunk.Y+pad>maxY) {
				maxY=chunk.Y+pad;
			}
		}
		minX=Math.floor(minX);
		minY=Math.floor(minY);
		maxX=Math.ceil(maxX);
		maxY=Math.ceil(maxY);
		let offscreen=document.createElement('canvas');
		offscreen.width=Math.max(1, maxX-minX);
		offscreen.height=Math.max(1, maxY-minY);
		let offCtx=offscreen.getContext('2d');
		if (offCtx) {
			offCtx.save();
			offCtx.translate(-minX, -minY);
			for (let i=0; i<this.SprayChunks.length; i++) {
				this.RenderChunk(offCtx, this.SprayChunks[i]);
			}
			offCtx.restore();
			let sprayImage=new fabric.FabricImage(offscreen, {
				left: minX
				, top: minY
				, originX: 'left'
				, originY: 'top'
				, selectable: false
				, evented: false
			});
			this.canvas.add(sprayImage);
			this.canvas.requestRenderAll();
			this.canvas.fire('path:created', {path: sprayImage});
		}
		this.SprayChunks=[];
	};

	_['public']._render=function () {
		let ctx=this.canvas.contextTop;
		if (!ctx) {
			return;
		}
		this.canvas.clearContext(ctx);
		ctx.save();
		if (this.canvas.viewportTransform) {
			let vpt=this.canvas.viewportTransform;
			ctx.transform(
				vpt[0],
				vpt[1],
				vpt[2],
				vpt[3],
				vpt[4],
				vpt[5]
			);
		}
		for (let i=0; i<this.SprayChunks.length; i++) {
			this.RenderChunk(ctx, this.SprayChunks[i]);
		}
		ctx.restore();
	};
	_['public'].SprayType=null;
	_['public'].Density=0;
	_['public'].DotWidth=0;
	_['public'].DotWidthVariance=0;
	_['public'].SprayChunks=null;
	_['private'].m_sprayInterval=null;
	_['private'].m_currentPointer=null;
});
