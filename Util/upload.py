import numpy as np
import pandas as pd
import firebase_admin
from firebase_admin import credentials, db

# ** Before running this script, cd into /Util directory ** # 

def processUrl(url):
    arr = url.split('/')
    if len(arr)>2:
        domain = arr[2].replace('.', ' ')
    else:
        domain = arr[1].replace('.',' ')
        print(arr)
    return domain

# Read in the AllSides data, store it in a pandas dataframe
df=pd.read_csv('../Data/allsides-bias-manual-updates.csv') # Path to dataset to be uploaded

# read in private Firebase key
cred = credentials.Certificate("cisc475database-firebase-adminsdk-e7gay-269008fff1.json")
# authorize the script
firebase_admin.initialize_app(cred, {'databaseURL':'https://cisc475database-default-rtdb.firebaseio.com'})

# We want to upload our data under a node named /bias_annotations_allsides
ref = db.reference('/bias_annotations_allsides')

for i in range(len(df.source)):
    if(df.URL[i]!='***NO URL FOUND***'): 
        domain = processUrl(df.URL[i])
        try:
            ref.update({
            domain:{
                "source":df.source[i].replace('.',' '),
                "bias":df.bias[i],
                "feedback":df.feedback[i],
                "domain":domain
                 }
            })
            print("Uploaded data item number "+str(i)+": "+df.source[i])    
        except Exception as e:
            print(df.source[i].replace('.',' '))
            print(df.bias[i])
            print(df.feedback[i])
            print(domain)
            print(e)
    else:
        domain = '***NO URL FOUND***'
    
    
