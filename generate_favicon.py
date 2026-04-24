import subprocess
subprocess.run(['pip', 'install', 'Pillow', 'requests', '--break-system-packages'], capture_output=True)

from PIL import Image, ImageDraw, ImageFont
import requests, os, math

font_path = "/tmp/BarlowCondensed-ExtraBoldItalic.ttf"
if not os.path.exists(font_path):
    r = requests.get("https://github.com/google/fonts/raw/main/ofl/barlowcondensed/BarlowCondensed-ExtraBoldItalic.ttf")
    open(font_path, 'wb').write(r.content)

SIZE = 512
RADIUS = 110

def rounded_rect_mask(size, radius):
    mask = Image.new('L', (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=255)
    return mask

def make_gradient(size, color1, color2):
    img = Image.new('RGBA', (size, size))
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            r = int(color1[0] + (color2[0]-color1[0]) * t)
            g = int(color1[1] + (color2[1]-color1[1]) * t)
            b = int(color1[2] + (color2[2]-color1[2]) * t)
            img.putpixel((x, y), (r, g, b, 255))
    return img

img = make_gradient(SIZE, (19, 28, 44), (29, 48, 72))
mask = rounded_rect_mask(SIZE, RADIUS)
img.putalpha(mask)

draw = ImageDraw.Draw(img)
font = ImageFont.truetype(font_path, 340)

letter = "S"
bbox = draw.textbbox((0, 0), letter, font=font)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]
x = (SIZE - text_w) / 2 - bbox[0]
y = (SIZE - text_h) / 2 - bbox[1]
draw.text((x, y), letter, font=font, fill=(236, 240, 246, 255))

img.save("favicon.png")

for s in [16, 32, 48]:
    img.resize((s, s), Image.LANCZOS).save(f"favicon-{s}.png")

print("Done")
