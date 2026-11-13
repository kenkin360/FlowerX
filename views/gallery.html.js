var galleryTemplate=`
<header class="h-16 px-6 md:px-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/60 backdrop-blur-xl z-20">
	<div class="flex items-center gap-3.5">
		<button type="button" class="w-9 h-9 rounded-xl bg-white text-black hover:bg-zinc-200 flex items-center justify-center cursor-pointer" aria-label="Open source files" title="Open source files" data-action="source-list">
			<span class="material-symbols-outlined text-[18px]">local_florist</span>
		</button>

		<div>
			<h1 class="text-sm font-bold tracking-wider uppercase text-white flex items-center gap-2">Flower X</h1>
		</div>
	</div>

	<div class="flex items-center gap-3">
		<button type="button" class="w-9 h-9 rounded-xl bg-white text-black hover:bg-zinc-200 flex items-center justify-center cursor-pointer" data-action="generate-all" aria-label="Generate all editors" title="Generate all editors">
			<span class="material-symbols-outlined text-[18px]">auto_awesome</span>
		</button>
	
		<button type="button" class="w-9 h-9 rounded-xl bg-white text-black hover:bg-zinc-200 flex items-center justify-center cursor-pointer" aria-label="Open image from Flow" title="Open image from Flow" data-action="open">
			<span class="material-symbols-outlined text-[18px]">add_photo_alternate</span>
		</button>

		<button type="button" class="w-9 h-9 rounded-xl bg-white text-black hover:bg-zinc-200 flex items-center justify-center cursor-pointer" aria-label="Load image from this device" title="Load image from this device" data-action="load" >
			<span class="material-symbols-outlined text-[18px]">folder_open</span>
		</button>

		<button type="button" class="w-9 h-9 rounded-xl bg-white text-black hover:bg-zinc-200 flex items-center justify-center cursor-pointer" aria-label="New canvas" title="New canvas" data-action="new-canvas" >
			<span class="material-symbols-outlined text-[18px]">brush</span>
		</button>
	</div>
</header>
`;
