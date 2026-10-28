import re
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')


content = open('index.html', encoding='utf-8').read()

# 1. Check getElementById vs static IDs
calls = set(m.group(1) for m in re.finditer(r'getElementById\([\'"]([^\'"]+)[\'"]\)', content))
static_ids = set(m.group(1) for m in re.finditer(r'\bid=[\'"]([^\'"]+)[\'"]', content))

missing_from_static = sorted(list(calls - static_ids))
print("=== DOM AUDIT ===")
print(f"Total getElementById targets: {len(calls)}")
print(f"Total static IDs: {len(static_ids)}")
print(f"Queried IDs not in static HTML tags: {missing_from_static}")

for mid in missing_from_static:
    occurrences = [m.start() for m in re.finditer(re.escape(mid), content)]
    print(f"ID '{mid}' used {len(occurrences)} times:")
    for occ in occurrences:
        line_no = content[:occ].count('\n') + 1
        line = content.splitlines()[line_no - 1].strip()
        print(f"  Line {line_no}: {line}")

# 2. Check all duplicate IDs
all_static_ids = [m.group(1) for m in re.finditer(r'\bid=[\'"]([^\'"]+)[\'"]', content)]
duplicates = [id_name for id_name in set(all_static_ids) if all_static_ids.count(id_name) > 1]
print(f"\nDuplicate static IDs: {duplicates}")

# 3. Check for any remaining hardcoded '5/5' or '5 đêm'
print("\n=== HARDCODED STRING AUDIT ===")
h5_5 = [m.start() for m in re.finditer(r'5/5', content)]
print(f"Occurrences of '5/5': {len(h5_5)}")
for occ in h5_5:
    line_no = content[:occ].count('\n') + 1
    print(f"  Line {line_no}: {content.splitlines()[line_no-1].strip()}")

h5_dem = [m.start() for m in re.finditer(r'5\s+đêm', content, re.IGNORECASE)]
print(f"Occurrences of '5 đêm': {len(h5_dem)}")
for occ in h5_dem:
    line_no = content[:occ].count('\n') + 1
    print(f"  Line {line_no}: {content.splitlines()[line_no-1].strip()}")
