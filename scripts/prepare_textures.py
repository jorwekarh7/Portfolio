"""Create delivery-sized copies of the original textures; never overwrite originals.

Optional asset maintenance: python scripts/prepare_textures.py (requires Pillow).
The generated WebP files are included, so npm install/build needs no Python.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'public' / 'textures'
names = ['mercury.jpg', 'venus.jpg', 'earth_diffuse.jpg', '8k_earth_nightmap.jpg',
         '8k_earth_clouds.jpg', 'mars.jpg', 'jupiter.jpg', 'saturn.jpg',
         'saturn_ring.png', 'uranus.jpg', 'neptune.jpg']
for profile, width, quality in [('mobile', 1024, 82), ('desktop', 2048, 90)]:
    destination = root / 'optimized' / profile
    destination.mkdir(parents=True, exist_ok=True)
    for name in names:
        with Image.open(root / name) as texture:
            texture.thumbnail((width, width), Image.Resampling.LANCZOS)
            texture.save(destination / (name + '.webp'), 'WEBP', quality=quality, method=6)
    total = sum(file.stat().st_size for file in destination.glob('*.webp'))
    print(f'{profile}: {total / 1024 / 1024:.2f} MiB across {len(names)} textures')
