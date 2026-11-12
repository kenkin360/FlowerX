import './Function.extend.js';
import { Resource } from './Resource.js';

var Bundle=Function.extend(Function, function () {
	var _=this(Bundle);
	Bundle=_[Bundle];

	function Bundle() {
		_['base'].apply(this, arguments);
	}

	Bundle.Load=async function (onProgress) {
		let loaded={};
		let total=Bundle.Config.length;
		let completed=0;
		for(let i=total; i-->0; ) {
			let [key, url, readyMember]=Bundle.Config[i];
			let file=url.split(/[?#]/)[0].split('/').pop();
			let progress={
				Key: key
				, File: file
				, Completed: completed
				, Total: total
				, Value: null
				, Error: null
			};
			onProgress?.(progress);
			try {
				let value=await Bundle.Create(key, url, readyMember);
				loaded[key]=value;
				completed++;
				onProgress?.({
					...progress
					, Completed: completed
					, Value: value
				});
			}
			catch (error) {
				onProgress?.({
					...progress
					, Error: error
				});
				throw error;
			}
		}
		return loaded;
	};

	Bundle.Create=function (name, url, readyMember) {
		let path=url.split(/[?#]/)[0];
		let extension=path.slice(path.lastIndexOf('.')+1).toLowerCase();
		let Type=Bundle.Types[extension];
		if (!Type) {
			throw new Error('Unsupported external resource type: '+extension);
		}
		return new Type(name, url, readyMember);
	};

	Bundle.Types={
		js: Resource.Module
		, png: Resource.Picture
		, jpg: Resource.Picture
		, jpeg: Resource.Picture
		, webp: Resource.Picture
		, gif: Resource.Picture
		, svg: Resource.Picture
	};

	Bundle.FlowerX=function (x) {
		return `https://esm.sh/gh/kenkin360/FlowerX/${x}?raw`;
	};
	Bundle.Config=[
		['UndoButton', Bundle.FlowerX('tools/UndoButton.js')]
		, ['TextTool', Bundle.FlowerX('tools/TextTool.js')]
		, ['SprayTool', Bundle.FlowerX('tools/SprayTool.js')]
		, ['SaveButton', Bundle.FlowerX('tools/SaveButton.js')]
		, ['RedoButton', Bundle.FlowerX('tools/RedoButton.js')]
		, ['RectangleTool', Bundle.FlowerX('tools/RectangleTool.js')]
		, ['RectSelectTool', Bundle.FlowerX('tools/RectSelectTool.js')]
		, ['PickTool', Bundle.FlowerX('tools/PickTool.js')]
		, ['PencilTool', Bundle.FlowerX('tools/PencilTool.js')]
		, ['PasteButton', Bundle.FlowerX('tools/PasteButton.js')]
		, ['OpenButton', Bundle.FlowerX('tools/OpenButton.js')]
		, ['LoadButton', Bundle.FlowerX('tools/LoadButton.js')]
		, ['LineTool', Bundle.FlowerX('tools/LineTool.js')]
		, ['FlipVerticalButton', Bundle.FlowerX('tools/FlipVerticalButton.js')]
		, ['FlipHorizontalButton', Bundle.FlowerX('tools/FlipHorizontalButton.js')]
		, ['FillTool', Bundle.FlowerX('tools/FillTool.js')]
		, ['EyedropperTool', Bundle.FlowerX('tools/EyedropperTool.js')]
		, ['ExportButton', Bundle.FlowerX('tools/ExportButton.js')]
		, ['EllipseTool', Bundle.FlowerX('tools/EllipseTool.js')]
		, ['CopyButton', Bundle.FlowerX('tools/CopyButton.js')]
		, ['ClearButton', Bundle.FlowerX('tools/ClearButton.js')]
		, ['BezierTool', Bundle.FlowerX('tools/BezierTool.js')]
		, ['ToolSettingsActions', Bundle.FlowerX('ToolSettingsActions.js')]
		, ['EditorTool', Bundle.FlowerX('EditorTool.js')]
		, ['ToolButton', Bundle.FlowerX('ToolButton.js')]
		, ['ToolBar', Bundle.FlowerX('ToolBar.js')]
		, ['SprayMode', Bundle.FlowerX('SprayMode.js')]
		, ['SelectionRegion', Bundle.FlowerX('SelectionRegion.js')]
		, ['SaveState', Bundle.FlowerX('SaveState.js')]
		, ['RefinedImage', Bundle.FlowerX('RefinedImage.js')]
		, ['PromptBox', Bundle.FlowerX('PromptBox.js')]
		, ['Modal', Bundle.FlowerX('Modal.js')]
		, ['KeyboardCommands', Bundle.FlowerX('KeyboardCommands.js')]
		, ['ImageGenerationService', Bundle.FlowerX('ImageGenerationService.js')]
		, ['HtmlNode', Bundle.FlowerX('HtmlNode.js')]
		, ['Gallery', Bundle.FlowerX('Gallery.js')]
		, ['FlowImageService', Bundle.FlowerX('FlowImageService.js')]
		, ['Editor', Bundle.FlowerX('Editor.js')]
		, ['DrawingCanvasHistory', Bundle.FlowerX('DrawingCanvasHistory.js')]
		, ['DrawingCanvasFloodFill', Bundle.FlowerX('DrawingCanvasFloodFill.js')]
		, ['DrawingCanvasEngine', Bundle.FlowerX('DrawingCanvasEngine.js')]
		, ['DrawingCanvasClipboard', Bundle.FlowerX('DrawingCanvasClipboard.js')]
		, ['Color', Bundle.FlowerX('Color.js')]
		, ['CanvasTools', Bundle.FlowerX('CanvasTools.js')]
		, ['CanvasSurface', Bundle.FlowerX('CanvasSurface.js')]
		, ['CanvasDocument', Bundle.FlowerX('CanvasDocument.js')]
		, ['AppStyles', Bundle.FlowerX('AppStyles.js')]
		, ['AppActions', Bundle.FlowerX('AppActions.js')]
		, ['AdvancedSprayBrush', Bundle.FlowerX('AdvancedSprayBrush.js')]
		, ['promptTemplate', Bundle.FlowerX('views/prompt.html.js')]
		, ['galleryTemplate', Bundle.FlowerX('views/gallery.html.js')]
		, ['editorTemplate', Bundle.FlowerX('views/editor.html.js')]
		, ['cv', 'https://cdn.jsdelivr.net/npm/@techstark/opencv-js/dist/opencv.js', 'Mat']
		, ['splashPicture', Bundle.FlowerX('images/splash.png')]
		, ['splashTemplate', Bundle.FlowerX('views/splash.html.js')]
	];
});

export { Bundle };

