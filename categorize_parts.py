import re
import os
import json

def get_data():
    file_path = 'parts all.xls'
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    rows = re.findall(r'<tr>(.*?)</tr>', content, re.DOTALL)
    data = []
    for row in rows[1:]:
        cols = re.findall(r'<td>(.*?)</td>', row, re.DOTALL)
        if len(cols) >= 3:
            data.append({
                'part_no': cols[0].strip(),
                'name': cols[1].strip(),
                'price': cols[2].strip()
            })
    return data

def categorize_items(data):
    # logic to deduce category from name
    categories = {
        'Engine': ['piston', 'ring', 'valve', 'crankshaft', 'gasket', 'clutch', 'filter', 'spark', 'plug', 'oil'],
        'Body & Frame': ['cover', 'fairing', 'handle', 'mirror', 'seat', 'footrest', 'stand', 'fender', 'mudguard'],
        'Electrical': ['light', 'bulb', 'wire', 'harness', 'battery', 'stator', 'cdi', 'horn', 'switch', 'coil'],
        'Braking & Suspension': ['brake', 'pad', 'shoe', 'disc', 'lever', 'shock', 'suspension', 'fork', 'wheel', 'rim', 'tire'],
        'Transmission & Drive': ['chain', 'sprocket', 'gear', 'shaft', 'belt'],
        'Other': []
    }
    
    categorized = {}
    for cat in categories:
        categorized[cat] = []
    categorized['Other'] = []

    for item in data:
        name_lower = item['name'].lower()
        assigned = False
        for cat, keywords in categories.items():
            if any(kw in name_lower for kw in keywords):
                categorized[cat].append(item)
                assigned = True
                break
        if not assigned:
            categorized['Other'].append(item)
    
    return categorized

if __name__ == "__main__":
    parts = get_data()
    result = categorize_items(parts)
    
    for cat, items in result.items():
        print(f"Category: {cat} - Count: {len(items)}")
        # Print first 3 for verification
        for item in items[:3]:
            print(f"  -> {item['part_no']}: {item['name']}")
