import re
import csv
import os

def export_categorized_to_csv():
    input_file = 'parts all.xls'
    output_file = 'categorized_parts.csv'

    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    # 1. Read the XLS (HTML format) file
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 2. Extract rows and columns
    rows = re.findall(r'<tr>(.*?)</tr>', content, re.DOTALL)
    
    # 3. Define Category and Sub-category mapping
    # Format: 'Category': { 'Sub-category': [keywords] }
    categorization_map = {
        'Engine': {
            'Clutch': ['clutch', 'lever assy,clutch'],
            'Filters': ['filter', 'cleaner'],
            'Pistons & Rings': ['piston', 'ring'],
            'Gaskets & Seals': ['gasket', 'seal', 'o-ring'],
            'Engine Internal': ['valve', 'crankshaft', 'camshaft', 'bearing', 'stator']
        },
        'Body & Frame': {
            'Body Covers': ['cover', 'fairing', 'panel', 'cowling'],
            'Frame & Stand': ['frame', 'stand', 'footrest', 'bracket'],
            'Handle & Mirror': ['handle', 'mirror', 'grip'],
            'Seat & Mudguard': ['seat', 'fender', 'mudguard']
        },
        'Electrical': {
            'Lighting': ['light', 'bulb', 'lamp', 'lens'],
            'Electronics': ['cdi', 'battery', 'harness', 'wire', 'switch', 'coil', 'horn', 'sensor'],
            'Starter': ['starter', 'relay', 'motor']
        },
        'Braking & Suspension': {
            'Brakes': ['brake', 'pad', 'shoe', 'disc', 'caliper'],
            'Suspension': ['shock', 'suspension', 'fork', 'spring'],
            'Wheels & Tires': ['tire', 'wheel', 'rim', 'tube']
        },
        'Transmission': {
            'Chain & Sprocket': ['chain', 'sprocket', 'drive'],
            'Gears & Axles': ['gear', 'shaft', 'axle', 'belt']
        }
    }

    categorized_data = []

    # 4. Process each row
    for row in rows[1:]:  # Skip header
        cols = re.findall(r'<td>(.*?)</td>', row, re.DOTALL)
        if len(cols) >= 3:
            part_no = cols[0].strip()
            name = cols[1].strip()
            price = cols[2].strip()
            stock = cols[3].strip() if len(cols) > 3 else "0"
            
            name_lower = name.lower()
            found_cat = "Others"
            found_sub = "General"

            # Search through the map
            matched = False
            for cat, subcats in categorization_map.items():
                for sub, keywords in subcats.items():
                    if any(kw in name_lower for kw in keywords):
                        found_cat = cat
                        found_sub = sub
                        matched = True
                        break
                if matched:
                    break
            
            categorized_data.append([found_cat, found_sub, part_no, name, price, stock])

    # 5. Sort by Category and Sub-category for organized CSV
    categorized_data.sort(key=lambda x: (x[0], x[1]))

    # 6. Write to CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        # Header
        writer.writerow(['Category', 'Sub-Category', 'Part Number', 'Description', 'Price', 'Stock'])
        # Data
        writer.writerows(categorized_data)

    print(f"Success! Categorized data saved to '{output_file}'")
    print(f"Total items processed: {len(categorized_data)}")

if __name__ == "__main__":
    export_categorized_to_csv()
