
var FlowImageService=Function.extend(Object, function () {
	var _=this(FlowImageService);
	FlowImageService=_[FlowImageService];
	var Bucket=Function.extend(Object, function () {
		var _=this(Bucket);
		Bucket=_[Bucket];
		function Bucket(width, height) {
			_['base'].apply(this, arguments);
			let $this=_(this);
			let left=width;
			let right=height;
			while (right!==0) {
				let remainder=left%right;
				left=right;
				right=remainder;
			}
			$this.m_width=width/left;
			$this.m_height=height/left;
			$this.m_pixelWidth=width;
			$this.m_pixelHeight=height;
		}

		_['public'].GetWidth=function () {
			return _(this).m_width;
		};

		_['public'].GetHeight=function () {
			return _(this).m_height;
		};

		_['public'].GetPixelWidth=function () {
			return _(this).m_pixelWidth;
		};

		_['public'].GetPixelHeight=function () {
			return _(this).m_pixelHeight;
		};
		_['private'].m_width=0;
		_['private'].m_height=0;
		_['private'].m_pixelWidth=0;
		_['private'].m_pixelHeight=0;
	});
	Bucket['1:1']=new Bucket(1024, 1024);
	Bucket['1:4']=new Bucket(512, 2048);
	Bucket['1:8']=new Bucket(384, 3072);
	Bucket['2:3']=new Bucket(848, 1264);
	Bucket['3:2']=new Bucket(1264, 848);
	Bucket['3:4']=new Bucket(896, 1200);
	Bucket['4:1']=new Bucket(2048, 512);
	Bucket['4:3']=new Bucket(1200, 896);
	Bucket['4:5']=new Bucket(928, 1152);
	Bucket['5:4']=new Bucket(1152, 928);
	Bucket['8:1']=new Bucket(3072, 384);
	Bucket['9:16']=new Bucket(768, 1376);
	Bucket['16:9']=new Bucket(1376, 768);
	Bucket['21:9']=new Bucket(1584, 672);
	var PaddingPlan=Function.extend(Object, function () {
		var _=this(PaddingPlan);
		PaddingPlan=_[PaddingPlan];
		function PaddingPlan(sourceWidth, sourceHeight, aspectRatio, bucket) {
			_['base'].apply(this, arguments);
			let $this=_(this);
			$this.m_sourceWidth=sourceWidth;
			$this.m_sourceHeight=sourceHeight;
			$this.m_aspectRatio=aspectRatio;
			let width=bucket.GetWidth();
			let height=bucket.GetHeight();
			let envelopeWidth=sourceWidth+sourceWidth%2;
			let envelopeHeight=sourceHeight+sourceHeight%2;
			if (envelopeWidth*height>=envelopeHeight*width) {
				$this.m_targetWidth=envelopeWidth;
				$this.m_targetHeight=Math.ceil(envelopeWidth*height/width);
				if ($this.m_targetHeight%2!==envelopeHeight%2) {
					$this.m_targetHeight++;
				}
			}
			else {
				$this.m_targetHeight=envelopeHeight;
				$this.m_targetWidth=Math.ceil(envelopeHeight*width/height);
				if ($this.m_targetWidth%2!==envelopeWidth%2) {
					$this.m_targetWidth++;
				}
			}
			$this.m_sourceX=Math.floor(($this.m_targetWidth-sourceWidth)/2);
			$this.m_sourceY=0;
		}

		_['public'].GetAspectRatio=function () {
			return _(this).m_aspectRatio;
		};

		_['public'].GetTargetWidth=function () {
			return _(this).m_targetWidth;
		};

		_['public'].GetTargetHeight=function () {
			return _(this).m_targetHeight;
		};

		_['public'].GetSourceWidth=function () {
			return _(this).m_sourceWidth;
		};

		_['public'].GetSourceHeight=function () {
			return _(this).m_sourceHeight;
		};

		_['public'].GetSourceX=function () {
			return _(this).m_sourceX;
		};

		_['public'].GetSourceY=function () {
			return _(this).m_sourceY;
		};

		_['public'].CompareTo=function (value) {
			let $this=_(this);
			return $this.m_targetWidth*$this.m_targetHeight-value.GetTargetWidth()*value.GetTargetHeight();
		};
		_['private'].m_sourceWidth=0;
		_['private'].m_sourceHeight=0;
		_['private'].m_aspectRatio=null;
		_['private'].m_targetWidth=0;
		_['private'].m_targetHeight=0;
		_['private'].m_sourceX=0;
		_['private'].m_sourceY=0;
	});
	function FlowImageService() {
		_['base'].apply(this, arguments);
	}

	_['public'].Save=async function (x) {
		let json={
			base64: x.GetCanvasData().split(',')[1]
			, mimeType: 'image/png'
			, name: 'Flower Sketch Export'
		};
		await Flow.save(json);
	};

	_['private'].GetPaddingPlan=function (width, height, aspectRatioValue) {
		let aspectRatios='original'===aspectRatioValue?Object.keys(Bucket).filter(function (key) {
			return Bucket[key] instanceof Bucket;
		}):[aspectRatioValue];
		let plans=[];
		for (let aspectRatio of aspectRatios) {
			let bucket=Bucket[aspectRatio];
			if (!(bucket instanceof Bucket)) {
				continue;
			}
			let plan=new PaddingPlan(width, height, aspectRatio, bucket);
			plans.push(plan);
		}
		if (plans.length===0) {
			throw new Error('No image bucket can contain the source without cropping');
		}
		plans.sort(function (left, right) {
			return left.CompareTo(right);
		});
		return plans[0];
	};

	_['private'].LoadImage=async function (dataUrl) {
		return await new Promise(function (resolve, reject) {
			let image=new Image();

			image.onload=function () {
				resolve(image);
			};

			image.onerror=function () {
				reject(new Error('Unable to prepare the generation image'));
			};
			image.src=dataUrl;
		});
	};

	_['private'].CreatePaddedImage=async function (dataUrl, plan) {
		let $this=_(this);
		let image=await $this.LoadImage(dataUrl);
		let canvas=document.createElement('canvas');
		canvas.width=plan.GetTargetWidth();
		canvas.height=plan.GetTargetHeight();
		let context=canvas.getContext('2d');
		if (!context) {
			throw new Error('Unable to create the generation canvas');
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(image, plan.GetSourceX(), plan.GetSourceY(), plan.GetSourceWidth(), plan.GetSourceHeight());
		return canvas.toDataURL('image/png').split(',')[1];
	};

	_['public'].Generate=async function (x, options) {
		let $this=_(this);
		let sketchBase64='';
		let referenceImageMediaIds=[];
		let dimensions=x.GetDimensions();
		let sourceWidth=Math.max(1, Math.round(dimensions.Width));
		let sourceHeight=Math.max(1, Math.round(dimensions.Height));
		let plan=$this.GetPaddingPlan(sourceWidth, sourceHeight, options.AspectRatio);
		let aspectRatio=plan.GetAspectRatio();
		if (!x.HasDrawnContent()) {
			referenceImageMediaIds=[...new Set(options.ReferenceMediaIds)];
		}
		else {
			sketchBase64=await $this.CreatePaddedImage(x.GetCanvasData(), plan);
			let uploaded=await Flow.upload({
				base64: sketchBase64
				, mimeType: 'image/png'
				, name: 'Sketch Input'
			});
			referenceImageMediaIds=[uploaded.mediaId, ...new Set(options.ReferenceMediaIds)];
		}
		let result=await Flow.generate.image({
			prompt: options.Prompt,
			referenceImageMediaIds,
			aspectRatio
			, modelDisplayName: options.ModelDisplayName
		});
		return new RefinedImage({
			Id: result.mediaId||crypto.randomUUID()
			, DataUrl: `data:${result.mimeType};base64,${result.base64}`
			, Base64: result.base64
			, SketchBase64: sketchBase64
			, Prompt: options.Prompt
			, Timestamp: Date.now()
			, Status: 'ready'
			, Model: options.ModelDisplayName
		});
	};
	FlowImageService.Bucket=Bucket;
	FlowImageService.PaddingPlan=PaddingPlan;
});
