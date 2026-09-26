#!/usr/bin/env python3
"""Make a brand-coloured QR code for any URL.

Usage:
    python3 tools/make_qr.py https://example.com my-code

Writes assets/qr/<name>.png and assets/qr/<name>.svg.
Requires: pip3 install --user segno
"""
import sys
import segno

CRIMSON = "#8E1B2A"

def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    url, name = sys.argv[1], sys.argv[2]
    qr = segno.make(url, error="h")
    for ext in ("png", "svg"):
        out = f"assets/qr/{name}.{ext}"
        qr.save(out, scale=24, border=4, dark=CRIMSON, light="#FFFFFF")
        print("wrote", out)

if __name__ == "__main__":
    main()
