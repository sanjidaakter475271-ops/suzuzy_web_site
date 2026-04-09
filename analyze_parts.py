import re
import os

def analyze_parts():
    file_path = 'parts all.xls'
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Extract rows efficiently
    rows = re.findall(r'<tr>(.*?)</tr>', content, re.DOTALL)
    
    if not rows:
        print("No table rows found in the file.")
        return

    print(f"Total rows found: {len(rows)}")
    print("-" * 50)

    parsed_data = []
    for row in rows:
        cols = re.findall(r'<td>(.*?)</td>', row, re.DOTALL)
        clean_cols = [c.strip() for c in cols]
        if clean_cols:
            parsed_data.append(clean_cols)

    # Print first 25 rows with headers
    headers = parsed_data[0] if parsed_data else []
    print(f"Headers: {' | '.join(headers)}")
    print("-" * 100)
    
    for i, row_data in enumerate(parsed_data[1:26]):
        print(f"{i+1:3}: {' | '.join(row_data)}")

    # Summary analysis
    print("-" * 100)
    print("Summary Data:")
    try:
        # Assuming last column or column with digits is price/stock
        total_items = len(parsed_data) - 1
        print(f"Total parts listed: {total_items}")
    except Exception as e:
        print(f"Could not calculate summary: {e}")

if __name__ == "__main__":
    analyze_parts()
