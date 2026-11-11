
var SprayTool=Function.extend(EditorTool, function () {
	var _=this(SprayTool);
	SprayTool=_[SprayTool];
	function SprayTool() {
		_['base'].apply(this, ['spray', 'air', 'Spray (S)', 's']);
		this.HasBrushSize=true;
		this.HasColor=true;
		this.HasSprayMode=true;
		this.ShowsColorIndicator=true;
		this.ShowsColor=true;
	}

	_['public'].OnActivate=function (ctx) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) return;
		canvas.isDrawingMode=true;
		let brush=new AdvancedSprayBrush(canvas);
		brush.width=ctx.BrushSize||8;
		brush.color=String(ctx.Color||'#FF0000');
		let mode=String(ctx.SprayMode||'noise');
		brush.SprayType=mode;
		brush.Density=mode==='noise'?20:15;
		brush.DotWidth=Math.max(1, (ctx.BrushSize||8)/8);
		brush.DotWidthVariance=brush.DotWidth*0.5;
		canvas.freeDrawingBrush=brush;
		canvas.defaultCursor='crosshair';
		canvas.requestRenderAll();
	};

	_['public'].OnDeactivate=function (ctx) {
		let canvas=ctx.Surface.Canvas;
		if (!canvas) return;
		canvas.isDrawingMode=false;
	};

	_['public'].OnPropertiesUpdate=function (ctx, props) {
		let canvas=ctx.Surface.Canvas;
		if ((!canvas)||(!canvas.freeDrawingBrush)) return;
		let brush=canvas.freeDrawingBrush;
		brush.width=props.BrushSize;
		brush.color=String(props.Color);
		let mode=String(props.SprayMode);
		brush.SprayType=mode;
		brush.Density=mode==='noise'?20:15;
		brush.DotWidth=Math.max(1, props.BrushSize/8);
		brush.DotWidthVariance=brush.DotWidth*0.5;
	};

	_['public'].OnMouseUpCanvas=function (ctx) {
		ctx.Document.SaveHistory();
		ctx.Document.CheckEmpty();
	};
});
