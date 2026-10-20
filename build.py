"""Build a truly offline, self-contained HTML gift. Python standard library only."""
from pathlib import Path
import base64
import json
import mimetypes
import re

ROOT = Path(__file__).resolve().parent
SRC = ROOT / 'src'
DIST = ROOT / 'dist'

def data_url(path):
    media = mimetypes.guess_type(str(path))[0] or 'application/octet-stream'
    if path.suffix == '.woff2':
        media = 'font/woff2'
    elif path.suffix == '.m4a':
        media = 'audio/mp4'
    return 'data:' + media + ';base64,' + base64.b64encode(path.read_bytes()).decode('ascii')

def build():
    html = (SRC / 'index.html').read_text()
    css = '\n'.join((SRC / name).read_text() for name in ['styles.css', 'living.css'])
    js = '\n;\n'.join((SRC / name).read_text() for name in ['sound.js', 'ticket.js', 'audio-editor.js', 'living.js', 'app.js'])
    config = json.loads((SRC / 'config.json').read_text())
    for key in ['voices', 'motionAssets']:
        config[key] = [data_url(DIST / name) if name and not name.startswith('data:') else name for name in config.get(key, ['', '', ''])]
    if config.get('senderVoice') and not config['senderVoice'].startswith('data:'):
        config['senderVoice'] = data_url(DIST / config['senderVoice'])
    font_css_path = DIST / 'assets' / 'fonts.css'
    font_css = font_css_path.read_text() if font_css_path.exists() else ''
    css = css.replace('/* FONT_FACES */', font_css)
    def inline_font(match):
        name = match.group(1)
        if name.startswith('data:') or name.startswith('#'):
            return match.group(0)
        asset = DIST / name
        if not asset.is_file():
            asset = DIST / 'assets' / name
        if not asset.is_file():
            raise FileNotFoundError('missing CSS asset: ' + name)
        return "url('" + data_url(asset) + "')"
    css = re.sub(r"url\(['\"]?([^'\")]+)['\"]?\)", inline_font, css)
    def inline_image(match):
        name = match.group(1)
        path = DIST / name
        if not path.is_file():
            raise FileNotFoundError('missing image: ' + name)
        return 'src="' + data_url(path) + '"'
    html = re.sub(r'src="(assets/[^\"]+)"', inline_image, html)
    html = html.replace('/* STYLES */', css)
    config_json = json.dumps(config, ensure_ascii=False).replace('<', '\\u003c')
    html = html.replace('/* CONFIG */', config_json)
    if '</script' in js.lower():
        raise ValueError('JavaScript contains a literal closing script sequence')
    html = html.replace('/* SCRIPT */', js)
    (DIST / 'index.html').write_text(html, encoding='utf-8')
    print(json.dumps({'output': str(DIST / 'index.html'), 'bytes': len(html.encode()), 'self_contained': True}, ensure_ascii=False))

if __name__ == '__main__':
    build()
