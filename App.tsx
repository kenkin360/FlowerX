import './Function.extend.js';
import React from 'react';
import { Flow } from 'flow-sdk';
import * as fabric from 'fabric';
import { Bundle } from './Bundle.js';

var App=Function.extend(React.Component, function () {
	var _=this(App);
	App=_[App];

	function App(props) {
		_['base'].apply(this, arguments);
	}

	_['public'].componentDidMount=function () {
		let component=this;
		Object.assign(globalThis, {React, Flow, fabric});

		Bundle.Load().then(function (loaded) {
			_(component).m_gallery=loaded.Gallery;
			component.forceUpdate();
		}, function (error) {
			_(component).m_error=error;
			component.forceUpdate();
		});
	};

	_['public'].render=function () {
		let $this=_(this);

		if ($this.m_error) {
			return React.createElement('div', {role: 'alert'}, $this.m_error.message);
		}
		if (!$this.m_gallery) {
			return React.createElement('div', null, 'Loading FlowerX...');
		}
		return React.createElement($this.m_gallery, {...this.props, HostSourceUrl: import.meta.url});
	};

	_['private'].m_gallery=null;
	_['private'].m_error=null;
});

export default App;
