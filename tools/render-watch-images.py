#!/usr/bin/env python3
"""Renders every product view from tools/watch-art.html into images/watches/<slug>-<view>.jpg
Usage:  python3 tools/render-watch-images.py [slug ...]        (needs: pip install playwright && playwright install chromium)
It starts its own tiny static server, so nothing else needs to be running."""
import sys, os, threading, http.server, socketserver, functools, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'images' / 'watches'
SLUGS = ['meridian', 'aperture', 'tidal-300', 'equinox', 'axiom', 'regatta', 'solstice', 'lattice', 'perpetua']
VIEWS = ['hero', 'threeQuarter', 'side', 'caseback', 'dial', 'wrist']

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()

def main():
    only = sys.argv[1:] or SLUGS
    OUT.mkdir(parents=True, exist_ok=True)
    handler = functools.partial(Quiet, directory=str(ROOT))
    srv = socketserver.TCPServer(('127.0.0.1', 0), handler); port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 800, 'height': 1000}, device_scale_factor=1.5)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        for slug in only:
            for v in VIEWS:
                pg.goto(f'http://127.0.0.1:{port}/tools/watch-art.html?m={slug}&v={v}')
                pg.wait_for_selector('html[data-ready="1"]', timeout=20000)
                pg.wait_for_timeout(150)
                f = OUT / f'{slug}-{v}.jpg'
                pg.screenshot(path=str(f), type='jpeg', quality=86, clip={'x': 0, 'y': 0, 'width': 800, 'height': 1000})
                print('wrote', f.relative_to(ROOT), f.stat().st_size // 1024, 'KB')
        b.close()
    if errs: print('PAGE ERRORS:', errs[:5]); sys.exit(1)

if __name__ == '__main__': main()
