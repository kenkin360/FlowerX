var galleryTemplate=`
<header class="h-16 px-6 md:px-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/60 backdrop-blur-xl z-20">
  <div class="flex items-center gap-3.5">
    <button type="button" data-action="source-list" aria-label="Open source files" title="Open source files" class="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:bg-zinc-200 cursor-pointer">
      <span class="material-symbols-outlined text-[20px]">local_florist</span>
    </button>
    <div>
      <h1 class="text-sm font-bold tracking-wider uppercase text-white flex items-center gap-2">Flower X <span class="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 font-mono font-medium">PRECISION</span></h1>
      <p class="text-[10px] text-zinc-500 font-mono">Precision Drawing &amp; AI Generator</p>
    </div>
  </div>
  <div class="flex items-center gap-3">
    <button type="button" data-action="open" class="px-4 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer" title="Open image from Flow">
      <span class="material-symbols-outlined text-[17px]">add_photo_alternate</span>Open
    </button>
    <button type="button" data-action="load" class="px-4 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer" title="Load image from this device">
      <span class="material-symbols-outlined text-[17px]">folder_open</span>Load
    </button>
    <button type="button" data-action="new-canvas" class="px-5 h-9 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs flex items-center gap-2 cursor-pointer">
      <span class="material-symbols-outlined text-[18px]">brush</span>New
    </button>
  </div>
</header>
`;
