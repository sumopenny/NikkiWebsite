"""把 public/images/originals/ 下的原始 jpeg/jpg 批量转成 WebP。

用法（Windows / 本机 Python）：
    D:\\py\\python.exe scripts\\convert_webp.py

输出：public/images/ 下与原名同路径、同主文件名的 .webp（分辨率保持不变）。
- 首屏 / 画廊照片：quality 88
- screenshots/ 下的界面截图：quality 88（UI 含文字，保真度给高一点）

依赖：Pillow（本机 D:\\py\\python.exe 已自带，含 WebP 编码支持）。
"""
import argparse
import os
import sys

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SRC = os.path.join(ROOT, 'public', 'images', 'originals')
DEFAULT_DST = os.path.join(ROOT, 'public', 'images')

QUALITY_PHOTO = 88
QUALITY_SHOT = 88
METHOD = 6  # WebP 最慢但压缩率最好的档位


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default=DEFAULT_SRC, help='原始 jpeg/jpg 所在目录')
    ap.add_argument('--dst', default=DEFAULT_DST, help='WebP 输出目录')
    ap.add_argument('--quality', type=int, default=QUALITY_PHOTO, help='照片质量，默认 88')
    ap.add_argument('--shot-quality', type=int, default=QUALITY_SHOT, help='截图质量，默认 88')
    args = ap.parse_args()

    if not os.path.isdir(args.src):
        print('源目录不存在: %s' % args.src)
        return 1

    srcs = []
    for root, _dirs, files in os.walk(args.src):
        for fn in files:
            if fn.lower().endswith(('.jpg', '.jpeg')):
                srcs.append(os.path.join(root, fn))
    srcs.sort()
    if not srcs:
        print('源目录里没有 jpeg/jpg: %s' % args.src)
        return 1

    tot_o = tot_w = 0
    fails = []
    print('%-38s %10s %10s %8s' % ('FILE', 'ORIG MB', 'WEBP MB', 'SAVED'))
    print('-' * 70)
    for src in srcs:
        rel = os.path.relpath(src, args.src)
        dst = os.path.join(args.dst, os.path.splitext(rel)[0] + '.webp')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        # 子目录（screenshots/）里的当作界面截图，质量给高一点
        q = args.shot_quality if os.path.dirname(rel) else args.quality
        try:
            with Image.open(src) as raw:
                im = ImageOps.exif_transpose(raw)
                if im.mode != 'RGB':
                    im = im.convert('RGB')
                im.save(dst, 'WEBP', quality=q, method=METHOD)
        except Exception as e:  # noqa: BLE001
            fails.append((rel, str(e)))
            continue
        o, n = os.path.getsize(src), os.path.getsize(dst)
        tot_o += o
        tot_w += n
        print('%-38s %10.2f %10.2f %7.1f%%' % (rel, o / 1024 / 1024, n / 1024 / 1024, (1 - n / o) * 100))

    print('-' * 70)
    print('合计 %.2f MB -> %.2f MB  省 %.1f%%' % (
        tot_o / 1024 / 1024, tot_w / 1024 / 1024, (1 - tot_w / tot_o) * 100 if tot_o else 0))
    if fails:
        print('失败 %d 个:' % len(fails))
        for rel, err in fails:
            print('  %s -> %s' % (rel, err))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
