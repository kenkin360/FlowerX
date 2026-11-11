
var KeyboardCommands=Function.extend(Object, function () {
	var _=this(KeyboardCommands);
	KeyboardCommands=_[KeyboardCommands];
	function KeyboardCommands(actions) {
		_['base'].apply(this, arguments);
		_(this).m_actions=actions;
	}

	_['public'].HandleKeyDown=function (event) {
		if (event.target?.isContentEditable) {
			return;
		}
		let actions=_(this).m_actions;
		let context=actions.GetContext();
		if (event.key==='Escape') {
			if (context.IsSettingsOpen) {
				context.SetIsSettingsOpen(false);
				return;
			}
			if (context.IsCanvasBusy) {
				actions.ExecuteCanvasCommand('CancelDrawing');
				return;
			}
		}
		if (['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName)) {
			return;
		}
		let isMac=navigator.platform.toUpperCase().includes('MAC');
		let modifier=isMac?event.metaKey:event.ctrlKey;
		let key=event.key.toLowerCase();
		if ((modifier)&&(key==='z')) {
			actions.ExecuteCanvasCommand(event.shiftKey?'Redo':'Undo');
			event.preventDefault();
			return;
		}
		if (modifier) {
			if ((key==='c')&&(!event.shiftKey)) {
				actions.ExecuteCanvasCommand('Copy');
				return;
			}
			if (key==='v') {
				actions.ExecuteCanvasCommand('Paste');
				return;
			}
			if (key==='d') {
				actions.ExecuteCanvasCommand('Duplicate');
				event.preventDefault();
				return;
			}
			if (key==='s') {
				actions.Save();
				event.preventDefault();
				return;
			}
		}
		if ((key==='delete')||(key==='backspace')) {
			actions.ExecuteCanvasCommand('DeleteSelected');
			return;
		}
		if (key==='[') {
			actions.ExecuteCanvasCommand('SendBackwards');
			return;
		}
		if (key===']') {
			actions.ExecuteCanvasCommand('BringForward');
			return;
		}
		if (context.IsCanvasBusy) {
			return;
		}
		let toolBar=context.ToolBar;
		let tool=toolBar?.GetByShortcut(key);
		if (tool) {
			actions.SelectTool(tool);
		}
	};
	_['private'].m_actions=null;
});
