
var Color=Function.extend(Object, function () {
	var _=this(Color);
	Color=_[Color];
	function Color(value) {
		_['base'].apply(this, arguments);
		_(this).m_value=value;
	}

	_['public'].toString=function () {
		return _(this).m_value;
	};

	_['public'].toJSON=function () {
		return _(this).m_value;
	};

	Color.GetValues=function () {
		let keys=Object.keys(Color);
		return keys.filter((x)=>Color[x] instanceof Color).map((x)=>Color[x]);
	};
	Color.Black=new Color('#000000');
	Color.Maroon=new Color('#800000');
	Color.Green=new Color('#008000');
	Color.Olive=new Color('#808000');
	Color.Navy=new Color('#000080');
	Color.Purple=new Color('#800080');
	Color.Teal=new Color('#008080');
	Color.Silver=new Color('#C0C0C0');
	Color.Gray=new Color('#808080');
	Color.Red=new Color('#FF0000');
	Color.Lime=new Color('#00FF00');
	Color.Yellow=new Color('#FFFF00');
	Color.Blue=new Color('#0000FF');
	Color.Fuchsia=new Color('#FF00FF');
	Color.Aqua=new Color('#00FFFF');
	Color.White=new Color('#FFFFFF');
	_['private'].m_value;
});
