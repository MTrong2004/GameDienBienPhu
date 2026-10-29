import urllib.request
import json
import time
import os
from PIL import Image

HEADERS = {'User-Agent': 'GameDienBienPhuArchive/1.0 (contact: admin@local.test)'}

def download_file(url, out_path):
    print(f"Downloading {url} -> {out_path}...")
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        content = resp.read()
        with open(out_path, 'wb') as f:
            f.write(content)
    print(f"Saved {out_path} ({len(content):,} bytes)")

def get_wiki_url(title):
    api_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(api_url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        d = json.loads(resp.read().decode('utf-8'))
        for k, v in d['query']['pages'].items():
            if 'imageinfo' in v:
                return v['imageinfo'][0]['url']
    return None

os.makedirs('assets/images/hangar', exist_ok=True)

targets = [
    ('mig21_raw.jpg', 'File:MIG21_MF_so_5121.JPG'),
    ('b52_raw.jpg', 'File:B-52G landing at Andersen AFB during Linebacker II 1972.JPEG'),
    ('sam2_raw.jpg', 'File:DVINA SA-75 SAM-2 launcher system downed 4 x F4S on 240765.jpg'),
    ('radar_raw.jpg', 'File:Fan Song fire control radar of the SA-2 SAM-system.JPEG')
]

for filename, wiki_title in targets:
    out_file = os.path.join('assets/images/hangar', filename)
    if not os.path.exists(out_file):
        time.sleep(1.5)
        url = get_wiki_url(wiki_title)
        if url:
            time.sleep(1.5)
            download_file(url, out_file)
        else:
            print(f"Failed to get URL for {wiki_title}")
