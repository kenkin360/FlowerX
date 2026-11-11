
var ToolButton=Function.extend(Object, function () {
	var _=this(ToolButton);
	ToolButton=_[ToolButton];
	function ToolButton(key, icon, title, shortcut) {
		_['base'].apply(this, arguments);
		this.Key=key||'';
		this.Id=this.Key;
		this.Icon=icon||'edit';
		this.Title=title||'';
		this.Shortcut=shortcut||'';
	}

	_['public'].Execute=function (actions) {
	};

	_['public'].IsDisabled=function (context) {
		return false;
	};
	_['public'].Key=null;
	_['public'].Id=null;
	_['public'].Title=null;
	_['public'].Icon=null;
	_['public'].Shortcut=null;
});
