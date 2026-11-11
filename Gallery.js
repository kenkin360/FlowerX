
var Gallery=Function.extend(React.Component, function () {
	var _=this(Gallery);
	Gallery=_[Gallery];
	function Gallery(props) {
		_['base'].apply(this, arguments);
		let $this=_(this);
		$this.m_component=this;
		$this.Initialize();
	}

	_['private'].Initialize=function () {
		let $this=_(this);
		$this.m_sourceToolBar=new ToolBar();
		$this.m_sourceToolBar.Register(new ExportButton());
		$this.m_sourceActions=new AppActions();
		$this.m_component.state={
			modals: []
			, activeModalId: null
			, isSourceListOpen: false
			, sourceModalZIndex: 50
			, sourceFiles: []
			, sourceError: null
			, downloadingFile: null
			, isExportingAppSource: false
		};
		$this.m_sourceActions.SetContext({
			HostSourceUrl: $this.m_component.props.HostSourceUrl
			, ToolBar: $this.m_sourceToolBar
			, SetIsExportingJSON: (val)=>$this.m_component.setState({
				isExportingAppSource: val
			})
		});
		$this.m_sourceFiles=new Map();
		$this.m_modalRefs=new Map();
		$this.m_editorRefs=new Map();
		$this.m_galleryRef=React.createRef();
		$this.m_clickHandler=null;
		$this.m_nextZIndex=50;
	};

	_['private'].FocusModal=function (modalId) {
		let $this=_(this);
		let component=$this.m_component;
		let nextZ=++$this.m_nextZIndex;
		component.setState(function (prevState) {
			let updated=prevState.modals.map(function (m) {
				return m.id===modalId?Object.assign({}, m, {
					zIndex: nextZ
				}):m;
			});
			return {
				modals: updated
				, activeModalId: modalId
			};
		});
	};

	_['private'].OpenEditorWithImage=function (imageData, title) {
		let $this=_(this);
		let component=$this.m_component;
		let modalId='modal-'+Date.now()+'-'+Math.floor(Math.random()*1e3);
		let zIndex=++$this.m_nextZIndex;
		let modalRef=React.createRef();
		let editorRef=React.createRef();
		$this.m_modalRefs.set(modalId, modalRef);
		$this.m_editorRefs.set(modalId, editorRef);
		let offsetIndex=component.state.modals.length;
		let newModal={
			id: modalId
			, title: 'Canvas '+(offsetIndex+1)
			, selectedImageData: imageData||null
			, selectedImageTitle: title||null
			, imageNaturalSize: null
			, currentZoom: 1
			, zIndex
			, offsetIndex
		};
		return new Promise(function (resolve) {
			component.setState(
				function (prev) {
					return {
						modals: prev.modals.concat([newModal])
						, activeModalId: modalId
					};
				},
				function () {
					modalRef.current?.ResetPosition();
					resolve(modalId);
				}
			);
		});
	};

	_['private'].CloseModal=function (modalId) {
		let $this=_(this);
		$this.m_modalRefs.delete(modalId);
		$this.m_editorRefs.delete(modalId);
		$this.m_component.setState(function (prevState) {
			let remaining=prevState.modals.filter(function (m) {
				return m.id!==modalId;
			});
			let nextActive=remaining.length>0?remaining[remaining.length-1].id:null;
			return {
				modals: remaining
				, activeModalId: nextActive
			};
		});
	};

	_['private'].UpdateModalState=function (modalId, patch, callback) {
		let component=_(this).m_component;
		component.setState(function (prevState) {
			let updated=prevState.modals.map(function (m) {
				return m.id===modalId?Object.assign({}, m, patch):m;
			});
			return {
				modals: updated
			};
		}, callback);
	};

	_['private'].OpenSourceList=function () {
		let $this=_(this);
		try {
			let sourceUrl=$this.m_component.props.HostSourceUrl;
			let prefix='data:text/javascript;base64,';
			if ((!sourceUrl)||(!sourceUrl.startsWith(prefix))) {
				throw new Error('Bundled source URL is unavailable');
			}
			let source=atob(sourceUrl.slice(prefix.length));
			let names=['App.tsx', 'Function.extend.js', 'Module.js', 'Bundle.js'];
			let markers=[...source.matchAll(/^\/\/ virtual:([^\r\n]+)\r?\n/gm)];
			let files=new Map();
			for(let i=markers.length; i-->0; ) {
				let marker=markers[i];
				let name=marker[1].trim();
				if (!names.includes(name)) {
					continue;
				}
				let start=marker.index+marker[0].length;
				let end=i+1<markers.length?markers[i+1].index:source.length;
				let content=source.slice(start, end).replace(/^\/\/ virtual-export:default [^\r\n]+\r?\n/, '').trimEnd();
				files.set(name, content+'\n'+(files.get(name)||''));
			}
			if (files.size===0) {
				throw new Error('No host source files were found');
			}
			$this.m_sourceFiles=files;
			$this.m_component.setState({
				isSourceListOpen: true
				, activeModalId: null
				, sourceModalZIndex: ++$this.m_nextZIndex
				, sourceFiles: names.filter((name)=>files.has(name))
				, sourceError: null
			});
		}
		catch (error) {
			console.error('Failed to list host source:', error);
			$this.m_component.setState({
				isSourceListOpen: true
				, activeModalId: null
				, sourceModalZIndex: ++$this.m_nextZIndex
				, sourceFiles: []
				, sourceError: error.message
			});
		}
	};

	_['private'].CloseSourceList=function () {
		let $this=_(this);
		$this.m_component.setState(function (state) {
			let topEditor=state.modals.reduce((top, modal)=>!top||modal.zIndex>top.zIndex?modal:top, null);
			return {
				isSourceListOpen: false
				, activeModalId: state.activeModalId??topEditor?.id??null
			};
		});
	};

	_['private'].DownloadSourceFile=async function (name) {
		let $this=_(this);
		let content=$this.m_sourceFiles.get(name);
		if ((content===void 0)||($this.m_component.state.downloadingFile!==null)) {
			return;
		}
		$this.m_component.setState({
			downloadingFile: name
			, sourceError: null
		});
		try {
			await Flow.download({
				base64: btoa(content)
				, mimeType: 'text/plain'
				, filename: name.replaceAll('/', '_')+'.txt'
			});
		}
		catch (error) {
			console.error('Failed to download source file:', error);
			$this.m_component.setState({sourceError: error.message});
		}
		finally {
			$this.m_component.setState({downloadingFile: null});
		}
	};

	_['public'].componentDidMount=function () {
		new AppStyles().Install();
		let $this=_(this);
		let root=$this.m_galleryRef.current;
		$this.m_clickHandler=(event)=>$this.OnGalleryClick(event);
		root.addEventListener('click', $this.m_clickHandler);
	};

	_['public'].componentWillUnmount=function () {
		let $this=_(this);
		let root=$this.m_galleryRef.current;
		root?.removeEventListener('click', $this.m_clickHandler);
	};

	_['private'].OnGalleryClick=function (event) {
		let $this=_(this);
		let button=event.target.closest('[data-action]');
		if (button) {
			let action=button.dataset.action;
			if (action==='source-list') {
				if ($this.m_component.state.isSourceListOpen) {
					$this.CloseSourceList();
				}
				else {
					$this.OpenSourceList();
				}
			}
			else if (action==='load') {
				Editor.SelectLocalFile(function (file) {
					$this.OpenEditorWithImage(null).then(function (modalId) {
						$this.m_editorRefs.get(modalId)?.current?.Load(file);
					});
				});
			}
			else if (action==='open') {
				Editor.SelectFlowImage().then(function (media) {
					if (media?.base64) {
						$this.OpenEditorWithImage(null).then(function (modalId) {
							$this.m_editorRefs.get(modalId)?.current?.Open(media);
						});
					}
				}).catch(function (error) {
					console.log('Media selection interaction finished:', error);
				});
			}
			else if (action==='new-canvas') {
				$this.OpenEditorWithImage(null);
			}
			return;
		}
	};

	_['public'].render=function () {
		let $this=_(this);
		let state=this.state;
		return React.createElement(
			'div',
			{
				className: 'relative h-full w-full overflow-hidden bg-[#070709] text-white flex flex-col select-none'
			},
			React.createElement('div', {
				ref: $this.m_galleryRef
				, className: 'contents'
				, dangerouslySetInnerHTML: {
					__html: galleryTemplate
				}
			}),
			state.isSourceListOpen&&React.createElement(
				Modal,
				{
					key: 'source-files'
					, title: 'Source files'
					, zIndex: state.sourceModalZIndex
					, defaultSize: {
						width: 560
						, height: 520
					}
					, getContentMinimumSize: ()=>({
						width: 360
						, height: 260
					})
					, allowContentWheel: true
					, canStartMove: ()=>true
					, onFocus: ()=>this.setState({
						sourceModalZIndex: ++$this.m_nextZIndex
						, activeModalId: null
					})
					, onClose: ()=>$this.CloseSourceList()
				},
				React.createElement(
					'div',
					{
						className: 'h-full flex flex-row overflow-hidden'
					},
					React.createElement(
						'aside',
						{
							'data-role': 'source-toolbar'
							, className: 'w-[50px] border-r border-[#2d2d2d] bg-[#181818] py-2 flex flex-col items-center justify-end shrink-0 select-none'
						},
						React.createElement(
							'div',
							{
								className: 'flex flex-col items-center gap-1 w-full'
							},
							$this.m_sourceToolBar.GetTools().map(
								(btn)=>React.createElement(
									'button',
									{
										key: btn.Key
										, type: 'button'
										, title: btn.Title
										, disabled: state.isExportingAppSource
										, onClick: ()=>btn.Execute($this.m_sourceActions)
										, className: `w-[36px] h-[36px] flex items-center justify-center rounded-md transition-colors cursor-pointer ${state.isExportingAppSource?'bg-[#0078d4] text-white':'text-[#aaaaaa] hover:bg-white/10 hover:text-white'}`
									},
									React.createElement(
										'span',
										{
											className: `material-symbols-outlined text-[18px] ${state.isExportingAppSource?'animate-spin':''}`
										},
										state.isExportingAppSource?'progress_activity':btn.Icon
									)
								)
							)
						)
					),
					React.createElement(
						'div',
						{
							className: 'flex-1 overflow-y-auto p-3'
						},
						state.sourceError&&React.createElement(
							'p',
							{
								className: 'px-3 py-2 text-xs text-red-400'
								, role: 'alert'
							},
							state.sourceError
						),
						state.sourceFiles.map(
							(name)=>React.createElement(
								'button',
								{
									key: name
									, type: 'button'
									, className: 'w-full px-3 py-2.5 rounded-lg text-left text-xs font-mono flex items-center justify-between gap-3 hover:bg-white/10 disabled:opacity-50 cursor-pointer'
									, disabled: state.downloadingFile!==null
					, onClick: ()=>$this.DownloadSourceFile(name)
								},
								React.createElement(
									'span',
									{
										className: 'truncate'
									},
									name
								),
								React.createElement(
									'span',
									{
										className: 'material-symbols-outlined text-lg shrink-0'
									},
									state.downloadingFile===name?'progress_activity':'download'
								)
							)
						)
					)
				)
			),
			state.modals.map(function (modalItem) {
				let modalRef=$this.m_modalRefs.get(modalItem.id);
				let editorRef=$this.m_editorRefs.get(modalItem.id);
				let modalTitle=modalItem.imageNaturalSize?`${modalItem.title} - ${modalItem.imageNaturalSize.width} \xD7 ${modalItem.imageNaturalSize.height} (${Math.round((modalItem.currentZoom||1)*100)}%)`:modalItem.title;
				return React.createElement(
					Modal,
					{
						key: modalItem.id
						, ref: modalRef
						, title: modalTitle
						, zIndex: modalItem.zIndex
						, offsetIndex: modalItem.offsetIndex
						, canStartMove: (event)=>editorRef.current?.CanMoveModal(event)===true
						, getContentMinimumSize: ()=>editorRef.current?.GetMinimumSize()
						, getCanvasChrome: ()=>editorRef.current?.GetCanvasChrome()
						, onFocus: ()=>$this.FocusModal(modalItem.id)
						, onClose: ()=>$this.CloseModal(modalItem.id)
						, onResetPosition: ()=>{
							editorRef?.current?.ResetZoom();
							let nat=modalItem.imageNaturalSize;
							if (nat) {
								modalRef?.current?.ResetPosition(nat.width, nat.height, 1);
							}
							else {
								modalRef?.current?.ResetPosition();
							}
						}
					},
					React.createElement(Editor, {
						ref: editorRef
						, initialImageData: modalItem.selectedImageData
						, initialImageTitle: modalItem.selectedImageTitle
						, isActive: state.activeModalId===modalItem.id
						, onClose: ()=>$this.CloseModal(modalItem.id)
						, onTitleChange: (title)=>$this.UpdateModalState(modalItem.id, {title})
						, onGenerated: (result)=>$this.OpenEditorWithImage(result.DataUrl, 'Generated Artwork')
						, onZoomChange: (zoom)=>{
							$this.UpdateModalState(modalItem.id, {
								currentZoom: zoom
							});
							let natural=modalItem.imageNaturalSize;
							if (natural) {
								modalRef?.current?.UpdateSize(natural.width, natural.height, zoom);
							}
						}
						, onDimensionsChange: (dims, isImageLoaded)=>{
							if ((isImageLoaded)&&(dims)&&(dims.width)&&(dims.height)) {
								let natural=modalItem.imageNaturalSize;
								if ((natural)&&(natural.width===dims.width)&&(natural.height===dims.height)) {
									return;
								}
								$this.UpdateModalState(
									modalItem.id,
									{
										imageNaturalSize: {
											width: dims.width
											, height: dims.height
										}
										, currentZoom: 1
									},
									function () {
										modalRef?.current?.ResetPosition(dims.width, dims.height, 1);
									}
								);
							}
						}
					})
				);
			})
		);
	};
	_['public'].state=null;
	_['private'].m_component=null;
	_['private'].m_sourceFiles=null;
	_['private'].m_sourceToolBar=null;
	_['private'].m_sourceActions=null;
	_['private'].m_modalRefs=null;
	_['private'].m_editorRefs=null;
	_['private'].m_galleryRef=null;
	_['private'].m_clickHandler=null;
	_['private'].m_nextZIndex=50;
});
