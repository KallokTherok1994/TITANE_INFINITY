#!/usr/bin/env python3
import struct
import zlib

def crc32(data):
    return zlib.crc32(data) & 0xffffffff

def create_rgba_png(width, height, filename):
    """Create a valid RGBA PNG with proper CRC"""
    png_sig = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk - RGBA = color type 6
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_chunk_data = b'IHDR' + ihdr_data
    ihdr_crc = crc32(ihdr_chunk_data)
    ihdr_chunk = struct.pack('>I', 13) + ihdr_chunk_data + struct.pack('>I', ihdr_crc)
    
    # IDAT chunk - RGBA black pixels (dark blue theme)
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # filter type
        raw_data += b'\x1e\x1e\x2e\xff' * width  # RGBA dark blue pixels
    
    compressed = zlib.compress(raw_data, 9)
    idat_chunk_data = b'IDAT' + compressed
    idat_crc = crc32(idat_chunk_data)
    idat_chunk = struct.pack('>I', len(compressed)) + idat_chunk_data + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_chunk_data = b'IEND'
    iend_crc = crc32(iend_chunk_data)
    iend_chunk = struct.pack('>I', 0) + iend_chunk_data + struct.pack('>I', iend_crc)
    
    with open(filename, 'wb') as f:
        f.write(png_sig + ihdr_chunk + idat_chunk + iend_chunk)

# Create all required icons in RGBA
create_rgba_png(32, 32, '32x32.png')
create_rgba_png(128, 128, '128x128.png')
create_rgba_png(128, 128, '128x128@2x.png')
create_rgba_png(256, 256, 'icon.png')

print('✅ PNG RGBA valides créées')
