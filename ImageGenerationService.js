
var ImageGenerationService=Function.extend(FlowImageService, function () {
	var _=this(ImageGenerationService);
	ImageGenerationService=_[ImageGenerationService];
	function ImageGenerationService() {
		_['base'].apply(this, arguments);
	}

	_['private'].FindBucket=function (width, height, aspectRatioValue) {
		let buckets=FlowImageService.Bucket;
		let best=null;
		for (let aspectRatio of Object.keys(buckets)) {
			let bucket=buckets[aspectRatio];
			if ((!(bucket instanceof buckets))||(aspectRatioValue!=='original')&&(aspectRatio!==aspectRatioValue)) {
				continue;
			}
			let plan=new FlowImageService.PaddingPlan(width, height, aspectRatio, bucket);
			if ((!best)||(plan.CompareTo(best)<0)) {
				best=plan;
			}
		}
		if (!best) {
			throw new Error('No supported aspect ratio for image generation');
		}
		return best;
	};

	_['private'].CreateAxis=function (size, outputSize, count) {
		let edges=[];
		let outputEdges=[];
		for (let index=0; index<=count; index++) {
			edges.push(Math.floor(size*index/count));
			outputEdges.push(Math.floor(outputSize*index/count));
		}
		let axis=[];
		for (let index=0; index<count; index++) {
			let width=edges[index+1]-edges[index];
			let outputWidth=outputEdges[index+1]-outputEdges[index];
			let extra=Math.max(1, Math.round(32*width/outputWidth));
			let before=Math.floor(extra/2);
			let after=extra-before;
			let start=Math.max(0, edges[index]-before);
			let end=Math.min(size, edges[index+1]+after);
			axis.push({
				start,
				end
				, width: end-start
				, coreStart: edges[index]
				, coreEnd: edges[index+1]
			});
		}
		return axis;
	};

	_['private'].LoadImage=function (dataUrl) {
		return new Promise(function (resolve, reject) {
			let image=new Image();

			image.onload=function () {
				resolve(image);
			};

			image.onerror=function () {
				reject(new Error('Unable to decode a generated image'));
			};
			image.src=dataUrl;
		});
	};

	_['private'].CreateCanvas=function (width, height) {
		let canvas=document.createElement('canvas');
		canvas.width=width;
		canvas.height=height;
		if ((!canvas.width)||(!canvas.height)||(!canvas.getContext('2d'))) {
			throw new Error('Unable to create a generation canvas');
		}
		return canvas;
	};

	_['private'].DrawFlipped=function (context, image, x, y, width, height, flipX, flipY) {
		context.save();
		context.translate(flipX?context.canvas.width:0, flipY?context.canvas.height:0);
		context.scale(flipX?-1:1, flipY?-1:1);
		context.drawImage(image, x, y, width, height);
		context.restore();
	};

	_['private'].CreateInput=function (image, column, row, plan, flipX, flipY) {
		let canvas=_(this).CreateCanvas(plan.GetTargetWidth(), plan.GetTargetHeight());
		let context=canvas.getContext('2d');
		_(this).DrawFlipped(context, image, plan.GetSourceX()-column.start, plan.GetSourceY()-row.start, image.width, image.height, flipX, flipY);
		let base64=canvas.toDataURL('image/png').split(',')[1];
		canvas.width=0;
		canvas.height=0;
		return base64;
	};

	_['private'].PickMarkerColor=function (overview, cv) {
		let source=cv.imread(overview);
		let mask=new cv.Mat(source.rows, source.cols, cv.CV_8UC1);
		let images=new cv.MatVector();
		let histogram=new cv.Mat();
		try {
			for (let index=0; index<mask.data.length; index++) {
				mask.data[index]=source.data[index*4+3];
			}
			images.push_back(source);
			cv.calcHist(images, [0, 1, 2], mask, histogram, [16, 16, 16], [0, 256, 0, 256, 0, 256]);
			let occupied=[];
			for (let index=0; index<histogram.data32F.length; index++) {
				let count=histogram.data32F[index];
				if (count) {
					occupied.push({red: Math.floor(index/256)*16+8, green: Math.floor(index/16)%16*16+8, blue: index%16*16+8, count});
				}
			}
			let selected=[255, 0, 255];
			let bestPenalty=Infinity;
			let bestDistance=-Infinity;
			for (let red=8; red<256; red+=16) {
				for (let green=8; green<256; green+=16) {
					for (let blue=8; blue<256; blue+=16) {
						let penalty=0;
						let totalDistance=0;
						for (let item of occupied) {
							let distance=(red-item.red)**2+(green-item.green)**2+(blue-item.blue)**2;
							penalty+=item.count*Math.max(0, 16384-distance);
							totalDistance+=item.count*distance;
						}
						if ((penalty<bestPenalty)||(penalty===bestPenalty)&&(totalDistance>bestDistance)) {
							selected=[red, green, blue];
							bestPenalty=penalty;
							bestDistance=totalDistance;
						}
					}
				}
			}
			return selected.map((value)=>value.toString(16).padStart(2, '0')).join('');
		}
		finally {
			histogram.delete();
			images.delete();
			mask.delete();
			source.delete();
		}
	};

	_['private'].CreateOverviewInput=function (overview, column, row, sourceWidth, sourceHeight, markerColor, flipX, flipY) {
		let canvas=_(this).CreateCanvas(overview.width, overview.height);
		let context=canvas.getContext('2d');
		context.drawImage(overview, 0, 0);
		let left=Math.floor(column.start*canvas.width/sourceWidth);
		let right=Math.ceil(column.end*canvas.width/sourceWidth);
		let top=Math.floor(row.start*canvas.height/sourceHeight);
		let bottom=Math.ceil(row.end*canvas.height/sourceHeight);
		context.strokeStyle='#'+markerColor;
		context.lineWidth=1;
		context.strokeRect(left+0.5, top+0.5, right-left-1, bottom-top-1);
		let output=canvas;
		if ((flipX)||(flipY)) {
			output=_(this).CreateCanvas(canvas.width, canvas.height);
			_(this).DrawFlipped(output.getContext('2d'), canvas, 0, 0, canvas.width, canvas.height, flipX, flipY);
		}
		let base64=output.toDataURL('image/png').split(',')[1];
		output.width=0;
		output.height=0;
		if (output!==canvas) {
			canvas.width=0;
			canvas.height=0;
		}
		return base64;
	};

	_['private'].CreateMask=function (context, axis, index, horizontal) {
		let current=axis[index];
		let previous=axis[index-1];
		let next=axis[index+1];
		let length=current.width;
		let gradient=context.createLinearGradient(0, 0, horizontal?length:0, horizontal?0:length);
		gradient.addColorStop(0, previous?'rgba(0,0,0,0)':'rgba(0,0,0,1)');
		if (previous) {
			gradient.addColorStop((previous.end-current.start)/length, 'rgba(0,0,0,1)');
		}
		if (next) {
			gradient.addColorStop((next.start-current.start)/length, 'rgba(0,0,0,1)');
		}
		gradient.addColorStop(1, next?'rgba(0,0,0,0)':'rgba(0,0,0,1)');
		context.fillStyle=gradient;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	};

	_['private'].ScaleAxis=function (axis, scale) {
		return axis.map(function (item) {
			let start=Math.round(item.start*scale);
			let end=Math.round(item.end*scale);
			return {start, end, width: end-start};
		});
	};

	_['private'].MaskChunk=function (canvas, columns, rows, columnIndex, rowIndex) {
		let $this=_(this);
		let context=canvas.getContext('2d');
		context.globalCompositeOperation='destination-in';
		$this.CreateMask(context, columns, columnIndex, true);
		$this.CreateMask(context, rows, rowIndex, false);
		return canvas;
	};

	_['private'].RenderChunk=function (image, generated, columns, rows, columnIndex, rowIndex, outputWidth, outputHeight) {
		let $this=_(this);
		let column=columns[columnIndex];
		let row=rows[rowIndex];
		let canvas=$this.CreateCanvas(column.width, row.width);
		let context=canvas.getContext('2d');
		if (generated) {
			let plan=generated.plan;
			let result=generated.image;
			context.drawImage(
				result,
				plan.GetSourceX()*result.width/plan.GetTargetWidth(),
				plan.GetSourceY()*result.height/plan.GetTargetHeight(),
				generated.width*result.width/plan.GetTargetWidth(),
				generated.height*result.height/plan.GetTargetHeight(),
				0,
				0,
				canvas.width,
				canvas.height
			);
		}
		else {
			context.drawImage(image, -column.start, -row.start, outputWidth, outputHeight);
		}
		return $this.MaskChunk(canvas, columns, rows, columnIndex, rowIndex);
	};

	_['private'].PreparePanel=function (image, overview, markerColor, columns, rows, columnIndex, rowIndex, aspectRatio) {
		let $this=_(this);
		let column=columns[columnIndex];
		let row=rows[rowIndex];
		let bucket=FlowImageService.Bucket[aspectRatio];
		let plan=new FlowImageService.PaddingPlan(column.width, row.width, aspectRatio, bucket);
		let flipX=Math.random()<0.5;
		let flipY=Math.random()<0.5;
		return {
			column,
			row,
			plan,
			flipX,
			flipY
			, localBase64: $this.CreateInput(image, column, row, plan, flipX, flipY)
			, overviewBase64: $this.CreateOverviewInput(overview, column, row, image.width, image.height, markerColor, flipX, flipY),
			rowIndex,
			columnIndex
		};
	};

	_['private'].CheckPanel=function (localImage, generated, cv) {
		let mats=[];
		try {
			let source=cv.imread(localImage);
			mats.push(source);
			let result=cv.imread(generated);
			mats.push(result);
			let resized=new cv.Mat();
			let sourceGray=new cv.Mat();
			let resultGray=new cv.Mat();
			let sourceEdges=new cv.Mat();
			let resultEdges=new cv.Mat();
			let expandedSource=new cv.Mat();
			let expandedResult=new cv.Mat();
			let similarity=new cv.Mat();
			let kernel=cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
			mats.push(resized, sourceGray, resultGray, sourceEdges, resultEdges, expandedSource, expandedResult, similarity, kernel);
			cv.resize(source, resized, new cv.Size(generated.width, generated.height), 0, 0, cv.INTER_LINEAR);
			cv.cvtColor(resized, sourceGray, cv.COLOR_RGBA2GRAY);
			cv.cvtColor(result, resultGray, cv.COLOR_RGBA2GRAY);
			cv.GaussianBlur(sourceGray, sourceGray, new cv.Size(5, 5), 0);
			cv.GaussianBlur(resultGray, resultGray, new cv.Size(5, 5), 0);
			cv.Canny(sourceGray, sourceEdges, 50, 150);
			cv.Canny(resultGray, resultEdges, 50, 150);
			if (cv.countNonZero(sourceEdges)<32) {
				return 1;
			}
			cv.dilate(sourceEdges, expandedSource, kernel);
			cv.dilate(resultEdges, expandedResult, kernel);
			cv.matchTemplate(expandedSource, expandedResult, similarity, cv.TM_CCORR_NORMED);
			return similarity.data32F[0];
		}
		finally {
			for (let mat of mats) {
				mat.delete();
			}
		}
	};

	_['private'].GeneratePanel=async function (image, prepared, markerColor, aspectRatio, options, cancellation, cv) {
		let $this=_(this);
		let {column, row, plan, flipX, flipY, rowIndex, columnIndex}=prepared;
		let sourceName=options.SourceName||'Untitled Image';
		let [local, global]=await Promise.all([
			Flow.upload({
				base64: prepared.localBase64
				, mimeType: 'image/png'
				, name: `[${rowIndex+1}, ${columnIndex+1}] ${sourceName}`
			}),
			Flow.upload({
				base64: prepared.overviewBase64
				, mimeType: 'image/png'
				, name: sourceName
			})
		]);
		if (cancellation.cancelled) {
			throw new DOMException('Generation cancelled', 'AbortError');
		}
		let localImage=await $this.LoadImage('data:image/png;base64,'+prepared.localBase64);
		prepared.localBase64=null;
		prepared.overviewBase64=null;
		let bucket=FlowImageService.Bucket[aspectRatio];
		let count=options.Resolution==='2K'?2:options.Resolution==='8K'?8:4;
		let outputWidth=bucket.GetPixelWidth()*2*count;
		let outputHeight=bucket.GetPixelHeight()*2*count;
		let imageSize1=`${Math.round(plan.GetTargetWidth()*outputWidth/image.width)}\xD7${Math.round(plan.GetTargetHeight()*outputHeight/image.height)}`;
		let imageSize2=`${outputWidth}\xD7${outputHeight}`;
		let bestGenerated=null;
		let bestScore=-Infinity;
		let lastError=null;
		for (let attempt=1; attempt<=3; attempt++) {
			if (cancellation.cancelled) {
				throw new DOMException('Generation cancelled', 'AbortError');
			}
			let generated;
			try {
				let result=await Flow.generate.image({
					prompt: `
嚴格禁止以任何言語描述影像為提示而僅得完全維持所有元素不得增減並以 imageEdit 方式進行圖像運算而將 [參考影像2] 放大為 ${imageSize2} 使物件與物件之間有明確的邊界感，並有 hyper realistic 的細節紋理、表面細節等並剪裁出 #${markerColor} 所標示區域直到與 [參考影像1] 像素對齊程度而輸出剪裁後寬高為 ${imageSize1} 的影像，此精確等分 crop 絕不可能多容納原本不在 [參考影像1] 範圍之內容，即使是周圍區域的半粒沙出界也嚴格維持硬性剪裁而不可能成為整粒沙進入不在原剪裁範圍內的區域。
`,
					referenceImageMediaIds: [local.mediaId, global.mediaId],
					aspectRatio
					, modelDisplayName: options.ModelDisplayName
				});
				if (cancellation.cancelled) {
					throw new DOMException('Generation cancelled', 'AbortError');
				}
				let content=result.base64&&result.mimeType?result:await Flow.media.getBase64({mediaId: result.mediaId});
				if (cancellation.cancelled) {
					throw new DOMException('Generation cancelled', 'AbortError');
				}
				generated=await $this.LoadImage(`data:${content.mimeType};base64,${content.base64}`);
			}
			catch (error) {
				if ((cancellation.cancelled)||(error?.name==='AbortError')) {
					throw error;
				}
				lastError=error;
				continue;
			}
			if (cancellation.cancelled) {
				throw new DOMException('Generation cancelled', 'AbortError');
			}
			let score=-Infinity;
			try {
				score=$this.CheckPanel(localImage, generated, cv);
			}
			catch (error) {
				lastError=error;
			}
			if (!Number.isFinite(score)) {
				score=-Infinity;
			}
			if ((!bestGenerated)||(score>bestScore)) {
				bestGenerated=generated;
				bestScore=score;
			}
			if (score>=0.3) {
				break;
			}
		}
		if (cancellation.cancelled) {
			throw new DOMException('Generation cancelled', 'AbortError');
		}
		if (!bestGenerated) {
			throw lastError||new Error('No usable panel was generated');
		}
		if ((flipX)||(flipY)) {
			let restored=$this.CreateCanvas(bestGenerated.width, bestGenerated.height);
			$this.DrawFlipped(restored.getContext('2d'), bestGenerated, 0, 0, bestGenerated.width, bestGenerated.height, flipX, flipY);
			bestGenerated=restored;
		}
		return {image: bestGenerated, plan, width: column.width, height: row.width};
	};

	_['private'].GenerateTiled=async function (x, options, cancellation) {
		let $this=_(this);
		if ((!cv)||(!cv.Mat)||(!cv.MatVector)||(!cv.calcHist)||(!cv.matchTemplate)||(!cv.Canny)||(!cv.dilate)||(!cv.imread)) {
			throw new Error('OpenCV.js is unavailable');
		}
		if (!x.HasDrawnContent()) {
			throw new Error('Tiled generation requires an image in the editor');
		}
		let dimensions=x.GetDimensions();
		let width=Math.round(dimensions.Width);
		let height=Math.round(dimensions.Height);
		let count=options.Resolution==='2K'?2:options.Resolution==='8K'?8:4;
		if ((width<count)||(height<count)) {
			throw new Error('Image is too small for tiled generation');
		}
		let image=await $this.LoadImage(x.GetCanvasData());
		let sourcePlan=$this.FindBucket(width, height, options.AspectRatio||'original');
		let aspectRatio=sourcePlan.GetAspectRatio();
		let bucket=FlowImageService.Bucket[aspectRatio];
		let padded=$this.CreateCanvas(sourcePlan.GetTargetWidth(), sourcePlan.GetTargetHeight());
		padded.getContext('2d').drawImage(image, sourcePlan.GetSourceX(), sourcePlan.GetSourceY(), width, height);
		let paddedImage=await $this.LoadImage(padded.toDataURL('image/png'));
		let nativeWidth=bucket.GetPixelWidth()*count;
		let nativeHeight=bucket.GetPixelHeight()*count;
		let columns=$this.CreateAxis(padded.width, nativeWidth, count);
		let rows=$this.CreateAxis(padded.height, nativeHeight, count);
		let overviewScale=256/Math.min(padded.width, padded.height);
		let overviewWidth=Math.max(1, Math.round(padded.width*overviewScale));
		let overviewHeight=Math.max(1, Math.round(padded.height*overviewScale));
		let overview=$this.CreateCanvas(overviewWidth, overviewHeight);
		overview.getContext('2d').drawImage(paddedImage, 0, 0, overview.width, overview.height);
		let markerColor=$this.PickMarkerColor(overview, cv);
		let total=count*count;
		let preparedPanels=Array(total);
		let batches=[[], []];
		let generatedPanels=Array(total).fill(null);
		let failedPanels=[];
		let native=null;
		try {
			for (let index=0; index<total; index++) {
				if (cancellation.cancelled) {
					throw new DOMException('Generation cancelled', 'AbortError');
				}
				let row=Math.floor(index/count);
				let column=index%count;
				preparedPanels[index]=$this.PreparePanel(paddedImage, overview, markerColor, columns, rows, column, row, aspectRatio);
				batches[(row+column)%2].push(index);
			}
			for (let batch of batches) {
				for (let index=batch.length-1; index>0; index--) {
					let target=Math.floor(Math.random()*(index+1));
					[batch[index], batch[target]]=[batch[target], batch[index]];
				}
			}
			for (let batch of batches) {
				if (cancellation.cancelled) {
					throw new DOMException('Generation cancelled', 'AbortError');
				}
				let jobs=[];
				for (let index of batch) {
					let row=Math.floor(index/count);
					let column=index%count;
					jobs.push(
						$this.GeneratePanel(paddedImage, preparedPanels[index], markerColor, aspectRatio, options, cancellation, cv).then(
							function (panel) {
								if (!cancellation.cancelled) generatedPanels[index]=panel;
							},
							function (error) {
								if (!cancellation.cancelled)
									failedPanels.push(`${row+1}-${column+1}: ${error instanceof Error?error.message:String(error)}`);
							}
						)
					);
				}
				await Promise.all(jobs);
			}
			if (cancellation.cancelled) {
				throw new DOMException('Generation cancelled', 'AbortError');
			}
			if (failedPanels.length>0) {
				console.warn('Tiled generation used source-image fallback for:', failedPanels);
			}
			let scaledColumns=$this.ScaleAxis(columns, nativeWidth/padded.width);
			let scaledRows=$this.ScaleAxis(rows, nativeHeight/padded.height);
			native=$this.CreateCanvas(nativeWidth, nativeHeight);
			let context=native.getContext('2d');
			context.globalCompositeOperation='lighter';
			for (let index=0; index<total; index++) {
				let row=Math.floor(index/count);
				let column=index%count;
				let panel=$this.RenderChunk(paddedImage, generatedPanels[index], scaledColumns, scaledRows, column, row, nativeWidth, nativeHeight);
				try {
					context.drawImage(panel, scaledColumns[column].start, scaledRows[row].start);
				}
				finally {
					let generatedImage=generatedPanels[index]?.image;
					if (generatedImage instanceof HTMLCanvasElement) {
						generatedImage.width=0;
						generatedImage.height=0;
					}
					panel.width=0;
					panel.height=0;
					generatedPanels[index]=null;
				}
			}
			let dataUrl=native.toDataURL('image/png');
			if (!dataUrl.startsWith('data:image/png;base64,')) {
				throw new Error('Unable to encode the generated image');
			}
			let base64=dataUrl.split(',')[1];
			if (cancellation.cancelled) {
				throw new DOMException('Generation cancelled', 'AbortError');
			}
			return new RefinedImage({
				Id: crypto.randomUUID()
				, DataUrl: dataUrl
				, Base64: base64
				, SketchBase64: ''
				, Prompt: options.Prompt
				, Timestamp: Date.now()
				, Status: 'ready'
				, Model: options.ModelDisplayName
			});
		}
		finally {
			if (native) {
				native.width=0;
				native.height=0;
			}
			padded.width=0;
			padded.height=0;
			overview.width=0;
			overview.height=0;
			for (let panel of generatedPanels) {
				if (panel?.image instanceof HTMLCanvasElement) {
					panel.image.width=0;
					panel.image.height=0;
				}
			}
			preparedPanels.fill(null);
			generatedPanels.fill(null);
		}
	};
	_['private'].BaseGenerate=_['public'].Generate;
	_['private'].m_activeGeneration=null;

	_['public'].CancelGeneration=function () {
		let cancellation=_(this).m_activeGeneration;
		if ((!cancellation)||(cancellation.cancelled)) {
			return;
		}
		cancellation.cancelled=true;
		cancellation.notify();
	};
	'@@override';

	_['public'].Generate=async function (x, options) {
		let $this=_(this);
		let resolution=options.Resolution||'Default';
		if ((resolution!=='Default')&&(resolution!=='2K')&&(resolution!=='4K')&&(resolution!=='8K')) {
			throw new Error('Unsupported output resolution: '+resolution);
		}
		let cancellation={cancelled: false, notify: null};
		let cancelled=new Promise(function (resolve) {
			cancellation.notify=resolve;
		});
		$this.m_activeGeneration=cancellation;
		try {
			let operation=resolution==='Default'?$this.BaseGenerate.call(this, x, options):$this.GenerateTiled(x, options, cancellation);
			let result=await Promise.race([
				operation,
				cancelled.then(function () {
					throw new DOMException('Generation cancelled', 'AbortError');
				})
			]);
			if (cancellation.cancelled) {
				throw new DOMException('Generation cancelled', 'AbortError');
			}
			return result;
		}
		finally {
			if ($this.m_activeGeneration===cancellation) {
				$this.m_activeGeneration=null;
			}
		}
	};
});
