import re
import csv
import os

def export_all_and_separate():
    input_file = 'parts all.xls'
    output_dir = 'categorized_files'
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(input_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    rows = re.findall(r'<tr>(.*?)</tr>', content, re.DOTALL)
    
    # Bike Model Detection
    bike_models = ['GIXXER', 'HAYATE', 'ACCESS', 'INTRUDER', 'GS150', '250CC', '150CC', '125CC', '110CC', 'BURGMAN', 'AVENIS']
    
    # Category Mappings
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

    all_data = []
    separated_data = {bike: [] for bike in bike_models}
    separated_data['OTHERS_MODELS'] = []

    for row in rows[1:]:
        cols = re.findall(r'<td>(.*?)</td>', row, re.DOTALL)
        if len(cols) >= 3:
            part_no = cols[0].strip()
            name = cols[1].strip()
            price = cols[2].strip()
            stock = cols[3].strip() if len(cols) > 3 else "0"
            
            name_upper = name.upper()
            
            # Detect Bike Model
            bike_found = "UNIVERSAL"
            for b in bike_models:
                if b in name_upper:
                    bike_found = b
                    break
            
            # Categorization
            found_cat = "Others"
            found_sub = "General"
            matched = False
            for cat, subcats in categorization_map.items():
                for sub, keywords in subcats.items():
                    if any(kw in name_upper.lower() for kw in keywords):
                        found_cat = cat
                        found_sub = sub
                        matched = True
                        break
                if matched:
                    break
            
            item_row = [bike_found, found_cat, found_sub, part_no, name, price, stock]
            all_data.append(item_row)
            
            if bike_found != "UNIVERSAL":
                separated_data[bike_found].append(item_row)
            else:
                separated_data['OTHERS_MODELS'].append(item_row)

    # 1. Save All Data (Master CSV)
    master_file = os.path.join(output_dir, 'all_categorized_parts.csv')
    with open(master_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Bike Model', 'Category', 'Sub-Category', 'Part Number', 'Description', 'Price', 'Stock'])
        writer.writerows(sorted(all_data, key=lambda x: (x[0], x[1], x[2])))

    # 2. Save Separate Files for each Bike
    for bike, items in separated_data.items():
        if items:
            filename = f"{bike.lower().replace(' ', '_')}_parts.csv"
            with open(os.path.join(output_dir, filename), 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['Bike Model', 'Category', 'Sub-Category', 'Part Number', 'Description', 'Price', 'Stock'])
                writer.writerows(sorted(items, key=lambda x: (x[1], x[2])))

    print(f"Success! Files generated in '{output_dir}' directory.")
    print(f"Total categories handled: {len(categorization_map)}")

if __name__ == "__main__":
    export_all_and_separate()
