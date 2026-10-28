import hashlib
import os
import difflib

def get_sha256(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()

print("=" * 70)
print("EMPIRICAL SHA256 INTEGRITY & SYNC AUDIT")
print("=" * 70)

file1 = 'index.html'
file2 = 'h_n_i_12_ng_y_m_18_12_29_12_1972.html'

hash1 = get_sha256(file1)
hash2 = get_sha256(file2)

print(f"File 1: {file1}")
print(f"  SHA256: {hash1}")
print(f"  Size:   {os.path.getsize(file1) if hash1 else 0} bytes")

print(f"\nFile 2: {file2}")
print(f"  SHA256: {hash2}")
print(f"  Size:   {os.path.getsize(file2) if hash2 else 0} bytes")

print("-" * 70)
if hash1 == hash2:
    print("VERDICT: PASS — Both files are bit-for-bit identical.")
else:
    print("VERDICT: FAIL — Checksum mismatch detected!")
    print(f"Divergence: {os.path.getsize(file1) - os.path.getsize(file2)} bytes difference.")
    
    print("\nExtracting precise line differences:")
    with open(file1, 'r', encoding='utf-8') as f1, open(file2, 'r', encoding='utf-8') as f2:
        lines1 = f1.readlines()
        lines2 = f2.readlines()
    
    diff = list(difflib.unified_diff(
        lines2, lines1,
        fromfile=file2, tofile=file1, lineterm=''
    ))
    for line in diff[:30]:
        print(line)
    if len(diff) > 30:
        print(f"... and {len(diff) - 30} more diff lines.")
print("=" * 70)
