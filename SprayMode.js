
var SprayMode=Function.extend(Object, function () {
	var _=this(SprayMode);
	SprayMode=_[SprayMode];
	function SprayMode(value) {
		_['base'].apply(this, arguments);
		_(this).m_value=value;
	}

	_['public'].toString=function () {
		return _(this).m_value;
	};

	_['public'].toJSON=function () {
		return _(this).m_value;
	};

	SprayMode.GetValues=function () {
		let keys=Object.keys(SprayMode);
		return keys.filter((x)=>SprayMode[x] instanceof SprayMode).map((x)=>SprayMode[x]);
	};
	SprayMode.Noise=new SprayMode('noise');
	SprayMode.Hair=new SprayMode('hair');
	_['private'].m_value;
});
