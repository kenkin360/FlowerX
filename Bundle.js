import './Function.extend.js';
import { Module } from './Module.js';

var Bundle=Function.extend(Function, function () {
	var _=this(Bundle);
	Bundle=_[Bundle];

	function Bundle() {
		_['base'].apply(this, arguments);
	}

	Bundle.Load=async function () {
		let loaded={};
		for(let i=Bundle.Config.length; i-->0; ) {
			let [key, url, readyMember]=Bundle.Config[i];
			loaded[key]=await new Module(key, url, readyMember);
		}
		return loaded;
	};

	let cdn='https://esm.sh/gh/kenkin360/FlowerX/';
	Bundle.Config=[
		['UndoButton', cdn+'tools/UndoButton.js?raw'],
		['TextTool', cdn+'tools/TextTool.js?raw'],
		['SprayTool', cdn+'tools/SprayTool.js?raw'],
		['SaveButton', cdn+'tools/SaveButton.js?raw'],
		['RedoButton', cdn+'tools/RedoButton.js?raw'],
		['RectangleTool', cdn+'tools/RectangleTool.js?raw'],
		['RectSelectTool', cdn+'tools/RectSelectTool.js?raw'],
		['PickTool', cdn+'tools/PickTool.js?raw'],
		['PencilTool', cdn+'tools/PencilTool.js?raw'],
		['PasteButton', cdn+'tools/PasteButton.js?raw'],
		['OpenButton', cdn+'tools/OpenButton.js?raw'],
		['LoadButton', cdn+'tools/LoadButton.js?raw'],
		['LineTool', cdn+'tools/LineTool.js?raw'],
		['FlipVerticalButton', cdn+'tools/FlipVerticalButton.js?raw'],
		['FlipHorizontalButton', cdn+'tools/FlipHorizontalButton.js?raw'],
		['FillTool', cdn+'tools/FillTool.js?raw'],
		['EyedropperTool', cdn+'tools/EyedropperTool.js?raw'],
		['ExportButton', cdn+'tools/ExportButton.js?raw'],
		['EllipseTool', cdn+'tools/EllipseTool.js?raw'],
		['CopyButton', cdn+'tools/CopyButton.js?raw'],
		['ClearButton', cdn+'tools/ClearButton.js?raw'],
		['BezierTool', cdn+'tools/BezierTool.js?raw'],
		['ToolSettingsActions', cdn+'ToolSettingsActions.js?raw'],
		['EditorTool', cdn+'EditorTool.js?raw'],
		['ToolButton', cdn+'ToolButton.js?raw'],
		['ToolBar', cdn+'ToolBar.js?raw'],
		['SprayMode', cdn+'SprayMode.js?raw'],
		['SelectionRegion', cdn+'SelectionRegion.js?raw'],
		['SaveState', cdn+'SaveState.js?raw'],
		['RefinedImage', cdn+'RefinedImage.js?raw'],
		['PromptBox', cdn+'PromptBox.js?raw'],
		['Modal', cdn+'Modal.js?raw'],
		['KeyboardCommands', cdn+'KeyboardCommands.js?raw'],
		['ImageGenerationService', cdn+'ImageGenerationService.js?raw'],
		['HtmlNode', cdn+'HtmlNode.js?raw'],
		['Gallery', cdn+'Gallery.js?raw'],
		['FlowImageService', cdn+'FlowImageService.js?raw'],
		['Editor', cdn+'Editor.js?raw'],
		['DrawingCanvasHistory', cdn+'DrawingCanvasHistory.js?raw'],
		['DrawingCanvasFloodFill', cdn+'DrawingCanvasFloodFill.js?raw'],
		['DrawingCanvasEngine', cdn+'DrawingCanvasEngine.js?raw'],
		['DrawingCanvasClipboard', cdn+'DrawingCanvasClipboard.js?raw'],
		['Color', cdn+'Color.js?raw'],
		['CanvasTools', cdn+'CanvasTools.js?raw'],
		['CanvasSurface', cdn+'CanvasSurface.js?raw'],
		['CanvasDocument', cdn+'CanvasDocument.js?raw'],
		['AppStyles', cdn+'AppStyles.js?raw'],
		['AppActions', cdn+'AppActions.js?raw'],
		['AdvancedSprayBrush', cdn+'AdvancedSprayBrush.js?raw'],
		['promptTemplate', cdn+'views/prompt.html.js?raw'],
		['galleryTemplate', cdn+'views/gallery.html.js?raw'],
		['editorTemplate', cdn+'views/editor.html.js?raw'],
		['cv', 'https://cdn.jsdelivr.net/npm/@techstark/opencv-js/dist/opencv.js', 'Mat']
	];
});

export { Bundle };
