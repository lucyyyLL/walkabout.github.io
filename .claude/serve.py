# Local preview server with HTTP Range support (Python's http.server lacks it, so videos can't seek).
# Usage: python .claude/serve.py <folder> <port>
import os, re, sys, http.server, functools
class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        rng = self.headers.get('Range'); path = self.translate_path(self.path)
        if not rng or os.path.isdir(path): return super().send_head()
        m = re.match(r'bytes=(\d*)-(\d*)', rng)
        try: f = open(path, 'rb')
        except OSError: self.send_error(404); return None
        size = os.fstat(f.fileno()).st_size
        a = int(m.group(1)) if m.group(1) else 0; b = int(m.group(2)) if m.group(2) else size - 1
        b = min(b, size - 1); f.seek(a); self._left = b - a + 1
        self.send_response(206); self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Accept-Ranges', 'bytes'); self.send_header('Content-Range', f'bytes {a}-{b}/{size}')
        self.send_header('Content-Length', str(self._left)); self.end_headers(); return f
    def copyfile(self, src, dst):
        left = getattr(self, '_left', None)
        if left is None: return super().copyfile(src, dst)
        while left > 0:
            buf = src.read(min(65536, left))
            if not buf: break
            try: dst.write(buf)
            except (ConnectionError, OSError): break
            left -= len(buf)
http.server.ThreadingHTTPServer(('', int(sys.argv[2])), functools.partial(H, directory=sys.argv[1])).serve_forever()
