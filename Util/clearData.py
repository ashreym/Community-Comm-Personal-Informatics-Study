import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("cisc475database-firebase-adminsdk-e7gay-269008fff1.json") # contact Dr. Mauriello or Luke Halko for file
firebase_admin.initialize_app(cred, {'databaseURL':'https://cisc475database-default-rtdb.firebaseio.com'})

ref = db.reference("/user_log")

ref.set({})