
var Editor=Function.extend(React.Component, function () {
	var _=this(Editor);
	Editor=_[Editor];
	_['public'].state=null;
	Editor.ButtonBase='tool-button relative w-[36px] h-[36px] flex items-center justify-center rounded-md transition-colors duration-150';
	Editor.ButtonActive='bg-[#0078d4] text-white shadow-sm';
	Editor.ButtonIdle='text-[#aaaaaa] hover:bg-white/10 hover:text-white';
	Editor.ButtonDisabled='opacity-25 cursor-not-allowed grayscale';
	Editor.TemplateMarkup={
		__html: editorTemplate
	};

	Editor.SelectFlowImage=function () {
		return Flow.media.select({filter: 'image' });
	};

	Editor.SelectLocalFile=function (callback) {
		let input=document.createElement('input');
		input.type='file';
		input.accept='image/*';
		input.addEventListener('change', function () {
			let file=input.files?.[0];
			input.remove();
			if (file) {
				callback(file);
			}
		}, {once: true});
		input.addEventListener('cancel', function () {
			input.remove();
		}, {once: true});
		document.body.appendChild(input);
		input.click();
	};
	function Editor(props) {
		_['base'].apply(this, arguments);
		let $this=_(this);
		$this.m_component=this;
		$this.Initialize();
	}

	_['private'].Initialize=function () {
		let $this=_(this);
		$this.m_toolBar=new ToolBar();
		[
			new PickTool(),
			new RectSelectTool(),
			new EyedropperTool(),
			new FillTool(),
			new PencilTool(),
			new SprayTool(),
			new LineTool(),
			new BezierTool(),
			new RectangleTool(),
			new EllipseTool(),
			new TextTool()
		].forEach((tool)=>$this.m_toolBar.Register(tool));
		let defaultTool=$this.m_toolBar.GetById('pencil')||$this.m_toolBar.GetTools()[0];
		$this.m_component.state={
			tool: defaultTool
			, sprayMode: SprayMode.Noise
			, color: Color.Red
			, brushSize: 8
			, constrainProportions: false
			, isShortcutsExpanded: false
			, isCanvasEmpty: true
			, isCanvasBusy: false
			, isGenerating: false
			, generationProgress: null
			, isDownloadingImage: false
			, saveState: SaveState.Idle
			, settingsAnchor: null
			, isSettingsOpen: false
			, hasInteracted: false
		};
		$this.m_toolRefs={
			current: {}
		};
		$this.m_workspaceRef={
			current: null
		};
		$this.m_rootRef=React.createRef();
		$this.m_containerRef=React.createRef();
		$this.m_canvasElementRef=React.createRef();
		$this.m_settingsPanelRef=React.createRef();
		$this.m_actions=new AppActions();
		$this.m_keyboard=new KeyboardCommands($this.m_actions);
		$this.m_settingsActions=new ToolSettingsActions($this.m_actions, $this.m_settingsPanelRef);
		$this.m_nodeCache=new Map();
		$this.m_sourceName='';
		$this.m_actionMap=new Map();
		$this.m_actionButtons=new Map();
		$this.m_colorButtons=null;
		$this.m_colorOptions=null;
	};

	_['private'].SetStateValue=function (name, value) {
		let component=_(this).m_component;
		if (component.state[name]===value) {
			return;
		}
		component.setState({
			[name]: value
		});
	};

	_['private'].SetTitle=function (title) {
		_(this).m_sourceName=title||'';
		_(this).m_component.props.onTitleChange?.(title);
	};

	_['private'].LoadImageData=async function (dataUrl, title) {
		let workspace=_(this).m_workspaceRef.current;
		if ((!workspace)||(_(this).m_component.state.isCanvasBusy)) {
			return false;
		}
		workspace.Document.Clear();
		await workspace.Document.AddImage(dataUrl, true);
		if (!workspace.Document.HasImportedImage) {
			return false;
		}
		_(this).SetTitle(title);
		_(this).SetStateValue('hasInteracted', true);
		return true;
	};

	_['private'].FindNode=function (selector) {
		let $this=_(this);
		let node=$this.m_nodeCache.get(selector);
		if (!node) {
			node=new HtmlNode($this.m_rootRef.current?.querySelector(selector));
			$this.m_nodeCache.set(selector, node);
		}
		return node;
	};

	_['private'].Node=function (role) {
		return _(this).FindNode(`[data-role="${role}"]`);
	};

	_['private'].Field=function (name) {
		return _(this).FindNode(`[data-input="${name}"]`);
	};

	_['private'].ActionNode=function (name) {
		return _(this).FindNode(`[data-action="${name}"]`);
	};

	_['private'].UpdateTools=function () {
		let $this=_(this);
		let workspace=$this.m_workspaceRef.current;
		if (!workspace) {
			return;
		}
		let state=$this.m_component.state;
		workspace.Tools.UpdateProperties({
			Tool: state.tool
			, SprayMode: state.sprayMode
			, Color: state.color
			, BrushSize: state.brushSize
			, ConstrainProportions: state.constrainProportions
		});
	};

	_['private'].UpdateActionContext=function () {
		let $this=_(this);
		let state=$this.m_component.state;
		$this.m_actions.SetContext({
			ToolBar: $this.m_toolBar
			, Tool: state.tool
			, SetTool: (value)=>$this.SetStateValue('tool', value)
			, ToolRefs: $this.m_toolRefs
			, WorkspaceRef: $this.m_workspaceRef
			, SourceName: $this.m_sourceName||'Untitled Image'
			, IsCanvasBusy: state.isCanvasBusy
			, IsCanvasEmpty: state.isCanvasEmpty
			, SetHasInteracted: (value)=>$this.SetStateValue('hasInteracted', value)
			, IsSettingsOpen: state.isSettingsOpen
			, SetIsSettingsOpen: (value)=>$this.SetStateValue('isSettingsOpen', value)
			, SetSettingsAnchor: (value)=>$this.SetStateValue('settingsAnchor', value)
			, ...$this.m_promptBox?$this.m_promptBox.GetValues():{
				Prompt: ''
				, ReferenceMediaIds: []
				, ModelDisplayName: '\u{1F34C} Nano Banana 2.1'
				, AspectRatio: 'original'
				, Resolution: 'Default'
			}
			, OnError: (error)=>$this.m_promptBox?.ShowError(error)
			, IsGenerating: state.isGenerating
			, SetIsGenerating: (value)=>$this.SetStateValue('isGenerating', value)
			, OnGenerationProgress: (value)=>$this.SetStateValue('generationProgress', value)
			, IsDownloadingImage: state.isDownloadingImage
			, SetIsDownloadingImage: (value)=>$this.SetStateValue('isDownloadingImage', value)
			, SaveState: state.saveState
			, SetSaveState: (value)=>$this.SetStateValue('saveState', value)
			, OnGenerated: (result)=>$this.m_component.props.onGenerated?.(result)
			, OnOpen: ()=>$this.m_component.Open()
			, OnLoad: ()=>$this.m_component.Load()
			, SetColor: (value)=>$this.SetStateValue('color', value)
		});
	};

	_['private'].CreateActionButtons=function (slot, toolButtons) {
		let $this=_(this);
		let container=$this.Node(slot);
		let buttons=[];
		toolButtons.forEach((toolBtn, index)=>{
			let key=`${slot}:${index}`;
			let button=document.createElement('button');
			button.type='button';
			button.dataset.execute=key;
			button.title=toolBtn.Title;
			let icon=document.createElement('span');
			icon.className='material-symbols-outlined text-[18px]';
			icon.textContent=toolBtn.Icon;
			icon.dataset.buttonIcon='';
			button.appendChild(icon);
			let indicator=null;
			if (toolBtn.ShowsColor) {
				indicator=document.createElement('div');
				indicator.className='absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full border border-black/40';
				indicator.dataset.indicator='';
				button.appendChild(indicator);
			}
			container.AppendChild(button);
			buttons.push({
				ToolButton: toolBtn
				, Button: new HtmlNode(button)
				, IconNode: new HtmlNode(icon)
				, Indicator: indicator?new HtmlNode(indicator):null
			});
			$this.m_actionMap.set(key, toolBtn);
			if (slot==='tool-buttons') {
				$this.m_toolRefs.current[toolBtn.Key]=button;
			}
		});
		$this.m_actionButtons.set(slot, buttons);
	};

	_['private'].UpdateActionButtons=function (slot, context, activeId) {
		let $this=_(this);
		let buttonList=$this.m_actionButtons.get(slot);
		if (!buttonList) {
			return;
		}
		let state=$this.m_component.state;
		buttonList.forEach((entry)=>{
			let toolBtn=entry.ToolButton;
			let button=entry.Button;
			let disabled=typeof toolBtn.IsDisabled==='function'?toolBtn.IsDisabled(context):false;
			let active=slot==='tool-buttons'&&toolBtn.Key===activeId;
			let extra=slot==='history-buttons'?'w-7 h-7 !rounded-sm !text-[#aaaaaa] hover:!text-white':slot==='clear-button'?'w-7 h-7 !rounded-sm !text-red-400/80 hover:!text-red-400 hover:bg-red-500/10':slot==='save-button'?`w-7 h-7 !rounded-sm cursor-pointer ${String(state.saveState)==='saved'?'bg-emerald-600 text-white':'bg-[#0078d4] text-white hover:bg-[#106ebe]'}`:'';
			button.SetClasses(
				`${Editor.ButtonBase} ${active?Editor.ButtonActive:Editor.ButtonIdle} ${disabled?Editor.ButtonDisabled:''} ${extra}`.trim()
			);
			button.SetDisabled(disabled);
			if (slot==='save-button') {
				let saveStr=String(state.saveState);
				entry.IconNode.SetText(saveStr==='saving'?'progress_activity':saveStr==='saved'?'check':'save');
				entry.IconNode.ToggleClass('animate-spin', saveStr==='saving');
			}
			if (entry.Indicator) {
				entry.Indicator.SetStyle('backgroundColor', String(state.color));
			}
		});
	};

	_['private'].Update=function (previousState) {
		let $this=_(this);
		let state=$this.m_component.state;
		let settingsActions=$this.m_settingsActions;
		let activeTool=typeof state.tool==='string'?$this.m_toolBar.GetById(state.tool):state.tool;
		let toolId=activeTool?.Id||String(state.tool);
		let colorStr=String(state.color);
		let sprayModeStr=String(state.sprayMode);
		let hasSettings=!!(activeTool&&(activeTool.HasBrushSize||activeTool.HasColor||activeTool.HasProportionConstraint||activeTool.HasSprayMode));
		let panel=$this.Node('settings-panel');
		let panelVisible=!!(state.isSettingsOpen&&state.settingsAnchor&&hasSettings);
		panel.Show(panelVisible);
		if (panelVisible) {
			panel.SetStyle('left', `${state.settingsAnchor.right+8}px`);
			panel.SetStyle('top', `${Math.max(8, Math.min(window.innerHeight-340, state.settingsAnchor.top-10))}px`);
		}
		$this.Node('brush-section').Show(!!activeTool?.HasBrushSize);
		$this.Node('constraint-section').Show(!!activeTool?.HasProportionConstraint);
		$this.Node('spray-section').Show(!!activeTool?.HasSprayMode);
		$this.Node('color-section').Show(!!activeTool?.HasColor);
		$this.Node('brush-label').SetText(`Size ${state.brushSize}px`);
		let preview=$this.Node('brush-preview');
		let previewSize=`${Math.max(1, Math.min(14, state.brushSize/4))}px`;
		preview.SetStyle('width', previewSize);
		preview.SetStyle('height', previewSize);
		$this.Field('brush-size').SetValue(state.brushSize);
		$this.Node('constraint-box').SetClasses(
			`w-3.5 h-3.5 rounded-sm flex items-center justify-center border transition-all ${state.constrainProportions?'bg-[#0078d4] border-[#0078d4]':'border-[#555555] bg-black/40 group-hover:border-[#777777]'}`
		);
		$this.Node('constraint-check').Show(state.constrainProportions);
		$this.Node('constraint-label').SetText(toolId==='rectangle'?'Square':'Circle');
		$this.Node('constraint-label').SetClasses(`text-[11px] transition-colors ${state.constrainProportions?'text-white':'text-[#aaaaaa] group-hover:text-white'}`);
		for (let [name, selected] of [
			['spray-noise', sprayModeStr==='noise'],
			['spray-hair', sprayModeStr==='hair']
		]) {
			$this.ActionNode(name).SetClasses(
				`flex-1 py-1 text-[11px] rounded-sm transition-all ${selected?'bg-[#0078d4] text-white':'text-[#aaaaaa] hover:text-white'}`
			);
		}
		$this.Node('color-preview').SetStyle('backgroundColor', colorStr);
		$this.Node('color-value').SetText(colorStr);
		$this.Field('custom-color').SetValue(colorStr);
		if ((!$this.m_colorButtons)||(!previousState)||(state.color!==previousState.color)) {
			let colorOptions=settingsActions.GetColorOptions(state.color);
			$this.m_colorOptions=colorOptions;
			if (!$this.m_colorButtons) {
				$this.m_colorButtons=[];
				colorOptions.forEach((option, index)=>{
					let element=document.createElement('button');
					element.type='button';
					element.dataset.colorIndex=String(index);
					let button=new HtmlNode(element);
					button.SetStyle('backgroundColor', option.Value);
					button.SetTitle(option.Value);
					$this.Node('color-options').AppendChild(element);
					$this.m_colorButtons.push(button);
				});
			}
			colorOptions.forEach((option, index)=>{
				$this.m_colorButtons[index].SetClasses(
					`w-4 h-4 rounded-sm border border-white/10 transition-all ${option.IsSelected?'ring-2 ring-[#0078d4] ring-offset-1 ring-offset-[#202020] z-10 scale-110':'hover:scale-105'}`
				);
			});
		}
		let buttonContext={
			IsCanvasBusy: state.isCanvasBusy
			, Tool: state.tool
			, ActiveTool: activeTool
			, SaveState: state.saveState
		};
		$this.UpdateActionButtons('tool-buttons', buttonContext, toolId);
		$this.UpdateActionButtons('canvas-operation-buttons', buttonContext, toolId);
		$this.UpdateActionButtons('history-buttons', buttonContext, toolId);
		$this.UpdateActionButtons('clear-button', buttonContext, toolId);
		$this.UpdateActionButtons('save-button', buttonContext, toolId);
		$this.ActionNode('shortcuts').SetClasses(
			`w-8 h-8 flex items-center justify-center rounded-md transition-all ${state.isShortcutsExpanded?'bg-[#0078d4] text-white':'text-[#aaaaaa] hover:bg-white/10 hover:text-white'}`
		);
		$this.ActionNode('download-image').SetDisabled(state.isCanvasBusy||state.isDownloadingImage||!state.hasInteracted);
		$this.Node('download-image-icon').SetText(state.isDownloadingImage?'progress_activity':'file_download');
		$this.Node('download-image-icon').ToggleClass('animate-spin', state.isDownloadingImage);
		$this.Node('empty-hint').Show(!state.hasInteracted);
		$this.Node('generating').Show(state.isGenerating);
		let progress=state.generationProgress||{};
		let determinate=Number.isFinite(progress.Total)&&progress.Total>0;
		let percent=determinate?Math.max(0, Math.min(100, progress.Completed*100/progress.Total)):100;
		$this.Node('generation-stage').SetText(progress.Stage||'Generating image');
		$this.Node('generation-count').SetText(determinate?progress.Completed+' / '+progress.Total:'');
		$this.Node('generation-progress').SetStyle('width', percent+'%');
		$this.Node('generation-progress').ToggleClass('animate-pulse', !determinate);
		let progressBar=$this.Node('generation-bar').GetElement();
		progressBar?.setAttribute('aria-valuetext', progress.Stage||'Generating image');
		if (determinate) {
			progressBar?.setAttribute('aria-valuemin', '0');
			progressBar?.setAttribute('aria-valuemax', String(progress.Total));
			progressBar?.setAttribute('aria-valuenow', String(progress.Completed));
		}
		else {
			progressBar?.removeAttribute('aria-valuemin');
			progressBar?.removeAttribute('aria-valuemax');
			progressBar?.removeAttribute('aria-valuenow');
		}
		$this.m_promptBox?.Update($this.m_actions.CanGenerate(), state.isGenerating);
		$this.Node('shortcuts').Show(state.isShortcutsExpanded);
	};

	_['private'].HandleClick=function (event) {
		let $this=_(this);
		let state=$this.m_component.state;
		let root=$this.m_rootRef.current;
		let target=event.target.closest('[data-execute],[data-action],[data-color-index]');
		if ((!target)||(!root.contains(target))) {
			return;
		}
		if (target.dataset.execute) {
			$this.m_actionMap.get(target.dataset.execute)?.Execute($this.m_actions);
			return;
		}
		if (target.dataset.colorIndex!==void 0) {
			let option=$this.m_colorOptions[Number(target.dataset.colorIndex)];
			if (option) {
				$this.SetStateValue('color', option.Color);
			}
			return;
		}
		switch (target.dataset.action) {
			case 'zoom-in':
				$this.m_workspaceRef.current?.ZoomIn();
				break;
			case 'zoom-out':
				$this.m_workspaceRef.current?.ZoomOut();
				break;
			case 'zoom-reset':
				$this.m_workspaceRef.current?.ResetZoom();
				break;
			case 'constraint':
				$this.SetStateValue('constrainProportions', !state.constrainProportions);
				break;
			case 'spray-noise':
				$this.SetStateValue('sprayMode', SprayMode.Noise);
				break;
			case 'spray-hair':
				$this.SetStateValue('sprayMode', SprayMode.Hair);
				break;
			case 'custom-color':
				if (event.target!==$this.Field('custom-color').GetElement()) {
					$this.m_settingsActions.ChooseCustomColor(event);
				}
				break;
			case 'shortcuts':
				$this.SetStateValue('isShortcutsExpanded', !state.isShortcutsExpanded);
				break;
			case 'download-image':
				$this.UpdateActionContext();
				$this.m_actions.DownloadImage();
				break;
			case 'cancel-generation':
				$this.m_actions.CancelGeneration();
				break;
		}
	};

	_['private'].HandleInput=function (event) {
		let $this=_(this);
		switch (event.target.dataset.input) {
			case 'brush-size':
				$this.SetStateValue('brushSize', parseInt(event.target.value, 10));
				break;
			case 'custom-color':
				$this.m_settingsActions.ChooseColor(event.target.value);
				break;
		}
	};

	_['public'].componentDidMount=function () {
		let $this=_(this);
		let root=$this.m_rootRef.current;
		$this.m_containerRef.current=$this.Node('canvas-container').GetElement();
		$this.m_canvasElementRef.current=$this.Node('canvas').GetElement();
		$this.m_settingsPanelRef.current=$this.Node('settings-panel').GetElement();
		$this.m_clickHandler=(event)=>$this.HandleClick(event);
		$this.m_inputHandler=(event)=>$this.HandleInput(event);
		$this.m_generatingWheelHandler=(event)=>{
			if (!$this.m_component.state.isGenerating) {
				return;
			}
			let surface=$this.m_workspaceRef.current?.Surface;
			let upper=surface?.Canvas?.upperCanvasEl;
			if (!upper) {
				return;
			}
			let rect=upper.getBoundingClientRect();
			surface.ZoomAt(event.clientX-rect.left, event.clientY-rect.top, event.deltaY);
			event.preventDefault();
			event.stopPropagation();
		};
		root.addEventListener('click', $this.m_clickHandler);
		root.addEventListener('input', $this.m_inputHandler);
		$this.Node('generating').GetElement().addEventListener('wheel', $this.m_generatingWheelHandler, {
			passive: false
		});
		new AppStyles().Install();
		$this.m_promptBox=new PromptBox($this.Node('prompt-host').GetElement(), {
			OnChange: ()=>{
				$this.UpdateActionContext();
				$this.m_promptBox.Update($this.m_actions.CanGenerate(), $this.m_component.state.isGenerating);
			}
			, OnGenerate: ()=>$this.m_component.Generate()
			, OnError: (error)=>$this.m_promptBox.ShowError(error)
		});
		$this.CreateActionButtons('tool-buttons', $this.m_toolBar.GetTools());
		$this.CreateActionButtons('canvas-operation-buttons', [
			new CopyButton(),
			new PasteButton(),
			new FlipHorizontalButton(),
			new FlipVerticalButton(),
			new OpenButton(),
			new LoadButton()
		]);
		$this.CreateActionButtons('history-buttons', [new UndoButton(), new RedoButton()]);
		$this.CreateActionButtons('clear-button', [new ClearButton()]);
		$this.CreateActionButtons('save-button', [new SaveButton()]);
		let workspace=new DrawingCanvasEngine($this.m_toolBar, {
			OnContentChange: (value)=>$this.SetStateValue('isCanvasEmpty', value)
			, OnBusyChange: (value)=>$this.SetStateValue('isCanvasBusy', value)
			, OnInteraction: ()=>$this.SetStateValue('hasInteracted', true)
			, OnColorChange: (color)=>$this.SetStateValue('color', color)
			, OnToolChange: (tool)=>$this.SetStateValue('tool', tool)
			, OnDimensionsChange: (dims, isImageLoaded)=>{
				if (typeof $this.m_component.props.onDimensionsChange==='function') {
					$this.m_component.props.onDimensionsChange(dims, isImageLoaded);
				}
			}
			, OnZoomChange: (zoomRatio)=>{
				let zoomLabel=$this.Node('zoom-level');
				if (zoomLabel) {
					zoomLabel.SetText(`${Math.round(zoomRatio*100)}%`);
				}
				if (typeof $this.m_component.props.onZoomChange==='function') {
					$this.m_component.props.onZoomChange(zoomRatio);
				}
			}
		});
		workspace.Init($this.m_canvasElementRef.current, $this.m_containerRef.current);
		$this.m_workspaceRef.current=workspace;
		$this.UpdateTools();
		let initialImage=$this.m_component.props.initialImageData;
		if (initialImage) {
			$this.LoadImageData(initialImage, $this.m_component.props.initialImageTitle||'Generated Artwork');
		}
		$this.UpdateActionContext();
		$this.Update();
		$this.m_keyboardHandler=(event)=>{
			if ((!$this.m_component.props.isActive)||(event.defaultPrevented)||(event.target?.isContentEditable)) {
				return;
			}
			if ((event.key==='Escape')&&(!$this.m_component.state.isSettingsOpen)&&(!$this.m_component.state.isCanvasBusy)) {
				if (typeof $this.m_component.props.onClose==='function') {
					$this.m_component.props.onClose();
					return;
				}
			}
			$this.m_keyboard.HandleKeyDown(event);
		};
		$this.m_settingsHandler=(event)=>$this.m_settingsActions.HandleOutsideClick(event);
		window.addEventListener('keydown', $this.m_keyboardHandler);
		document.addEventListener('mousedown', $this.m_settingsHandler);
	};

	_['public'].componentDidUpdate=function (previousProps, previousState) {
		let $this=_(this);
		if ((this.state.tool!==previousState.tool)||(this.state.sprayMode!==previousState.sprayMode)||(this.state.color!==previousState.color)||(this.state.brushSize!==previousState.brushSize)||(this.state.constrainProportions!==previousState.constrainProportions)) {
			$this.UpdateTools();
		}
		$this.Update(previousState);
	};

	_['public'].ResetZoom=function () {
		let workspace=_(this).m_workspaceRef.current;
		if (workspace) {
			workspace.ResetZoom();
		}
	};

	_['public'].Generate=function () {
		let $this=_(this);
		$this.UpdateActionContext();
		return $this.m_actions.Refine();
	};

	_['public'].Open=async function (media) {
		try {
			let selected=media||await Editor.SelectFlowImage();
			if (!selected?.base64) {
				return false;
			}
			return await _(this).LoadImageData(`data:${selected.mimeType};base64,${selected.base64}`, selected.name||'Imported Image');
		}
		catch (error) {
			console.error('Failed to open image from Flow:', error);
			return false;
		}
	};

	_['public'].Load=function (file) {
		if (!file) {
			Editor.SelectLocalFile((selected)=>this.Load(selected));
			return;
		}
		if (!file.type.startsWith('image/')) {
			return;
		}
		let $this=_(this);
		let reader=new FileReader();

		reader.onload=function () {
			if (typeof reader.result==='string') {
				$this.LoadImageData(reader.result, file.name);
			}
		};

		reader.onerror=function () {
			console.error('Failed to load local image:', reader.error);
		};
		reader.readAsDataURL(file);
	};

	_['public'].componentWillUnmount=function () {
		let $this=_(this);
		window.removeEventListener('keydown', $this.m_keyboardHandler);
		document.removeEventListener('mousedown', $this.m_settingsHandler);
		$this.m_promptBox?.Destroy();
		$this.m_promptBox=null;
		let root=$this.m_rootRef.current;
		root?.removeEventListener('click', $this.m_clickHandler);
		root?.removeEventListener('input', $this.m_inputHandler);
		$this.Node('generating').GetElement()?.removeEventListener('wheel', $this.m_generatingWheelHandler);
		let workspace=$this.m_workspaceRef.current;
		$this.m_workspaceRef.current=null;
		if (workspace) {
			workspace.Destroy();
		}
	};

	_['public'].render=function () {
		let $this=_(this);
		$this.UpdateActionContext();
		return React.createElement('div', {
			ref: $this.m_rootRef
			, className: 'h-full w-full'
			, dangerouslySetInnerHTML: Editor.TemplateMarkup
		});
	};

	_['public'].CanMoveModal=function (event) {
		let $this=_(this);
		let state=$this.m_component.state;
		let workspace=$this.m_workspaceRef.current;
		if (state.isGenerating) {
			return true;
		}
		if (workspace?.Surface.Canvas.getActiveObject?.()?.isEditing) {
			return false;
		}
		if ((state.isCanvasBusy)||(workspace?.Tools.ActiveTool?.IsBusy(workspace.Tools))) {
			return false;
		}
		if (event.target.closest('input,textarea,select,[contenteditable="true"]')) {
			return false;
		}
		if (!event.target.closest('[data-role="canvas-container"]')) {
			return true;
		}
		let canvas=workspace?.Surface.Canvas;
		if ((!canvas)||(event.altKey)||(event.button!==0)) {
			return false;
		}
		let point=canvas.getScenePoint(event);
		let dimensions=workspace.Surface.BaseDimensions;
		if ((point.x<0)||(point.y<0)||(point.x>dimensions.width)||(point.y>dimensions.height)) {
			return true;
		}
		if (workspace.Tools.ActiveTool?.Id!=='select') {
			return false;
		}
		let target=canvas.findTarget(event);
		return!target||!!target.isBackground||!!target.isUI||!!target.isFillLayer;
	};

	_['public'].GetMinimumSize=function () {
		let sidebar=_(this).Node('sidebar').GetElement();
		let height=0;
		for (let child of sidebar.children) {
			let style2=getComputedStyle(child);
			height+=child.scrollHeight+parseFloat(style2.marginTop)+parseFloat(style2.marginBottom);
		}
		let style=getComputedStyle(sidebar);
		height+=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom);
		return {
			width: sidebar.offsetWidth+430
			, height: Math.max(360, Math.ceil(height))
		};
	};

	_['public'].GetCanvasChrome=function () {
		return {
			width: _(this).Node('sidebar').GetElement().offsetWidth
			, height: 0
		};
	};
	_['private'].m_promptBox=null;
	_['private'].m_component=null;
	_['private'].m_nodeCache=null;
	_['private'].m_sourceName='';
	_['private'].m_actionButtons=null;
	_['private'].m_colorButtons=null;
	_['private'].m_colorOptions=null;
	_['private'].m_toolRefs=null;
	_['private'].m_workspaceRef=null;
	_['private'].m_rootRef=null;
	_['private'].m_containerRef=null;
	_['private'].m_canvasElementRef=null;
	_['private'].m_settingsPanelRef=null;
	_['private'].m_actions=null;
	_['private'].m_keyboard=null;
	_['private'].m_settingsActions=null;
	_['private'].m_actionMap=null;
	_['private'].m_clickHandler=null;
	_['private'].m_inputHandler=null;
	_['private'].m_generatingWheelHandler=null;
	_['private'].m_keyboardHandler=null;
	_['private'].m_settingsHandler=null;
	_['private'].m_toolBar=null;
});
