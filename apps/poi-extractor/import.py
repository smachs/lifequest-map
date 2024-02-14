import json
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime

uri = "mongodb+srv://user:pass@guardian.6sl67qu.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['test']
collection = db['markers']

# marker options
catType = "gym"
createdBy = "SABOTAGE"
createdById = "76561198131135154"

# Carregar dados do arquivo JSON
with open('output.json', 'r', encoding='utf-8') as file:
    json_data = json.load(file)

documents_to_insert = []
for item in json_data:
    doc = {
        'position': [item['lng'], item['lat'], 0.0],
        'type': catType,
        'name': item['name'],
        'description': item['about'],
        'userId': createdById,
        'username': createdBy,
        'isPrivate': False,
        'createdAt': datetime.now(),
        'updatedAt': datetime.now()
    }
    documents_to_insert.append(doc)

result = collection.insert_many(documents_to_insert)

print(f'Inserted: {len(result.inserted_ids)} markers.')
