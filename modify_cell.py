import csv

csv_path = r"C:\Antigravity\Site development\2026-10-11\data_backup.csv"

# Read all rows
rows = []
with open(csv_path, "r", encoding="utf-8-sig") as f:
    reader = csv.reader(f)
    rows = list(reader)

headers = rows[0]
name_idx = headers.index("과정명")

print("Before modification row 1:")
print(f"과정코드: {rows[1][0]}, 과정명: {rows[1][name_idx]}")

# Modify row 1 (PNU-2026-001)
rows[1][name_idx] = "[2026 최신개정] 직장 내 성희롱·성폭력 예방 교육"

print("\nAfter modification row 1:")
print(f"과정코드: {rows[1][0]}, 과정명: {rows[1][name_idx]}")

with open(csv_path, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print("\nSuccessfully updated data_backup.csv!")
