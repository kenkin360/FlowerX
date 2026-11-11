
var Modal=Function.extend(React.Component, function () {
	var _=this(Modal);
	Modal=_[Modal];
	function Modal(props) {
		_['base'].apply(this, arguments);
		let $this=_(this);
		$this.m_component=this;
		$this.Initialize();
	}

	_['private'].Initialize=function () {
		let $this=_(this);
		$this.m_component.state={
			position: null
			, size: null
			, isMaximized: false
			, preMaximizePosition: null
			, preMaximizeSize: null
			, isDragging: false
			, isResizing: false
			, resizeDirection: null
		};
		$this.m_modalRef=React.createRef();
		$this.m_contentHostRef=React.createRef();
		$this.m_dragStart={
			mouseX: 0
			, mouseY: 0
			, posX: 0
			, posY: 0
		};
		$this.m_resizeStart={
			mouseX: 0
			, mouseY: 0
			, posX: 0
			, posY: 0
			, width: 0
			, height: 0
			, direction: ''
		};
		$this.m_boundMouseMove=null;
		$this.m_boundMouseUp=null;
		$this.m_boundResizeMove=null;
		$this.m_boundResizeUp=null;
		$this.m_calculatedMinSize=null;
	};

	_['public'].MeasureContentMinDimensions=function () {
		let $this=_(this);
		let content=$this.m_component.props.getContentMinimumSize?.()||{
			width: 480
			, height: 520
		};
		let chrome=$this.GetWindowChrome();
		$this.m_calculatedMinSize={
			width: Math.ceil(content.width+chrome.width)
			, height: Math.ceil(content.height+chrome.height)
		};
		return $this.m_calculatedMinSize;
	};

	_['private'].GetWindowChrome=function () {
		let modal=_(this).m_modalRef.current;
		let style=modal?getComputedStyle(modal):null;
		let width=style?parseFloat(style.borderLeftWidth)+parseFloat(style.borderRightWidth):2;
		let height=style?parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth):2;
		height+=modal?.querySelector('[data-modal-header]')?.offsetHeight||32;
		return {
			width
			, height
		};
	};

	_['private'].GetImageSize=function (contentW, contentH, zoomRatio) {
		let $this=_(this);
		let minimum=$this.m_component.MeasureContentMinDimensions();
		let windowChrome=$this.GetWindowChrome();
		let editorChrome=$this.m_component.props.getCanvasChrome?.()||{
			width: 50
			, height: 0
		};
		let zoom=zoomRatio||1;
		return {
			width: Math.max(minimum.width, Math.round(contentW*zoom)+windowChrome.width+editorChrome.width)
			, height: Math.max(minimum.height, Math.round(contentH*zoom)+windowChrome.height+editorChrome.height)
		};
	};

	_['public'].CalculateAdaptiveLayout=function (contentW, contentH, zoomRatio, offsetIndex) {
		let size=_(this).GetImageSize(contentW||1280, contentH||720, zoomRatio);
		let finalW=size.width;
		let finalH=size.height;
		let stagger=(offsetIndex||0)%8*28;
		let posX=Math.max(16, Math.min(window.innerWidth-finalW-16, Math.round((window.innerWidth-finalW)/2)+stagger));
		let posY=Math.max(16, Math.min(window.innerHeight-finalH-16, Math.round((window.innerHeight-finalH)/2)+stagger));
		return {
			size: {
				width: Math.round(finalW)
				, height: Math.round(finalH)
			}
			, position: {
				x: posX
				, y: posY
			}
		};
	};

	_['public'].ResetPosition=function (contentW, contentH, zoomRatio) {
		let $this=_(this);
		let offsetIndex=$this.m_component.props.offsetIndex||0;
		if ((contentW)&&(contentH)) {
			$this.m_contentDimensions={
				width: contentW
				, height: contentH
				, zoom: zoomRatio||1
			};
			let layout=this.CalculateAdaptiveLayout(contentW, contentH, zoomRatio, offsetIndex);
			$this.m_component.setState({
				position: layout.position
				, size: layout.size
				, isMaximized: false
			});
		}
		else {
			let minDims=this.MeasureContentMinDimensions();
			let defaultW=Math.max(minDims.width, Math.min(window.innerWidth-48, $this.m_component.props.defaultSize?.width??960));
			let defaultH=Math.max(minDims.height, Math.min(window.innerHeight-48, $this.m_component.props.defaultSize?.height??680));
			let stagger=offsetIndex%8*28;
			let posX=Math.max(16, Math.min(window.innerWidth-defaultW-16, Math.round((window.innerWidth-defaultW)/2)+stagger));
			let posY=Math.max(16, Math.min(window.innerHeight-defaultH-16, Math.round((window.innerHeight-defaultH)/2)+stagger));
			$this.m_component.setState({
				position: {
					x: posX
					, y: posY
				}
				, size: {
					width: defaultW
					, height: defaultH
				}
				, isMaximized: false
			});
		}
	};

	_['public'].UpdateSize=function (contentW, contentH, zoomRatio) {
		let $this=_(this);
		if ((!contentW)||(!contentH)) {
			return;
		}
		$this.m_contentDimensions={
			width: contentW
			, height: contentH
			, zoom: zoomRatio||1
		};
		if ($this.m_component.state.isMaximized) {
			return;
		}
		let size=$this.GetImageSize(contentW, contentH, zoomRatio);
		$this.m_component.setState({
			size
		});
	};

	_['public'].ToggleMaximize=function () {
		let $this=_(this);
		let state=$this.m_component.state;
		if (state.isMaximized) {
			$this.m_component.setState({
				isMaximized: false
				, position: state.preMaximizePosition
				, size: state.preMaximizeSize
			});
		}
		else {
			$this.m_component.setState({
				isMaximized: true
				, preMaximizePosition: state.position
				, preMaximizeSize: state.size
				, position: {
					x: 0
					, y: 0
				}
				, size: {
					width: window.innerWidth
					, height: window.innerHeight
				}
			});
		}
	};

	_['private'].HandleMouseDown=function (event) {
		let $this=_(this);
		if (event.button!==0) {
			return;
		}
		$this.m_component.props.onFocus?.();
		let state=$this.m_component.state;
		if ((state.isMaximized)||(state.isResizing)||(event.target.closest('[data-modal-resize]'))) {
			return;
		}
		let canMoveContent=$this.m_component.props.canStartMove?.(event)===true;
		if ((event.target.closest('input,textarea,select,[contenteditable="true"]'))&&(!canMoveContent)) {
			return;
		}
		if ((!event.target.closest('[data-modal-header]'))&&(!canMoveContent)) {
			return;
		}
		let rect=$this.m_modalRef.current.getBoundingClientRect();
		$this.m_dragStart={
			mouseX: event.clientX
			, mouseY: event.clientY
			, posX: rect.left
			, posY: rect.top
			, moved: false
		};
		$this.m_boundMouseMove=(move)=>$this.OnDragMouseMove(move);
		$this.m_boundMouseUp=()=>$this.OnDragMouseUp();
		window.addEventListener('mousemove', $this.m_boundMouseMove, true);
		window.addEventListener('mouseup', $this.m_boundMouseUp, true);
		window.addEventListener('blur', $this.m_boundMouseUp);
		if (event.target.closest('[data-role="canvas-container"]')) {
			event.preventDefault();
			event.stopPropagation();
		}
	};

	_['private'].OnDragMouseMove=function (event) {
		let $this=_(this);
		let start=$this.m_dragStart;
		if ((event.buttons&1)===0) {
			$this.OnDragMouseUp();
			return;
		}
		let deltaX=event.clientX-start.mouseX;
		let deltaY=event.clientY-start.mouseY;
		if ((!start.moved)&&(Math.hypot(deltaX, deltaY)<4)) {
			return;
		}
		start.moved=true;
		$this.m_suppressClick=true;
		event.preventDefault();
		event.stopPropagation();
		$this.m_component.setState({
			isDragging: true
			, position: {
				x: Math.round(start.posX+deltaX)
				, y: Math.round(start.posY+deltaY)
			}
		});
	};

	_['private'].OnDragMouseUp=function () {
		let $this=_(this);
		$this.m_component.setState({
			isDragging: false
		});
		$this.RemoveDragListeners();
		clearTimeout($this.m_clickTimer);
		$this.m_clickTimer=setTimeout(()=>{
			$this.m_suppressClick=false;
		}, 0);
	};

	_['private'].RemoveDragListeners=function () {
		let $this=_(this);
		window.removeEventListener('mousemove', $this.m_boundMouseMove, true);
		window.removeEventListener('mouseup', $this.m_boundMouseUp, true);
		window.removeEventListener('blur', $this.m_boundMouseUp);
		$this.m_boundMouseMove=null;
		$this.m_boundMouseUp=null;
	};

	_['private'].StartResize=function (direction, event) {
		if (event.button!==0) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		let $this=_(this);
		if (typeof $this.m_component.props.onFocus==='function') {
			$this.m_component.props.onFocus();
		}
		let state=$this.m_component.state;
		if (state.isMaximized) {
			return;
		}
		let modal=$this.m_modalRef.current;
		if (!modal) {
			return;
		}
		let rect=modal.getBoundingClientRect();
		$this.m_resizeStart={
			mouseX: event.clientX
			, mouseY: event.clientY
			, posX: rect.left
			, posY: rect.top
			, width: rect.width
			, height: rect.height,
			direction
		};
		$this.m_component.setState({
			isResizing: true
			, resizeDirection: direction
			, position: {
				x: rect.left
				, y: rect.top
			}
			, size: {
				width: rect.width
				, height: rect.height
			}
		});
		$this.m_boundResizeMove=$this.OnResizeMouseMove.bind($this);
		$this.m_boundResizeUp=$this.OnResizeMouseUp.bind($this);
		window.addEventListener('mousemove', $this.m_boundResizeMove);
		window.addEventListener('mouseup', $this.m_boundResizeUp);
	};

	_['private'].OnResizeMouseMove=function (event) {
		let $this=_(this);
		let start=$this.m_resizeStart;
		let dir=start.direction;
		let minDims=this.MeasureContentMinDimensions();
		let deltaX=event.clientX-start.mouseX;
		let deltaY=event.clientY-start.mouseY;
		let newX=start.posX;
		let newY=start.posY;
		let newW=start.width;
		let newH=start.height;
		if (dir.includes('e')) {
			newW=Math.max(minDims.width, start.width+deltaX);
		}
		if (dir.includes('s')) {
			newH=Math.max(minDims.height, start.height+deltaY);
		}
		if (dir.includes('w')) {
			let proposedW=start.width-deltaX;
			if (proposedW>=minDims.width) {
				newW=proposedW;
				newX=start.posX+deltaX;
			}
		}
		if (dir.includes('n')) {
			let proposedH=start.height-deltaY;
			if (proposedH>=minDims.height) {
				newH=proposedH;
				newY=start.posY+deltaY;
			}
		}
		$this.m_component.setState({
			position: {
				x: Math.round(newX)
				, y: Math.round(newY)
			}
			, size: {
				width: Math.round(newW)
				, height: Math.round(newH)
			}
		});
	};

	_['private'].OnResizeMouseUp=function () {
		let $this=_(this);
		$this.m_component.setState({
			isResizing: false
			, resizeDirection: null
		});
		if ($this.m_boundResizeMove) {
			window.removeEventListener('mousemove', $this.m_boundResizeMove);
			$this.m_boundResizeMove=null;
		}
		if ($this.m_boundResizeUp) {
			window.removeEventListener('mouseup', $this.m_boundResizeUp);
			$this.m_boundResizeUp=null;
		}
	};

	_['public'].componentDidMount=function () {
		let $this=_(this);
		$this.m_mouseDownHandler=(event)=>$this.HandleMouseDown(event);
		$this.m_modalRef.current.addEventListener('mousedown', $this.m_mouseDownHandler, true);
		$this.m_clickHandler=(event)=>{
			if ($this.m_suppressClick) {
				event.preventDefault();
				event.stopImmediatePropagation();
			}
		};
		window.addEventListener('click', $this.m_clickHandler, true);
		$this.m_wheelHandler=(event)=>{
			if ((!$this.m_component.props.allowContentWheel)&&(!event.target.closest('textarea,[contenteditable="true"],.fx-prompt-references'))) {
				event.preventDefault();
			}
			event.stopPropagation();
		};
		$this.m_modalRef.current.addEventListener('wheel', $this.m_wheelHandler, {
			passive: false
		});
		this.ResetPosition();
		requestAnimationFrame(()=>{
			if (!$this.m_modalRef.current) {
				return;
			}
			if ($this.m_contentDimensions) {
				let content=$this.m_contentDimensions;
				this.UpdateSize(content.width, content.height, content.zoom);
				return;
			}
			$this.m_calculatedMinSize=null;
			let minDims=this.MeasureContentMinDimensions();
			let size=this.state.size;
			if ((size)&&(size.width<minDims.width||size.height<minDims.height)) {
				this.setState({
					size: {
						width: Math.max(size.width, minDims.width)
						, height: Math.max(size.height, minDims.height)
					}
				});
			}
		});
	};

	_['public'].componentWillUnmount=function () {
		let $this=_(this);
		$this.RemoveDragListeners();
		clearTimeout($this.m_clickTimer);
		$this.m_modalRef.current?.removeEventListener('mousedown', $this.m_mouseDownHandler, true);
		$this.m_modalRef.current?.removeEventListener('wheel', $this.m_wheelHandler);
		window.removeEventListener('click', $this.m_clickHandler, true);
		if ($this.m_boundResizeMove) {
			window.removeEventListener('mousemove', $this.m_boundResizeMove);
		}
		if ($this.m_boundResizeUp) {
			window.removeEventListener('mouseup', $this.m_boundResizeUp);
		}
	};

	_['public'].render=function () {
		let $this=_(this);
		let state=this.state;
		let props=this.props;
		let zIndex=props.zIndex||50;
		let modalStyle={};
		if (state.isMaximized) {
			modalStyle={
				position: 'fixed'
				, left: '0px'
				, top: '0px'
				, width: '100vw'
				, height: '100vh'
				, margin: 0
				, borderRadius: 0,
				zIndex
			};
		}
		else if ((state.position)&&(state.size)) {
			let minDims=$this.m_calculatedMinSize||{
				width: 480
				, height: 520
			};
			modalStyle={
				position: 'fixed'
				, left: `${state.position.x}px`
				, top: `${state.position.y}px`
				, width: `${Math.max(minDims.width, state.size.width)}px`
				, height: `${Math.max(minDims.height, state.size.height)}px`
				, minWidth: `${minDims.width}px`
				, minHeight: `${minDims.height}px`
				, margin: 0,
				zIndex
			};
		}
		else {
			modalStyle={
				position: 'fixed'
				, left: '50%'
				, top: '50%'
				, transform: 'translate(-50%, -50%)'
				, width: 'calc(100vw - 48px)'
				, height: 'calc(100vh - 48px)'
				, maxWidth: '1280px'
				, maxHeight: '900px',
				zIndex
			};
		}
		return React.createElement(
			'div',
			{
				ref: $this.m_modalRef
				, style: modalStyle
				, className: state.isMaximized?'bg-[#202020] flex flex-col select-none border-none shadow-none pointer-events-auto':`rounded-lg border border-[#444444]/60 bg-[#202020] shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] overflow-hidden flex flex-col relative select-none pointer-events-auto transition-shadow ${state.isDragging?'shadow-[0_28px_80px_rgba(0,0,0,0.95)] ring-1 ring-sky-500/50':''}`
			},
			React.createElement(
				'div',
				{
					'data-modal-header': ''
					, onDoubleClick: (event)=>{
						if (!event.target.closest('button')) {
							this.ToggleMaximize();
						}
					}
					, className: 'h-[32px] px-3 bg-[#181818] border-b border-[#2d2d2d] flex items-center justify-between shrink-0 select-none z-30 cursor-default'
				},
				React.createElement(
					'div',
					{
						className: 'flex items-center gap-2 pointer-events-none min-w-0'
					},
					React.createElement(
						'svg',
						{
							className: 'w-4 h-4 shrink-0 text-[#0078d4]'
							, viewBox: '0 0 24 24'
							, fill: 'currentColor'
						},
						React.createElement('rect', {
							x: '2'
							, y: '2'
							, width: '9'
							, height: '9'
							, rx: '1'
							, fill: '#0078d4'
						}),
						React.createElement('rect', {
							x: '13'
							, y: '2'
							, width: '9'
							, height: '9'
							, rx: '1'
							, fill: '#0078d4'
						}),
						React.createElement('rect', {
							x: '2'
							, y: '13'
							, width: '9'
							, height: '9'
							, rx: '1'
							, fill: '#0078d4'
						}),
						React.createElement('rect', {
							x: '13'
							, y: '13'
							, width: '9'
							, height: '9'
							, rx: '1'
							, fill: '#0078d4'
						})
					),
					React.createElement(
						'span',
						{
							className: 'text-[12px] font-normal text-[#cccccc] font-[\'Segoe_UI\',sans-serif] tracking-normal truncate'
						},
						props.title||'Window'
					)
				),
				React.createElement(
					'div',
					{
						className: 'flex items-center h-full -mr-3'
					},
					React.createElement(
						'button',
						{
							type: 'button'
							, onClick: ()=>{
								if (typeof props.onResetPosition==='function') {
									props.onResetPosition();
								}
								else {
									this.ResetPosition();
								}
							}
							, className: 'h-full w-[46px] flex items-center justify-center hover:bg-[#2d2d2d] text-[#cccccc] hover:text-white transition-colors cursor-pointer'
							, title: 'Minimize / Reset'
						},
						React.createElement(
							'svg',
							{
								className: 'w-2.5 h-2.5'
								, viewBox: '0 0 10 10'
								, fill: 'currentColor'
							},
							React.createElement('path', {
								d: 'M0 5h10v1H0z'
							})
						)
					),
					React.createElement(
						'button',
						{
							type: 'button'
							, onClick: ()=>this.ToggleMaximize()
							, className: 'h-full w-[46px] flex items-center justify-center hover:bg-[#2d2d2d] text-[#cccccc] hover:text-white transition-colors cursor-pointer'
							, title: state.isMaximized?'Restore':'Maximize'
						},
						state.isMaximized?React.createElement(
							'svg',
							{
								className: 'w-2.5 h-2.5'
								, viewBox: '0 0 10 10'
								, fill: 'none'
								, stroke: 'currentColor'
								, strokeWidth: '1'
							},
							React.createElement('rect', {
								x: '2.5'
								, y: '0.5'
								, width: '7'
								, height: '7'
							}),
							React.createElement('polyline', {
								points: '0.5,2.5 0.5,9.5 7.5,9.5 7.5,7.5'
							})
						):React.createElement(
							'svg',
							{
								className: 'w-2.5 h-2.5'
								, viewBox: '0 0 10 10'
								, fill: 'none'
								, stroke: 'currentColor'
								, strokeWidth: '1'
							},
							React.createElement('rect', {
								x: '0.5'
								, y: '0.5'
								, width: '9'
								, height: '9'
							})
						)
					),
					React.createElement(
						'button',
						{
							type: 'button'
							, onClick: ()=>{
								if (typeof props.onClose==='function') {
									props.onClose();
								}
							}
							, className: 'h-full w-[46px] flex items-center justify-center hover:bg-[#c42b1c] text-[#cccccc] hover:text-white transition-colors cursor-pointer'
							, title: 'Close (Esc)'
						},
						React.createElement(
							'svg',
							{
								className: 'w-2.5 h-2.5'
								, viewBox: '0 0 10 10'
								, fill: 'currentColor'
							},
							React.createElement('polygon', {
								points: '10 0.7 9.3 0 5 4.3 0.7 0 0 0.7 4.3 5 0 9.3 0.7 10 5 5.7 9.3 10 10 9.3 5.7 5'
							})
						)
					)
				)
			),
			React.createElement(
				'div',
				{
					ref: $this.m_contentHostRef
					, className: 'flex-1 min-h-0 w-full overflow-hidden relative bg-[#202020]'
				},
				props.children
			),
!state.isMaximized?React.createElement(
				React.Fragment,
				null,
				React.createElement('div', {
					'data-modal-resize': ''
					, onMouseDown: (e)=>$this.StartResize('n', e)
					, className: 'absolute top-0 left-2 right-2 h-1 cursor-ns-resize z-40'
				}),
				React.createElement('div', {
					'data-modal-resize': ''
					, onMouseDown: (e)=>$this.StartResize('s', e)
					, className: 'absolute bottom-0 left-2 right-2 h-1 cursor-ns-resize z-40'
				}),
				React.createElement('div', {
					'data-modal-resize': ''
					, onMouseDown: (e)=>$this.StartResize('w', e)
					, className: 'absolute left-0 top-2 bottom-2 w-1 cursor-ew-resize z-40'
				}),
				React.createElement('div', {
					'data-modal-resize': ''
					, onMouseDown: (e)=>$this.StartResize('e', e)
					, className: 'absolute right-0 top-2 bottom-2 w-1 cursor-ew-resize z-40'
				}),
				React.createElement('div', {
					'data-modal-resize': ''
					, onMouseDown: (e)=>$this.StartResize('nw', e)
					, className: 'absolute top-0 left-0 w-2.5 h-2.5 cursor-nwse-resize z-50'
				}),
				React.createElement('div', {
					'data-modal-resize': ''
					, onMouseDown: (e)=>$this.StartResize('ne', e)
					, className: 'absolute top-0 right-0 w-2.5 h-2.5 cursor-nesw-resize z-50'
				}),
				React.createElement('div', {
					'data-modal-resize': ''
					, onMouseDown: (e)=>$this.StartResize('sw', e)
					, className: 'absolute bottom-0 left-0 w-2.5 h-2.5 cursor-nesw-resize z-50'
				}),
				React.createElement('div', {
					'data-modal-resize': ''
					, onMouseDown: (e)=>$this.StartResize('se', e)
					, className: 'absolute bottom-0 right-0 w-2.5 h-2.5 cursor-nwse-resize z-50'
				})
			):null
		);
	};
	_['public'].state=null;
	_['private'].m_mouseDownHandler=null;
	_['private'].m_clickHandler=null;
	_['private'].m_wheelHandler=null;
	_['private'].m_suppressClick=false;
	_['private'].m_clickTimer=null;
	_['private'].m_contentDimensions=null;
	_['private'].m_component=null;
	_['private'].m_modalRef=null;
	_['private'].m_contentHostRef=null;
	_['private'].m_dragStart=null;
	_['private'].m_resizeStart=null;
	_['private'].m_boundMouseMove=null;
	_['private'].m_boundMouseUp=null;
	_['private'].m_boundResizeMove=null;
	_['private'].m_boundResizeUp=null;
	_['private'].m_calculatedMinSize=null;
});
