
var HtmlNode=Function.extend(Object, function () {
	var _=this(HtmlNode);
	HtmlNode=_[HtmlNode];
	function HtmlNode(node) {
		_['base'].apply(this, arguments);
		_(this).m_node=node||null;
		if (null==_(this).m_node) {
			this.Show=this.SetText=this.SetValue=this.SetClasses=this.SetStyle=this.SetTitle=this.SetDisabled=this.SetSource=this.ToggleClass=this.AppendChild=function () {
			};
		}
	}

	_['public'].GetElement=function () {
		return _(this).m_node;
	};

	_['public'].Show=function (visible) {
		let node=_(this).m_node;
		if (!node) return;
		node.hidden=!visible;
		node.style.display=visible?'':'none';
	};

	_['public'].SetText=function (value) {
		let node=_(this).m_node;
		if (!node) return;
		node.textContent=''+value;
	};

	_['public'].SetValue=function (value) {
		let node=_(this).m_node;
		if (!node) return;
		node.value=''+value;
	};

	_['public'].SetClasses=function (classes) {
		let node=_(this).m_node;
		if (!node) return;
		node.className=classes;
	};

	_['public'].SetStyle=function (property, value) {
		let node=_(this).m_node;
		if (!node) return;
		node.style[property]=value;
	};

	_['public'].SetTitle=function (title) {
		let node=_(this).m_node;
		if (!node) return;
		node.title=title;
	};

	_['public'].SetDisabled=function (disabled) {
		let node=_(this).m_node;
		if (!node) return;
		node.disabled=!!disabled;
	};

	_['public'].SetSource=function (src) {
		let node=_(this).m_node;
		if (!node) return;
		node.src=src;
	};

	_['public'].ToggleClass=function (className, condition) {
		let node=_(this).m_node;
		if (!node) return;
		if (condition) {
			node.classList.add(className);
		}
		else {
			node.classList.remove(className);
		}
	};

	_['public'].AppendChild=function (child) {
		let node=_(this).m_node;
		if (!node) return;
		if (child instanceof HtmlNode) {
			let el=child.GetElement();
			if (el) node.appendChild(el);
		}
		else if (child instanceof HTMLElement) {
			node.appendChild(child);
		}
	};
	_['private'].m_node=null;
});
