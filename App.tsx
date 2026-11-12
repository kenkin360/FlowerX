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
		let component=this;
		let $this=_(this);
		$this.m_loaded={};
		$this.m_progress={
			Key: ''
			, File: ''
			, Completed: 0
			, Total: Bundle.Config.length
			, Value: null
			, Error: null
		};
		$this.m_splashRef=React.createRef();
		$this.m_reloadHandler=function () {
			$this.Load(component);
		};
	}

	_['public'].componentDidMount=function () {
		Object.assign(globalThis, {React, Flow, fabric});
		_(this).Load(this);
	};

	_['private'].Load=function (component) {
		let $this=_(component);
		if ($this.m_loading) {
			return;
		}
		$this.m_loading=true;
		$this.m_error=null;
		$this.m_gallery=null;
		$this.m_loaded={};
		$this.m_progress={
			Key: ''
			, File: ''
			, Completed: 0
			, Total: Bundle.Config.length
			, Value: null
			, Error: null
		};
		component.forceUpdate();
		Bundle.Load(function (progress) {
			let app=_(component);
			app.m_progress=progress;
			if (progress.Value!==null) {
				app.m_loaded[progress.Key]=progress.Value;
			}
			if ((progress.Value!==null)&&(app.IsSplashReady())) {
				component.forceUpdate(function () {
					_(component).UpdateSplash();
				});
			}
			else {
				app.UpdateSplash();
			}
		}).then(function (loaded) {
			let app=_(component);
			app.m_loading=false;
			app.m_gallery=loaded.Gallery;
			component.forceUpdate();
		}, function (error) {
			let app=_(component);
			app.m_loading=false;
			app.m_error=error;
			console.error(error);
			component.forceUpdate(function () {
				_(component).UpdateSplash();
			});
		});
	};

	_['private'].IsSplashReady=function () {
		return !!((this.m_loaded.splashTemplate)&&(this.m_loaded.splashPicture));
	};

	_['private'].UpdateSplash=function () {
		let root=this.m_splashRef.current;
		if (!root) {
			return;
		}
		let splash=root.querySelector('[data-splash="root"]');
		if (!splash) {
			return;
		}
		let picture=root.querySelector('[data-splash="picture"]');
		if ((picture)&&(picture.src!==this.m_loaded.splashPicture.src)) {
			picture.src=this.m_loaded.splashPicture.src;
		}
		let progress=this.m_progress;
		let total=progress.Total;
		let completed=progress.Completed;
		let percent=total?Math.max(0, Math.min(100, completed*100/total)):0;
		let error=this.m_error||progress.Error;
		let file=progress.File;
		let detail=error?(file?file+': ':'')+(error.message||String(error)):file||'Starting...';
		splash.classList.toggle('fx-splash-error', !!error);
		splash.setAttribute('role', error?'alert':'status');
		root.querySelector('[data-splash="file"]').textContent=detail;
		root.querySelector('[data-splash="progress"]').style.width=percent+'%';
		root.querySelector('[data-splash="count"]').textContent=completed+' / '+total;
		let bar=root.querySelector('[data-splash="bar"]');
		bar.setAttribute('aria-valuemax', total);
		bar.setAttribute('aria-valuenow', completed);
	};

	_['private'].RenderLoader=function () {
		let children=[];
		if (this.IsSplashReady()) {
			children.push(React.createElement('div', {
				key: 'splash'
				, ref: this.m_splashRef
				, dangerouslySetInnerHTML: {
					__html: this.m_loaded.splashTemplate
				}
			}));
		}
		if (this.m_error) {
			children.push(React.createElement('div', {
				key: 'reload'
				, style: {
					position: 'fixed'
					, top: 0
					, left: 0
					, width: '100vw'
					, height: '100vh'
					, display: 'grid'
					, placeItems: 'center'
					, zIndex: 100
				}
			}, React.createElement('button', {
				type: 'button'
				, onClick: this.m_reloadHandler
				, style: {
					padding: '10px 20px'
					, border: '1px solid #ffffff47'
					, borderRadius: 8
					, background: '#17191ddd'
					, boxShadow: '0 8px 28px #0008'
					, color: '#fff'
					, cursor: 'pointer'
					, font: "14px 'Segoe UI', sans-serif"
				}
			}, 'Reload')));
		}
		return React.createElement('div', {
			style: {
				position: 'fixed'
				, top: 0
				, left: 0
				, width: '100vw'
				, height: '100vh'
				, display: 'grid'
				, placeItems: 'center'
				, overflow: 'hidden'
			}
		}, children);
	};

	_['public'].render=function () {
		let $this=_(this);
		if (!$this.m_gallery) {
			return $this.RenderLoader();
		}
		return React.createElement($this.m_gallery, {...this.props, HostSourceUrl: import.meta.url});
	};

	_['private'].m_gallery=null;
	_['private'].m_error=null;
	_['private'].m_loaded=null;
	_['private'].m_loading=false;
	_['private'].m_progress=null;
	_['private'].m_splashRef=null;
	_['private'].m_reloadHandler=null;
});

export default App;

