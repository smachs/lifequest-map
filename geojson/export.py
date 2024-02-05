import json

def flatten_coordinates(coordinates):
    flat_coords = []
    for item in coordinates:
        if isinstance(item, list):
            flat_coords.extend(flatten_coordinates(item))
        else:
            flat_coords.append(item)
    return flat_coords


def invert_coordinates(coords):
    """Invert order of coordinates"""
    return [tuple(reversed(pair)) for pair in zip(*[iter(coords)]*2)]

with open('input.geojson', 'r') as file:
    geojson_data = json.load(file)

result = []
for feature in geojson_data['features']:
    name = feature['properties'].get('name')
    coordinates = feature['geometry']['coordinates']
    # Flatten and invert the coordinates
    flat_coords = flatten_coordinates(coordinates)
    inverted_coords = invert_coordinates(flat_coords)
    result.append({
        "name": name,
        "coordinates": inverted_coords
    })

with open('output.json', 'w') as outfile:
    json.dump(result, outfile)
