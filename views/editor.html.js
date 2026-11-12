var editorTemplate=`
<div data-role="app" class="flex h-full w-full bg-[#202020] text-[#e0e0e0] overflow-hidden select-none font-['Segoe_UI',sans-serif]">
	<div data-role="settings-panel" hidden class="fixed z-[100] w-[210px] bg-[#2b2b2b]/95 backdrop-blur-xl border border-[#444444] rounded-lg shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-100">
		<div class="flex flex-col gap-3.5">
			<section data-role="brush-section" class="space-y-1.5">
				<div class="flex items-center justify-between px-0.5">
					<span data-role="brush-label" class="text-[11px] font-normal text-[#aaaaaa]"></span>
					<div class="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
						<div data-role="brush-preview" class="bg-white rounded-full transition-all duration-150"></div>
					</div>
				</div>
				<div class="px-0.5 flex items-center h-4"><input data-input="brush-size" type="range" min="1" max="64" step="1" class="w-full"></div>
			</section>
			<section data-role="constraint-section" class="space-y-1.5 px-0.5">
				<button data-action="constraint" type="button" class="flex items-center gap-2 group cursor-pointer w-full text-left">
					<span data-role="constraint-box" class="w-3.5 h-3.5 rounded-sm flex items-center justify-center border transition-all"><span data-role="constraint-check" hidden class="material-symbols-outlined text-black text-[11px] font-bold">check</span></span>
					<span data-role="constraint-label" class="text-[11px] font-normal transition-colors"></span>
				</button>
			</section>
			<section data-role="spray-section" class="space-y-1.5">
				<span class="text-[11px] font-normal text-[#aaaaaa] px-0.5">Spray Type</span>
				<div class="flex bg-[#1c1c1c] p-0.5 rounded-md border border-[#3a3a3a]">
					<button data-action="spray-noise" type="button" class="flex-1 py-1 text-[11px] rounded-sm transition-all">NOISE</button>
					<button data-action="spray-hair" type="button" class="flex-1 py-1 text-[11px] rounded-sm transition-all">HAIR</button>
				</div>
			</section>
			<section data-role="color-section" class="space-y-1.5">
				<div class="flex items-center justify-between px-0.5">
					<span class="text-[11px] font-normal text-[#aaaaaa]">Color</span>
					<div class="flex items-center gap-1.5"><span data-role="color-preview" class="w-3 h-3 rounded-sm border border-white/20"></span><span data-role="color-value" class="font-mono text-[10px] text-[#cccccc]"></span></div>
				</div>
				<div class="grid grid-cols-8 gap-1 pt-0.5">
					<div data-role="color-options" class="contents"></div>
					<div data-action="custom-color" class="relative w-4 h-4 rounded-sm border border-dashed border-[#555555] flex items-center justify-center hover:bg-white/10 transition-colors group cursor-pointer" title="Custom color">
						<span class="material-symbols-outlined text-[10px] text-[#aaaaaa] group-hover:text-white pointer-events-none">palette</span>
						<input data-input="custom-color" type="color" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" title="Custom color">
					</div>
				</div>
			</section>
		</div>
		<div class="absolute left-[-5px] top-6 w-2.5 h-2.5 bg-[#2b2b2b] border-l border-t border-[#444444] rotate-[-45deg]"></div>
	</div>
	<aside data-role="sidebar" class="w-[50px] border-r border-[#2d2d2d] bg-[#181818] flex flex-col items-center justify-between shrink-0 z-20 relative py-2 overflow-y-auto no-scrollbar">
		<div class="flex flex-col items-center gap-1 w-full">
			<div data-role="tool-buttons" class="contents"></div>
			<div class="w-6 h-[1px] bg-[#2d2d2d] my-1 shrink-0"></div>
			<div data-role="canvas-operation-buttons" class="contents"></div>
		</div>
		<div class="flex flex-col items-center gap-1 w-full pt-2 shrink-0 border-t border-[#2d2d2d] mt-2">
			<button data-action="shortcuts" type="button" class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#2d2d2d] text-[#aaaaaa] hover:text-white transition-all cursor-pointer shrink-0" title="Keyboard Shortcuts"><span class="material-symbols-outlined text-[18px]">keyboard</span></button>
			<button data-action="download-image" type="button" class="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#2d2d2d] text-[#aaaaaa] hover:text-white transition-all cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed" title="Download image as PNG" aria-label="Download image as PNG"><span data-role="download-image-icon" class="material-symbols-outlined text-[18px]">file_download</span></button>
		</div>
	</aside>
	<main class="flex-1 flex flex-col min-w-0 relative bg-[#202020]">
		<section data-role="canvas-section" class="flex-1 relative overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
			<div data-role="canvas-container" class="w-full h-full min-h-0 flex items-center justify-center bg-[#1a1a1a] overflow-hidden relative select-none">
				<div data-role="empty-hint" class="absolute inset-0 z-[1] pointer-events-none flex flex-col items-center justify-center">
					<span class="material-symbols-outlined text-[42px] text-[#444444] mb-3 opacity-30">brush</span>
					<p class="text-[12px] text-[#777777] select-none opacity-60">Load image or start drawing</p>
				</div>
				<canvas data-role="canvas"></canvas>
			</div>
			<div class="absolute top-3 right-3 z-40 flex items-center gap-0.5 p-1 bg-[#2b2b2b]/90 backdrop-blur-md border border-[#3f3f3f] rounded-md shadow-lg">
				<div data-role="history-buttons" class="contents"></div>
				<div class="w-[1px] h-3.5 bg-[#444444] mx-1"></div>
				<div data-role="clear-button" class="contents"></div>
				<div class="w-[1px] h-3.5 bg-[#444444] mx-1"></div>
				<div data-role="save-button" class="contents"></div>
			</div>
			<div class="absolute top-3 left-3 z-40 flex items-center gap-1 px-2 py-1 bg-[#2b2b2b]/90 backdrop-blur-md border border-[#3f3f3f] rounded-md shadow-md text-xs font-mono">
				<button data-action="zoom-out" type="button" class="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-white/10 text-[#aaaaaa] hover:text-white transition-colors cursor-pointer" title="Zoom Out (Alt + Wheel)">
					<span class="material-symbols-outlined text-[14px]">remove</span>
				</button>
				<span data-role="zoom-level" class="px-1 text-[11px] text-[#cccccc] min-w-[40px] text-center">100%</span>
				<button data-action="zoom-in" type="button" class="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-white/10 text-[#aaaaaa] hover:text-white transition-colors cursor-pointer" title="Zoom In (Wheel)">
					<span class="material-symbols-outlined text-[14px]">add</span>
				</button>
				<div class="w-[1px] h-3 bg-[#444444] mx-1"></div>
				<button data-action="zoom-reset" type="button" class="px-1.5 py-0.5 rounded-sm text-[11px] font-sans text-[#aaaaaa] hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="100% Zoom">
					1:1
				</button>
			</div>
			<div data-role="generating" hidden class="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"><div class="w-[280px] max-w-[70%]"><div class="mb-2 flex items-center justify-between text-[12px] text-[#cccccc]"><span data-role="generation-stage">Generating image</span><span data-role="generation-count"></span></div><div data-role="generation-bar" class="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar"><div data-role="generation-progress" class="h-full w-full rounded-full bg-[#0078d4] animate-pulse"></div></div></div><button data-action="cancel-generation" type="button" class="mt-5 rounded-lg border border-[#777777] bg-[#292929] px-5 py-2 text-[13px] text-white hover:bg-[#404040] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#80bdff]" aria-label="Cancel generation">Cancel generation</button></div>
			<div data-role="prompt-host" class="fx-prompt-shell"></div>
				<div data-role="shortcuts" hidden class="absolute z-[46] bottom-4 left-4 right-4 bg-[#252525] border border-[#3a3a3a] rounded-md p-3 grid grid-cols-3 gap-3 animate-in fade-in mt-1 text-[11px]">
					<div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Pick</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">V</span></div><div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Select Region</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">M</span></div><div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Eyedropper</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">I</span></div>
					<div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Fill</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">F</span></div><div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Pencil</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">D</span></div><div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Spray</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">S</span></div>
					<div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Line</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">L</span></div><div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Bezier</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">B</span></div><div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Shapes</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">R/O</span></div>
					<div class="flex items-center justify-between"><span class="text-[#aaaaaa]">History</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">\u2318Z</span></div><div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Copy</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">\u2318C</span></div><div class="flex items-center justify-between"><span class="text-[#aaaaaa]">Paste</span><span class="text-[#cccccc] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 font-mono text-[10px]">\u2318V</span></div>
				</div>
		</section>
	</main>
</div>
`;
