var promptTemplate=`
<style>
.fx-prompt-shell{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);width:calc(100% - 32px);max-width:600px;z-index:45;font:13px 'Segoe UI',sans-serif;color:#eee;user-select:none}
.fx-prompt-shell [hidden]{display:none!important}
.fx-prompt-box{position:relative;padding:14px 12px 10px;border:1px solid #272727;border-radius:24px;background:rgba(20,21,21,.96);box-shadow:0 8px 28px #0004}
.fx-prompt-shell button{font:inherit;color:inherit;cursor:pointer;border:0;background:none}
.fx-prompt-shell button:disabled{opacity:.4;cursor:default}
.fx-prompt-shell button:focus-visible{outline:2px solid #9bc9ff;outline-offset:2px}
.fx-prompt-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.fx-prompt-references{display:flex;flex:1;gap:8px;overflow-x:auto;overscroll-behavior:contain;padding:2px}
.fx-reference{position:relative;flex:0 0 48px;height:48px;border-radius:10px;overflow:hidden;padding:0!important}
.fx-reference img{width:100%;height:100%;object-fit:cover;display:block}
.fx-reference .fx-reference-remove{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#0008;opacity:0;font-size:22px}
.fx-reference:hover .fx-reference-remove,.fx-reference:focus-visible .fx-reference-remove{opacity:1}
.fx-prompt-input{min-height:36px;max-height:150px;overflow-y:auto;overscroll-behavior:contain;outline:none;white-space:pre-wrap;overflow-wrap:anywhere;user-select:text;cursor:text;padding:2px 6px 8px;line-height:1.65}
.fx-prompt-input[data-empty="true"]:before{content:attr(data-placeholder);color:#858585;pointer-events:none}
.fx-mention{display:inline-block;background:#383838;border-radius:6px;padding:0 6px;margin:0 2px;color:#eee;font-size:12px;vertical-align:baseline;user-select:all}
.fx-prompt-bottom{display:flex;align-items:center;gap:8px;margin-top:8px}
.fx-prompt-shell .fx-prompt-circle{display:flex;align-items:center;justify-content:center;width:32px;height:32px;flex-shrink:0;border-radius:50%;background:#252626;color:#aaa;font-size:21px}
.fx-prompt-shell .fx-prompt-circle:hover{background:#3a3a3a;color:white}
.fx-prompt-shell .fx-settings-trigger{margin-left:auto;border-radius:20px;background:#252626;padding:7px 12px;font-size:11px;display:flex;align-items:center;gap:6px;max-width:calc(100% - 80px)}
.fx-settings-trigger span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fx-prompt-settings{position:absolute;right:36px;bottom:calc(100% + 10px);width:350px;max-width:calc(100% - 16px);padding:8px;border-radius:20px;background:#181919;box-shadow:0 10px 28px #0006}
.fx-prompt-aspects{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;border-bottom:1px solid #393939;padding-bottom:7px;margin-bottom:6px}
.fx-prompt-shell .fx-aspect{min-width:0;display:flex;flex-direction:column;align-items:center;gap:3px;border-radius:12px;padding:6px 1px;font-size:11px}
.fx-aspect .material-symbols-outlined{font-size:18px}
.fx-prompt-resolutions{display:flex;gap:3px;border-bottom:1px solid #393939;padding-bottom:7px;margin-bottom:7px}
.fx-prompt-shell .fx-resolution{flex:1;border-radius:10px;padding:7px 1px;font-size:11px}
.fx-prompt-shell [aria-checked="true"],.fx-prompt-shell [aria-selected="true"]{background:#393b3b}
.fx-prompt-shell .fx-model-trigger{width:100%;border-radius:12px;background:#383a3b;padding:10px 12px;display:flex;justify-content:space-between;text-align:left;font-size:12px}
.fx-model-menu{position:absolute;bottom:8px;left:8px;right:8px;border-radius:18px;background:#1a1b1b;padding:7px;box-shadow:0 8px 28px #0008;z-index:2}
.fx-prompt-shell .fx-model-option{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:18px;font-size:13px}
.fx-prompt-shell .fx-model-option:hover{background:#343636}
.fx-prompt-error{color:#ffadad;margin:8px 6px 0;font-size:12px;white-space:pre-wrap}
</style>
<div class="fx-prompt-box">
	<div class="fx-prompt-top" data-prompt="top" hidden>
		<div class="fx-prompt-references" data-prompt="references"></div>
		<button type="button" data-prompt-action="clear" aria-label="Clear prompt and reference images">\xD7</button>
	</div>
	<div class="fx-prompt-input" data-prompt="input" data-empty="true" data-placeholder="What would you like to change?" role="textbox" aria-label="What would you like to change?" aria-multiline="true" contenteditable="true"></div>
	<div class="fx-prompt-bottom">
		<button type="button" class="fx-prompt-circle" data-prompt-action="add" aria-label="Add reference image">+</button>
		<button type="button" class="fx-settings-trigger" data-prompt-action="settings" aria-label="Model and image ratio" aria-expanded="false"><span data-prompt="summary"></span><span class="material-symbols-outlined" data-prompt="ratio-icon" style="font-size:16px">crop_original</span></button>
		<button type="button" class="fx-prompt-circle" data-prompt-action="generate" aria-label="Generate" disabled><span class="material-symbols-outlined" data-prompt="generate-icon">arrow_forward</span></button>
	</div>
	<div class="fx-prompt-error" data-prompt="error" role="status" hidden></div>
</div>
<div class="fx-prompt-settings" data-prompt="settings" hidden>
	<div class="fx-prompt-aspects" role="radiogroup" aria-label="Generated image aspect ratio">
		<button type="button" class="fx-aspect" data-aspect="original" data-icon="crop_original" role="radio" aria-checked="true"><span class="material-symbols-outlined">crop_original</span>Original</button>
		<button type="button" class="fx-aspect" data-aspect="16:9" data-icon="crop_16_9" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_16_9</span>16:9</button>
		<button type="button" class="fx-aspect" data-aspect="4:3" data-icon="crop_landscape" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_landscape</span>4:3</button>
		<button type="button" class="fx-aspect" data-aspect="1:1" data-icon="crop_square" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_square</span>1:1</button>
		<button type="button" class="fx-aspect" data-aspect="3:4" data-icon="crop_portrait" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_portrait</span>3:4</button>
		<button type="button" class="fx-aspect" data-aspect="9:16" data-icon="crop_9_16" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_9_16</span>9:16</button>
		<button type="button" class="fx-aspect" data-aspect="1:4" data-icon="crop_portrait" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_portrait</span>1:4</button>
		<button type="button" class="fx-aspect" data-aspect="1:8" data-icon="crop_portrait" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_portrait</span>1:8</button>
		<button type="button" class="fx-aspect" data-aspect="2:3" data-icon="crop_portrait" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_portrait</span>2:3</button>
		<button type="button" class="fx-aspect" data-aspect="3:2" data-icon="crop_landscape" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_landscape</span>3:2</button>
		<button type="button" class="fx-aspect" data-aspect="4:1" data-icon="crop_landscape" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_landscape</span>4:1</button>
		<button type="button" class="fx-aspect" data-aspect="4:5" data-icon="crop_portrait" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_portrait</span>4:5</button>
		<button type="button" class="fx-aspect" data-aspect="5:4" data-icon="crop_landscape" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_landscape</span>5:4</button>
		<button type="button" class="fx-aspect" data-aspect="8:1" data-icon="crop_landscape" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_landscape</span>8:1</button>
		<button type="button" class="fx-aspect" data-aspect="21:9" data-icon="crop_landscape" role="radio" aria-checked="false"><span class="material-symbols-outlined">crop_landscape</span>21:9</button>
	</div>
	<div class="fx-prompt-resolutions" role="radiogroup" aria-label="Output resolution">
		<button type="button" class="fx-resolution" data-resolution="Default" role="radio" aria-checked="true">Default</button>
		<button type="button" class="fx-resolution" data-resolution="2K" role="radio" aria-checked="false">2K</button>
		<button type="button" class="fx-resolution" data-resolution="4K" role="radio" aria-checked="false">4K</button>
		<button type="button" class="fx-resolution" data-resolution="8K" role="radio" aria-checked="false">8K</button>
	</div>
	<button type="button" class="fx-model-trigger" data-prompt-action="models" aria-haspopup="listbox" aria-expanded="false"><span data-prompt="model"></span><span>\u25BE</span></button>
	<div class="fx-model-menu" data-prompt="models" role="listbox" aria-label="Select model" hidden>
		<button type="button" class="fx-model-option" data-model="\u{1F34C} Nano Banana Pro" role="option" aria-selected="false">\u{1F34C} Nano Banana Pro</button>
		<button type="button" class="fx-model-option" data-model="\u{1F34C} Nano Banana 2 Lite" role="option" aria-selected="false">\u{1F34C} Nano Banana 2 Lite</button>
		<button type="button" class="fx-model-option" data-model="\u{1F34C} Nano Banana 2.1" role="option" aria-selected="true">\u{1F34C} Nano Banana 2.1</button>
	</div>
</div>
`;
