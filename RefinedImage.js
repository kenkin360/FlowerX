
var RefinedImage=Function.extend(Object, function () {
	var _=this(RefinedImage);
	RefinedImage=_[RefinedImage];
	function RefinedImage(values) {
		_['base'].apply(this, arguments);
		this.Id=values.Id;
		this.DataUrl=values.DataUrl;
		this.Base64=values.Base64;
		this.SketchBase64=values.SketchBase64;
		this.Prompt=values.Prompt;
		this.Timestamp=values.Timestamp;
		this.Status=values.Status;
		this.Model=values.Model;
	}
	_['public'].Id=null;
	_['public'].DataUrl=null;
	_['public'].Base64=null;
	_['public'].SketchBase64=null;
	_['public'].Prompt=null;
	_['public'].Timestamp=null;
	_['public'].Status=null;
	_['public'].Model=null;
});
