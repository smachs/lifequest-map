import json
from geojson import load

with open('input.geojson', 'r') as file:
    geojson_data = load(file)

result = []
for feature in geojson_data['features']:
    # Supondo que cada recurso tenha uma propriedade 'name' e uma geometria
    name = feature['properties'].get('name')
    coordinates = feature['geometry']['coordinates']
    result.append({
        "name": name,
        "coordinates": coordinates
    })

with open('output.json', 'w') as outfile:
    json.dump(result, outfile)
