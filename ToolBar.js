
var ToolBar=Function.extend(Object, function () {
	var _=this(ToolBar);
	ToolBar=_[ToolBar];
	function ToolBar() {
		_['base'].apply(this, arguments);
		_(this).m_tools=[];
		_(this).m_toolsById=Object.create(null);
		_(this).m_toolsByShortcut=Object.create(null);
	}

	_['public'].Register=function (tool) {
		if (!(tool instanceof ToolButton)) {
			throw new TypeError('Tool must inherit ToolButton');
		}
		let id=tool.Id||tool.Key;
		if (!id) {
			throw new Error('Tool Id is required');
		}
		let data=_(this);
		if (data.m_toolsById[id]) {
			throw new Error('Duplicate tool Id: '+id);
		}
		let shortcut=tool.Shortcut?String(tool.Shortcut).toLowerCase():'';
		if ((shortcut)&&(data.m_toolsByShortcut[shortcut])) {
			throw new Error('Duplicate tool shortcut: '+shortcut);
		}
		data.m_tools.push(tool);
		data.m_toolsById[id]=tool;
		if (shortcut) {
			data.m_toolsByShortcut[shortcut]=tool;
		}
	};

	_['public'].GetTools=function () {
		return _(this).m_tools.slice();
	};

	_['public'].GetById=function (id) {
		return _(this).m_toolsById[id]||null;
	};

	_['public'].GetByShortcut=function (key) {
		if (!key) {
			return null;
		}
		return _(this).m_toolsByShortcut[String(key).toLowerCase()]||null;
	};
	_['private'].m_tools=null;
	_['private'].m_toolsById=null;
	_['private'].m_toolsByShortcut=null;
});
