
var SaveState=Function.extend(Object, function () {
	var _=this(SaveState);
	SaveState=_[SaveState];
	function SaveState(value) {
		_['base'].apply(this, arguments);
		_(this).m_value=value;
	}

	_['public'].toString=function () {
		return _(this).m_value;
	};

	_['public'].toJSON=function () {
		return _(this).m_value;
	};

	SaveState.GetValues=function () {
		let keys=Object.keys(SaveState);
		return keys.filter((x)=>SaveState[x] instanceof SaveState).map((x)=>SaveState[x]);
	};
	SaveState.Idle=new SaveState('idle');
	SaveState.Saving=new SaveState('saving');
	SaveState.Saved=new SaveState('saved');
	SaveState.Error=new SaveState('error');
	_['private'].m_value;
});
