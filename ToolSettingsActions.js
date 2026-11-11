
var ToolSettingsActions=Function.extend(Object, function () {
	var _=this(ToolSettingsActions);
	ToolSettingsActions=_[ToolSettingsActions];
	function ToolSettingsActions(actions, panelRef) {
		_['base'].apply(this, arguments);
		_(this).m_actions=actions;
		_(this).m_panelRef=panelRef;
	}

	_['public'].HandleOutsideClick=function (event) {
		let context=_(this).m_actions.GetContext();
		if (!context.IsSettingsOpen) return;
		let target=event.target;
		if ((_(this).m_panelRef.current?.contains(target))||(target.closest?.('.tool-button'))) return;
		context.SetIsSettingsOpen(false);
	};

	_['public'].ChooseCustomColor=async function (event) {
		if ((typeof window==='undefined')||(!('EyeDropper' in window))) return;
		event.preventDefault();
		try {
			let eyeDropper=new window.EyeDropper();
			let result=await eyeDropper.open();
			if (result?.sRGBHex) _(this).m_actions.GetContext().SetColor(new Color(result.sRGBHex.toUpperCase()));
		}
		catch (error) {
		}
	};

	_['public'].ChooseColor=function (value) {
		_(this).m_actions.GetContext().SetColor(new Color(value.toUpperCase()));
	};

	_['public'].GetColorOptions=function (color) {
		let selected=String(color).toUpperCase();
		return Color.GetValues().map((value)=>({Color: value, Value: String(value), IsSelected: String(value).toUpperCase()===selected}));
	};
	_['private'].m_actions=null;
	_['private'].m_panelRef=null;
});
