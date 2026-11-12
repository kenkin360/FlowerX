var splashTemplate=`
<style>
.fx-splash{position:fixed;inset:0;display:grid;place-items:center;overflow:hidden;background-color:#070709;background-image:linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.72)),var(--fx-splash-image);background-position:center;background-size:cover;background-repeat:no-repeat;color:#fff;font-family:'Segoe UI',sans-serif;user-select:none}
.fx-splash-panel{width:min(420px,calc(100% - 48px));padding:26px 28px;border:1px solid #ffffff29;border-radius:18px;background:#0c0d0fae;box-shadow:0 18px 60px #0000007a;backdrop-filter:blur(10px)}
.fx-splash-title{margin:0 0 18px;font-size:26px;font-weight:600;letter-spacing:.04em}
.fx-splash-file{min-height:18px;margin-bottom:10px;color:#e2e2e2;font:12px/1.5 Consolas,'Courier New',monospace;overflow-wrap:anywhere}
.fx-splash-error .fx-splash-file{color:#ffb4b4}
.fx-splash-bar{height:5px;overflow:hidden;border-radius:999px;background:#ffffff29}
.fx-splash-progress{width:0;height:100%;border-radius:inherit;background:#72b7ff;transition:width 120ms ease}
.fx-splash-error .fx-splash-progress{background:#d95f5f}
.fx-splash-count{margin-top:8px;color:#c3c3c3;font-size:11px;text-align:right}
</style>
<main class="fx-splash" data-splash="root" role="status" aria-live="polite">
	<section class="fx-splash-panel">
		<h1 class="fx-splash-title">FlowerX</h1>
		<div class="fx-splash-file" data-splash="file">Starting...</div>
		<div class="fx-splash-bar" data-splash="bar" role="progressbar" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0">
			<div class="fx-splash-progress" data-splash="progress"></div>
		</div>
		<div class="fx-splash-count" data-splash="count">0 / 0</div>
	</section>
</main>
`;

