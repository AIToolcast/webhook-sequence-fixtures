"""Local tool preview; explicit module MIME type for Windows."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

if __name__ == '__main__':
    SimpleHTTPRequestHandler.extensions_map['.mjs'] = 'text/javascript'
    handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent))
    print('Webhook Sequence Fixtures: http://127.0.0.1:8780/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8780), handler).serve_forever()
