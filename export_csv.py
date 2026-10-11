import os
import openpyxl
import csv

downloads = r"C:\Users\JDH\Downloads"
target = [os.path.join(downloads, f) for f in os.listdir(downloads) if "2026" in f and f.endswith(".xlsx") and not f.startswith("~$")][0]
wb = openpyxl.load_workbook(target)
ws = wb.active

out_path = r"C:\Antigravity\Site development\2026-10-11\data_backup.csv"
with open(out_path, "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
    for row in ws.iter_rows(values_only=True):
        writer.writerow(row)

print("Saved data_backup.csv to 2026-10-11 folder!")
