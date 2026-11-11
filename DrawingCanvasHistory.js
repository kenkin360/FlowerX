
var DrawingCanvasHistory=Function.extend(Object, function () {
	var _=this(DrawingCanvasHistory);
	DrawingCanvasHistory=_[DrawingCanvasHistory];
	function DrawingCanvasHistory(canvas, onStateChange) {
		_['base'].apply(this, arguments);
		_(this).m_canvas=canvas;
		_(this).m_onStateChange=onStateChange;
		_(this).m_undoStack=[];
		_(this).m_redoStack=[];
		_(this).m_isHandlingHistory=false;
	}

	_['public'].Save=function () {
		var canvas=_(this).m_canvas;
		if ((_(this).m_isHandlingHistory)||(!canvas)) {
			return;
		}
		var currentState=JSON.stringify(canvas.toObject(['isBackground', 'isUI', 'isFillLayer']));
		var undoStack=_(this).m_undoStack;
		var lastState=undoStack[undoStack.length-1];
		if (currentState!==lastState) {
			undoStack.push(currentState);
			_(this).m_redoStack=[];
			if (undoStack.length>50) {
				undoStack.shift();
			}
		}
	};

	_['public'].Undo=function () {
		var canvas=_(this).m_canvas;
		var undoStack=_(this).m_undoStack;
		if ((undoStack.length<=1)||(!canvas)) {
			return;
		}
		var $this=_(this);
		$this.m_isHandlingHistory=true;
		var current=undoStack.pop();
		$this.m_redoStack.push(current);
		var previous=undoStack[undoStack.length-1];
		canvas.loadFromJSON(previous).then(function () {
			canvas.renderAll();
			$this.m_isHandlingHistory=false;
			if ($this.m_onStateChange) {
				$this.m_onStateChange();
			}
		});
	};

	_['public'].Redo=function () {
		var canvas=_(this).m_canvas;
		var redoStack=_(this).m_redoStack;
		if ((redoStack.length===0)||(!canvas)) {
			return;
		}
		var $this=_(this);
		$this.m_isHandlingHistory=true;
		var next=redoStack.pop();
		$this.m_undoStack.push(next);
		canvas.loadFromJSON(next).then(function () {
			canvas.renderAll();
			$this.m_isHandlingHistory=false;
			if ($this.m_onStateChange) {
				$this.m_onStateChange();
			}
		});
	};

	_['public'].Clear=function () {
		_(this).m_undoStack=[];
		_(this).m_redoStack=[];
	};
	_['private'].m_canvas=null;
	_['private'].m_onStateChange=null;
	_['private'].m_undoStack=null;
	_['private'].m_redoStack=null;
	_['private'].m_isHandlingHistory=false;
});
