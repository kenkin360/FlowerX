
var AppStyles=Function.extend(Object, function () {
	var _=this(AppStyles);
	AppStyles=_[AppStyles];
	function AppStyles() {
		_['base'].apply(this, arguments);
	}

	_['public'].Install=function () {
		if ((typeof window!=='undefined')&&(!window.__resizeObserverErrorHandlerInstalled)) {
			window.__resizeObserverErrorHandlerInstalled=true;
			window.addEventListener('error', function (e) {
				if ((e)&&(e.message)&&(e.message.includes('ResizeObserver')||e.message.includes('undelivered notifications'))) {
					e.stopImmediatePropagation();
					e.preventDefault();
				}
			});
		}
		let id='flow-design-system-setup';
		if (document.getElementById(id)) return;
		let style=document.createElement('style');
		style.id=id;
		style.textContent=`
				@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
				.animate-spin-fast { animation: spin 0.8s linear infinite; display: flex !important; align-items: center; justify-content: center; width: 18px; height: 18px; }
				.no-scrollbar::-webkit-scrollbar { display: none; }
				.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
				@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
				@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
				@keyframes toolbarExpand { from { opacity: 0; transform: scale(0.9) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
				.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
				.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
				.animate-toolbar { animation: toolbarExpand 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
				input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; width: 100%; cursor: pointer; padding: 8px 0; }
				input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 3px; background: #333; border-radius: 9999px; }
				input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: white; box-shadow: 0px 1px 3px rgba(0,0,0,0.5); margin-top: -5.5px; cursor: grab; }
				input[type=range]::-webkit-slider-thumb:active { cursor: grabbing; }
				@keyframes pulse-busy { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
				.animate-pulse-busy { animation: pulse-busy 1.5s infinite ease-in-out; }
				.google-sans-flex { font-family: 'Google Sans Flex', sans-serif; font-feature-settings: 'ss02'; }
				html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; background: #000000; color: white; font-family: 'Google Sans Text', 'Google Sans', sans-serif; overflow: hidden; }
			`;
		document.head.appendChild(style);
	};
});
