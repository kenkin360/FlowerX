
var AppActions=Function.extend(Object, function () {
	var _=this(AppActions);
	AppActions=_[AppActions];
	function AppActions() {
		_['base'].apply(this, arguments);
		_(this).m_context=null;
		_(this).m_service=new ImageGenerationService();
	}

	_['public'].SetContext=function (context) {
		_(this).m_context=context;
	};

	_['public'].GetContext=function () {
		return _(this).m_context;
	};

	_['public'].CanGenerate=function () {
		let context=this.GetContext();
		return (context.Resolution!=='Default'?!context.IsCanvasEmpty:!!context.Prompt.trim()||!context.IsCanvasEmpty||context.ReferenceMediaIds.length>0)&&!context.IsGenerating&&!context.IsCanvasBusy&&!_(this).m_isGenerating;
	};

	_['public'].SelectTool=function (tool) {
		let context=this.GetContext();
		let toolBar=context.ToolBar;
		let toolObj=typeof tool==='string'?toolBar?.GetById(tool):tool?.Id?tool:toolBar?.GetById(String(tool));
		if (!toolObj) {
			return;
		}
		let toolId=toolObj.Id;
		let currentId=context.Tool?context.Tool.Id||String(context.Tool):'';
		if ((context.IsCanvasBusy)&&(toolId!==currentId)) {
			return;
		}
		let hasSettings=toolObj.HasBrushSize||toolObj.HasColor||toolObj.HasProportionConstraint||toolObj.HasSprayMode;
		if ((toolId===currentId)&&(hasSettings)) {
			context.SetIsSettingsOpen(!context.IsSettingsOpen);
		}
		else {
			context.SetTool(toolObj);
			context.SetIsSettingsOpen(hasSettings);
		}
		setTimeout(function () {
			let rect=context.ToolRefs.current[toolId]?.getBoundingClientRect();
			if (rect) {
				context.SetSettingsAnchor(rect);
			}
		}, 0);
	};

	_['public'].ExecuteCanvasCommand=function (command) {
		let context=this.GetContext();
		let workspace=context.WorkspaceRef.current;
		if (!workspace) {
			return;
		}
		switch (command) {
			case 'Clear':
				if (typeof workspace.Clear==='function') {
					workspace.Clear();
				}
				else {
					workspace.Document.Clear();
				}
				context.SetHasInteracted(false);
				break;
			case 'Undo':
				workspace.Tools.Undo();
				break;
			case 'Redo':
				workspace.Document.History?.Redo();
				break;
			case 'CancelDrawing':
				workspace.Tools.CancelDrawing();
				break;
			case 'DeleteSelected':
				workspace.Clipboard?.DeleteSelected();
				break;
			case 'Copy':
				workspace.Clipboard?.Copy();
				break;
			case 'Paste':
				workspace.Clipboard?.Paste();
				break;
			case 'Duplicate':
				workspace.Clipboard?.Duplicate();
				break;
			case 'BringForward':
				workspace.Clipboard?.BringForward();
				break;
			case 'SendBackwards':
				workspace.Clipboard?.SendBackwards();
				break;
			case 'FlipHorizontal':
				workspace.Clipboard?.FlipHorizontal();
				break;
			case 'FlipVertical':
				workspace.Clipboard?.FlipVertical();
				break;
		}
	};

	_['public'].Save=async function () {
		let context=this.GetContext();
		let workspace=context.WorkspaceRef.current;
		if ((!workspace)||(String(context.SaveState)!=='idle')) {
			return;
		}
		context.SetSaveState(SaveState.Saving);
		try {
			await _(this).m_service.Save(workspace.Document);
			context.SetSaveState(SaveState.Saved);
			setTimeout(()=>context.SetSaveState(SaveState.Idle), 2e3);
		}
		catch (error) {
			console.error('Failed to save:', error);
			context.SetSaveState(SaveState.Error);
			setTimeout(()=>context.SetSaveState(SaveState.Idle), 3e3);
		}
	};

	_['public'].Open=function () {
		let context=this.GetContext();
		if (context.IsCanvasBusy) {
			return;
		}
		context.OnOpen?.();
	};

	_['public'].Load=function () {
		let context=this.GetContext();
		if (context.IsCanvasBusy) {
			return;
		}
		context.OnLoad?.();
	};

	_['public'].ExportJSON=async function () {
		let context=this.GetContext();
		if (context.SetIsExportingJSON) {
			context.SetIsExportingJSON(true);
		}
		try {
			let sourceUrl=context.HostSourceUrl;
			let prefix='data:text/javascript;base64,';
			if ((!sourceUrl)||(!sourceUrl.startsWith(prefix))) {
				throw new Error('Bundled source URL is unavailable');
			}
			await Flow.download({
				base64: sourceUrl.slice(prefix.length)
				, mimeType: 'text/plain'
				, filename: 'App.txt'
			});
		}
		catch (error) {
			console.error('Failed to download bundled source:', error);
		}
		finally {
			setTimeout(()=>{
				if (context.SetIsExportingJSON) {
					context.SetIsExportingJSON(false);
				}
			}, 800);
		}
	};

	_['public'].DownloadImage=async function () {
		let context=this.GetContext();
		let document2=context.WorkspaceRef.current?.Document;
		if ((!document2)||(context.IsCanvasBusy)||(context.IsDownloadingImage)) {
			return;
		}
		context.SetIsDownloadingImage(true);
		context.OnError(null);
		try {
			let dataUrl=document2.GetCanvasData();
			let prefix='data:image/png;base64,';
			if (!dataUrl.startsWith(prefix)) {
				throw new Error('Unable to export the editor image as PNG');
			}
			let dimensions=document2.GetDimensions();
			await Flow.download({
				base64: dataUrl.slice(prefix.length)
				, mimeType: 'image/png'
				, filename: `Flower_${Math.round(dimensions.Width)}x${Math.round(dimensions.Height)}_${crypto.randomUUID()}.png`
			});
		}
		catch (error) {
			console.error('Failed to download editor image:', error);
			context.OnError(error);
		}
		finally {
			context.SetIsDownloadingImage(false);
		}
	};

	_['public'].CancelGeneration=function () {
		_(this).m_service.CancelGeneration();
	};

	_['public'].Refine=async function () {
		let context=this.GetContext();
		let workspace=context.WorkspaceRef.current;
		if ((!workspace)||(!this.CanGenerate())) {
			return;
		}
		_(this).m_isGenerating=true;
		context.OnError(null);
		context.OnGenerationProgress({
			Stage: 'Generating image'
			, Completed: 0
			, Total: null
		});
		context.SetIsGenerating(true);
		try {
			let result=await _(this).m_service.Generate(workspace.Document, context);
			await context.OnGenerated(result);
		}
		catch (error) {
			if (error?.name!=='AbortError') {
				console.error('Generation failed:', error);
				context.OnError(error);
			}
		}
		finally {
			_(this).m_isGenerating=false;
			context.SetIsGenerating(false);
			context.OnGenerationProgress(null);
		}
	};
	_['private'].m_isGenerating=false;
	_['private'].m_context=null;
	_['private'].m_service=null;
});
