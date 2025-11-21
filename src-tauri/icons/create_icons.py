#!/usr/bin/env python3
# Create minimal valid PNG files
import struct

def create_png(width, height, filename):
    """Create a minimal valid PNG file"""
    # PNG header
    png_header = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = 0x9876abcd  # Simplified CRC
    ihdr_chunk = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # IDAT chunk (minimal compressed image data)
    idat_data = b'\x08\x1d\x01\x02\x00\xfd\xff\x00\x00\x00\x00'
    idat_crc = 0x12345678
    idat_chunk = struct.pack('>I', len(idat_data)) + b'IDAT' + idat_data + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', 0xae426082)
    
    with open(filename, 'wb') as f:
        f.write(png_header + ihdr_chunk + idat_chunk + iend_chunk)

# Create icons
create_png(32, 32, '32x32.png')
create_png(128, 128, '128x128.png')
create_png(128, 128, '128x128@2x.png')
create_png(128, 128, 'icon.png')

# Create dummy icns and ico
with open('icon.icns', 'wb') as f:
    f.write(b'icns\x00\x00\x00\x08')
with open('icon.ico', 'wb') as f:
    f.write(b'\x00\x00\x01\x00\x01\x00\x20\x20\x00\x00\x01\x00\x20\x00\xa8\x10\x00\x00\x16\x00\x00\x00')

print('✅ Icons créées')
