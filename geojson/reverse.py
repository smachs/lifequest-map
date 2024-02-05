import json

# Function to reverse the order of coordinates in a list
def reverse_coordinates(coords):
  return [[y, x] for x, y in coords]

# Read the input JSON file
with open('input.json', 'r') as file:
  data = json.load(file)

# Reverse the coordinates
reversed_data = reverse_coordinates(data)

# Write the reversed data to the output JSON file
with open('output.json', 'w') as file:
  json.dump(reversed_data, file)
