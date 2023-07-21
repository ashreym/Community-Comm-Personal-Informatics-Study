import sys
import json
from  http.server import SimpleHTTPRequestHandler
import socketserver
import threading

import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

from urllib.parse import urlparse
from datetime import timezone
import datetime

''' Setup server '''
PORT = 8080
DEBUG = False
SILENT = True

class Handler(SimpleHTTPRequestHandler):

    def setup(self):
        self.request.settimeout(60)
        SimpleHTTPRequestHandler.setup(self)

    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.end_headers()

    def do_GET(self):
        if self.path.split('?')[0] == '/api/v1/survey_completed/':
            ''' Connect to service account '''
            cred = credentials.Certificate("./serviceAccountKey.json")
            app = firebase_admin.initialize_app(cred, { 'databaseURL' : 'https://cisc475database-default-rtdb.firebaseio.com/'})
            parsed_url = urlparse(self.path)
            print(parsed_url)

            try:
                user = parsed_url.query.split('=')[1].split('&')[0]
                print(user)
                if (user == ""):
                    user = "World"
                else:     
                    dt = datetime.datetime.now(timezone.utc)
                    db.reference('Qualtrics_Demographics/' + user).set({ 'status' : 'true', 'timestamp' : str(dt)})
            except:
                user = "World"

            firebase_admin.delete_app(app)
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            ret = 'Hello, ' + user + "!"
            self.wfile.write(ret.encode('ascii'))
            return
        elif self.path.split('?')[0] == '/api/v1/websense_survey_completed/':
                         ''' Connect to service account '''
                         cred = credentials.Certificate("./websense-374420-firebase-adminsdk-znkvz-eb17d19033.json")
                         app = firebase_admin.initialize_app(cred, { 'databaseURL' : 'https://websense-374420-default-rtdb.firebaseio.com/'})
                         parsed_url = urlparse(self.path)
                         print(parsed_url)

                         try:
                             user = parsed_url.query.split('=')[1].split('&')[0]
                             print(user)
                             if (user == ""):
                                 user = "World"
                             else:
                                 dt = datetime.datetime.now(timezone.utc)
                                 db.reference('Qualtrics_Demographics/' + user).set({ 'status' : 'true', 'timestamp' : str(dt)})
                         except:
                             user = "World"

                         firebase_admin.delete_app(app)
                         self.send_response(200)
                         self.send_header('Access-Control-Allow-Origin', '*')
                         self.send_header('Content-Type', 'application/json')
                         self.end_headers()
                         ret = 'Hello, ' + user + "!"
                         self.wfile.write(ret.encode('ascii'))
                         return
        else:
            return SimpleHTTPRequestHandler.do_GET(self)

    def do_POST(self):
            return SimpleHTTPRequestHandler.do_POST(self)


thread = threading.Thread()
thread.daemon = True
thread.start()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("Serving at port: " + str(PORT) + "...")
    httpd.serve_forever()

