#!/usr/bin/env python3
"""
sync_distribution.py — Robust byte-for-byte synchronization utility
Ensures index.html and h_n_i_12_ng_y_m_18_12_29_12_1972.html possess
100% identical content and matching cryptographic SHA256 checksums.
"""

import os
import sys
import shutil
import hashlib

PRIMARY = 'index.html'
DISTRIBUTION = 'h_n_i_12_ng_y_m_18_12_29_12_1972.html'

def sha256_of(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()

def run_sync(check_only=False):
    h_prim = sha256_of(PRIMARY)
    h_dist = sha256_of(DISTRIBUTION)

    if check_only:
        if not h_prim or not h_dist:
            print(f"[FAIL] Missing file(s): {PRIMARY}={bool(h_prim)}, {DISTRIBUTION}={bool(h_dist)}")
            return False
        if h_prim != h_dist:
            print(f"[FAIL] Cryptographic mismatch between files!")
            print(f"  {PRIMARY}:      {h_prim}")
            print(f"  {DISTRIBUTION}: {h_dist}")
            return False
        print(f"[PASS] 100% Bit-for-bit identical distribution verified.")
        print(f"  SHA256: {h_prim}")
        return True

    # Synchronization mode
    if not h_prim and not h_dist:
        print("[ERROR] Neither primary nor distribution file exists!")
        return False

    if h_prim and not h_dist:
        print(f"Distribution file missing. Synchronizing {PRIMARY} -> {DISTRIBUTION}...")
        shutil.copy2(PRIMARY, DISTRIBUTION)
    elif h_dist and not h_prim:
        print(f"Primary file missing. Restoring {DISTRIBUTION} -> {PRIMARY}...")
        shutil.copy2(DISTRIBUTION, PRIMARY)
    else:
        # Both exist
        if h_prim == h_dist:
            print(f"[PASS] Files are already in sync. SHA256: {h_prim}")
            return True
        t_prim = os.path.getmtime(PRIMARY)
        t_dist = os.path.getmtime(DISTRIBUTION)
        # Default to primary unless distribution is strictly newer
        src, dst = (PRIMARY, DISTRIBUTION) if t_prim >= t_dist else (DISTRIBUTION, PRIMARY)
        print(f"Synchronizing newer file: {src} -> {dst}...")
        shutil.copy2(src, dst)

    h_final_p = sha256_of(PRIMARY)
    h_final_d = sha256_of(DISTRIBUTION)

    if h_final_p != h_final_d:
        print(f"[ERROR] Post-sync verification failed! Hashes do not match.")
        return False

    print(f"[SUCCESS] Both distribution files synchronized. SHA256: {h_final_p}")
    return True

if __name__ == '__main__':
    is_check = '--check' in sys.argv
    success = run_sync(check_only=is_check)
    sys.exit(0 if success else 1)
