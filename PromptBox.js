
var PromptBox=Function.extend(Object, function () {
	var _=this(PromptBox);
	PromptBox=_[PromptBox];
	function PromptBox(root, callbacks) {
		_['base'].apply(this, arguments);
		let $this=_(this);
		$this.m_root=root;
		$this.m_callbacks=callbacks;
		$this.m_references=[];
		$this.m_nodes=new Map();
		$this.m_handlers=new Map();
		root.innerHTML=promptTemplate;
		$this.m_handlers.set('click', (event)=>$this.HandleClick(event));
		$this.m_handlers.set('input', ()=>$this.NotifyChange());
		$this.m_handlers.set('keydown', (event)=>$this.HandleKeyDown(event));
		$this.m_handlers.set('paste', (event)=>$this.HandlePaste(event));
		$this.m_handlers.set('mousedown', ()=>$this.CaptureSelection());
		$this.m_handlers.forEach((handler, name)=>root.addEventListener(name, handler));
		$this.m_outsideHandler=(event)=>{
			if (!root.contains(event.target)) {
				$this.CloseSettings();
			}
		};
		document.addEventListener('mousedown', $this.m_outsideHandler);
		$this.RefreshSettings();
	}

	_['private'].Node=function (name) {
		let $this=_(this);
		if (!$this.m_nodes.has(name)) {
			$this.m_nodes.set(name, $this.m_root.querySelector('[data-prompt="'+name+'"]'));
		}
		return $this.m_nodes.get(name);
	};

	_['public'].GetValues=function () {
		let $this=_(this);
		return {
			Prompt: $this.Node('input').innerText.trim()
			, ReferenceMediaIds: $this.m_references.map((item)=>item.mediaId)
			, ModelDisplayName: $this.m_model
			, AspectRatio: $this.m_aspect
			, Resolution: $this.m_resolution
		};
	};

	_['public'].Update=function (canGenerate, isGenerating) {
		let $this=_(this);
		$this.m_root.querySelector('[data-prompt-action="generate"]').disabled=!canGenerate||$this.m_isSelecting;
		$this.Node('generate-icon').textContent=isGenerating?'progress_activity':'arrow_forward';
		$this.Node('generate-icon').classList.toggle('animate-spin', isGenerating);
	};

	_['public'].ShowError=function (error) {
		let node=_(this).Node('error');
		node.textContent=error?error.message||String(error):'';
		node.hidden=!error;
	};

	_['private'].NotifyChange=function () {
		let $this=_(this);
		let text=$this.Node('input').innerText.trim();
		$this.Node('input').dataset.empty=String(text.length===0);
		$this.Node('top').hidden=$this.m_references.length===0;
		$this.m_callbacks.OnChange();
	};

	_['private'].CaptureSelection=function () {
		let $this=_(this);
		let selection=window.getSelection();
		if ((selection?.rangeCount)&&($this.Node('input').contains(selection.anchorNode))&&($this.Node('input').contains(selection.focusNode))) {
			$this.m_range=selection.getRangeAt(0).cloneRange();
		}
	};

	_['private'].InsertNode=function (node) {
		let $this=_(this);
		let input=$this.Node('input');
		let range=$this.m_range;
		if ((!range)||(!input.contains(range.commonAncestorContainer))) {
			range=document.createRange();
			range.selectNodeContents(input);
			range.collapse(false);
		}
		range.deleteContents();
		range.insertNode(node);
		range.setStartAfter(node);
		range.collapse(true);
		input.focus();
		let selection=window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		$this.m_range=range.cloneRange();
	};

	_['private'].SelectReference=async function () {
		let $this=_(this);
		if ($this.m_isSelecting) {
			return;
		}
		$this.CaptureSelection();
		$this.m_isSelecting=true;
		$this.m_root.querySelector('[data-prompt-action="add"]').disabled=true;
		$this.NotifyChange();
		try {
			let media=await Flow.media.select({
				filter: 'image'
			});
			if (($this.m_destroyed)||(!media)) {
				return;
			}
			if (!media.mediaId) {
				throw new Error('所選素材沒有 mediaId。');
			}
			if (!media.base64) {
				let content=await Flow.media.getBase64({
					mediaId: media.mediaId
				});
				media={
					...media
					, ...content
				};
			}
			if ($this.m_destroyed) {
				return;
			}
			if (!$this.m_references.some((item)=>item.mediaId===media.mediaId)) {
				$this.m_references.push(media);
				$this.RenderReferences();
			}
			let mention=document.createElement('span');
			mention.className='fx-mention';
			mention.contentEditable='false';
			mention.dataset.mentionId=media.mediaId;
			mention.dataset.referenceType='media';
			mention.textContent=media.name||'參考影像';
			$this.InsertNode(mention);
			$this.InsertNode(document.createTextNode(' '));
			$this.m_callbacks.OnError(null);
		}
		catch (error) {
			if (!$this.m_destroyed) {
				$this.m_callbacks.OnError(error);
			}
		}
		finally {
			if (!$this.m_destroyed) {
				$this.m_isSelecting=false;
				$this.m_root.querySelector('[data-prompt-action="add"]').disabled=false;
				$this.NotifyChange();
			}
		}
	};

	_['private'].RenderReferences=function () {
		let $this=_(this);
		let fragment=document.createDocumentFragment();
		for (let media of $this.m_references) {
			let button=document.createElement('button');
			button.type='button';
			button.className='fx-reference';
			button.dataset.removeReference=media.mediaId;
			button.setAttribute('aria-label', '移除參考素材：'+(media.name||'影像'));
			let image=document.createElement('img');
			image.src='data:'+media.mimeType+';base64,'+media.base64;
			image.alt=media.name||'參考影像';
			let icon=document.createElement('span');
			icon.className='fx-reference-remove';
			icon.textContent='\u2297';
			button.append(image, icon);
			fragment.appendChild(button);
		}
		$this.Node('references').replaceChildren(fragment);
	};

	_['private'].RefreshSettings=function () {
		let $this=_(this);
		$this.Node('model').textContent=$this.m_model;
		$this.Node('summary').textContent=$this.m_model+($this.m_resolution==='Default'?'':' \xB7 '+$this.m_resolution);
		for (let button of $this.m_root.querySelectorAll('[data-aspect]')) {
			let selected=button.dataset.aspect===$this.m_aspect;
			button.setAttribute('aria-checked', String(selected));
			if (selected) {
				$this.Node('ratio-icon').textContent=button.dataset.icon;
			}
		}
		for (let button of $this.m_root.querySelectorAll('[data-model]')) {
			button.setAttribute('aria-selected', String(button.dataset.model===$this.m_model));
		}
		for (let button of $this.m_root.querySelectorAll('[data-resolution]')) {
			button.setAttribute('aria-checked', String(button.dataset.resolution===$this.m_resolution));
		}
	};

	_['private'].CloseSettings=function () {
		let $this=_(this);
		$this.Node('settings').hidden=true;
		$this.Node('models').hidden=true;
		$this.m_root.querySelector('[data-prompt-action="settings"]').setAttribute('aria-expanded', 'false');
		$this.m_root.querySelector('[data-prompt-action="models"]').setAttribute('aria-expanded', 'false');
	};

	_['private'].HandleClick=function (event) {
		let $this=_(this);
		let button=event.target.closest('button');
		if ((!button)||(!$this.m_root.contains(button))||(button.disabled)) {
			return;
		}
		if (button.dataset.removeReference) {
			let id=button.dataset.removeReference;
			$this.m_references=$this.m_references.filter((item)=>item.mediaId!==id);
			for (let mention of $this.Node('input').querySelectorAll('[data-mention-id]')) {
				if (mention.dataset.mentionId===id) {
					mention.remove();
				}
			}
			$this.RenderReferences();
			$this.NotifyChange();
			return;
		}
		if (button.dataset.aspect) {
			$this.m_aspect=button.dataset.aspect;
			$this.RefreshSettings();
			$this.NotifyChange();
			return;
		}
		if (button.dataset.resolution) {
			$this.m_resolution=button.dataset.resolution;
			$this.RefreshSettings();
			$this.NotifyChange();
			return;
		}
		if (button.dataset.model) {
			$this.m_model=button.dataset.model;
			$this.Node('models').hidden=true;
			$this.m_root.querySelector('[data-prompt-action="models"]').setAttribute('aria-expanded', 'false');
			$this.RefreshSettings();
			$this.NotifyChange();
			return;
		}
		switch (button.dataset.promptAction) {
			case 'add':
				$this.SelectReference();
				break;
			case 'clear':
				$this.Node('input').replaceChildren();
				$this.m_references=[];
				$this.m_range=null;
				$this.RenderReferences();
				$this.NotifyChange();
				break;
			case 'settings':
				$this.Node('settings').hidden=!$this.Node('settings').hidden;
				button.setAttribute('aria-expanded', String(!$this.Node('settings').hidden));
				break;
			case 'models':
				$this.Node('models').hidden=!$this.Node('models').hidden;
				button.setAttribute('aria-expanded', String(!$this.Node('models').hidden));
				break;
			case 'generate':
				$this.CloseSettings();
				$this.m_callbacks.OnGenerate();
				break;
		}
	};

	_['private'].HandleKeyDown=function (event) {
		let $this=_(this);
		event.stopPropagation();
		if (event.isComposing) {
			return;
		}
		if (event.key==='Escape') {
			$this.CloseSettings();
			return;
		}
		if (event.target!==$this.Node('input')) {
			return;
		}
		if (event.key==='@') {
			event.preventDefault();
			$this.SelectReference();
		}
		else if ((event.key==='Enter')&&(!event.shiftKey)) {
			event.preventDefault();
			if (!$this.m_isSelecting) {
				$this.CloseSettings();
				$this.m_callbacks.OnGenerate();
			}
		}
	};

	_['private'].HandlePaste=function (event) {
		let $this=_(this);
		if (event.target!==$this.Node('input')) {
			return;
		}
		event.preventDefault();
		$this.CaptureSelection();
		$this.InsertNode(document.createTextNode(event.clipboardData.getData('text/plain')));
		$this.NotifyChange();
	};

	_['public'].Destroy=function () {
		let $this=_(this);
		$this.m_destroyed=true;
		$this.m_handlers.forEach((handler, name)=>$this.m_root.removeEventListener(name, handler));
		document.removeEventListener('mousedown', $this.m_outsideHandler);
		$this.m_root.replaceChildren();
		$this.m_nodes.clear();
		$this.m_references=[];
		$this.m_range=null;
	};
	_['private'].m_root=null;
	_['private'].m_callbacks=null;
	_['private'].m_nodes=null;
	_['private'].m_handlers=null;
	_['private'].m_outsideHandler=null;
	_['private'].m_references=null;
	_['private'].m_range=null;
	_['private'].m_model='\u{1F34C} Nano Banana 2.1';
	_['private'].m_aspect='original';
	_['private'].m_resolution='Default';
	_['private'].m_isSelecting=false;
	_['private'].m_destroyed=false;
});
