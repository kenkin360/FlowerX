import './Function.extend.js';

var Module=Function.extend(Promise, function () {
	var _=this(Module);
	Module=_[Module];

	function Module(name, url, readyMember) {
		if (typeof name==='function') {
			_['base'].call(this, name);
			return;
		}
		let resolve;
		let reject;
		_['base'].call(this, (done, fail)=>{
			resolve=done;
			reject=fail;
		})(function () {
			let $this=_(this);
			$this.m_name=name;
			$this.m_url=url;
			$this.m_readyMember=readyMember;
			$this.m_resolve=resolve;
			$this.m_reject=reject;
			$this.m_checkHandler=$this.Check.bind($this);
			$this.m_errorHandler=$this.HandleError.bind($this);
			$this.m_timeoutHandler=$this.HandleTimeout.bind($this);
			$this.Start();
		});
	}

	_['private'].Start=function () {
		let $this=_(this);
		if (typeof document==='undefined') {
			$this.Finish(new Error('External packages require a browser environment'));
			return;
		}
		$this.m_interval=setInterval($this.m_checkHandler, 50);
		$this.m_timeout=setTimeout($this.m_timeoutHandler, 15e3);
		$this.Check();
		if (($this.m_finished)||($this.m_pending)) {
			return;
		}
		let id=$this.m_name+'-loader';
		$this.m_script=document.getElementById(id);
		if ($this.m_script) {
			$this.WatchScript();
			return;
		}
		$this.m_script=document.createElement('script');
		$this.m_created=true;
		$this.m_script.id=id;
		$this.m_script.src=$this.m_url;
		$this.m_script.async=true;
		$this.WatchScript();
		try {
			(document.head||document.body||document.documentElement).appendChild($this.m_script);
		}
		catch (error) {
			$this.Finish(error);
		}
	};

	_['private'].WatchScript=function () {
		let $this=_(this);
		$this.m_script.addEventListener('load', $this.m_checkHandler);
		$this.m_script.addEventListener('error', $this.m_errorHandler);
	};

	_['private'].Check=async function () {
		let $this=_(this);
		if ($this.m_finished) {
			return;
		}
		let value=$this.m_resolved||globalThis[$this.m_name];
		if ((value)&&(typeof value.then==='function')) {
			if (value===$this.m_pending) {
				return;
			}
			$this.m_pending=value;
			try {
				$this.m_resolved=await value;
			}
			catch (error) {
				$this.Finish(error);
				return;
			}
			if ($this.m_pending===value) {
				$this.m_pending=null;
				await $this.Check();
			}
			return;
		}
		if ((value)&&((!$this.m_readyMember)||(value[$this.m_readyMember]))) {
			$this.Finish(null, value);
		}
	};

	_['private'].HandleError=function () {
		_(this).Finish(new Error('Failed to load external package'));
	};

	_['private'].HandleTimeout=function () {
		_(this).Finish(new Error('External package initialization timed out'));
	};

	_['private'].Finish=function (error, value) {
		let $this=_(this);
		if ($this.m_finished) {
			return;
		}
		$this.m_finished=true;
		clearInterval($this.m_interval);
		clearTimeout($this.m_timeout);
		if ($this.m_script) {
			$this.m_script.removeEventListener('load', $this.m_checkHandler);
			$this.m_script.removeEventListener('error', $this.m_errorHandler);
		}
		if (error) {
			if (($this.m_created)&&($this.m_script)) {
				$this.m_script.remove();
			}
			$this.m_reject(error);
		}
		else {
			globalThis[$this.m_name]=value;
			$this.m_resolve(value);
		}
	};

	_['private'].m_name='';
	_['private'].m_url='';
	_['private'].m_readyMember=null;
	_['private'].m_resolve=null;
	_['private'].m_reject=null;
	_['private'].m_script=null;
	_['private'].m_created=false;
	_['private'].m_finished=false;
	_['private'].m_pending=null;
	_['private'].m_resolved=null;
	_['private'].m_interval=null;
	_['private'].m_timeout=null;
	_['private'].m_checkHandler=null;
	_['private'].m_errorHandler=null;
	_['private'].m_timeoutHandler=null;
});

export { Module };
