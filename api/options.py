from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import traceback

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        # Set CORS headers for all responses
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        
        try:
            # Multiple strategies to find data.json in Vercel environment
            current_file = os.path.abspath(__file__)
            current_dir = os.path.dirname(current_file)

            # Strategy 1: Same directory as this file
            data_path = os.path.join(current_dir, 'data.json')

            if not os.path.exists(data_path):
                # Strategy 2: Check parent directory
                parent_dir = os.path.dirname(current_dir)
                data_path = os.path.join(parent_dir, 'api', 'data.json')

            if not os.path.exists(data_path):
                # Strategy 3: Check /var/task (Vercel Lambda)
                data_path = '/var/task/api/data.json'

            if not os.path.exists(data_path):
                # Strategy 4: Relative to current working directory
                data_path = os.path.join(os.getcwd(), 'api', 'data.json')

            # Try to load the data
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Extract unique options from fees data
            dsos = ['Elia', 'Fluvius', 'Sibelga', 'Ores', 'Resa']

            # Get all unique combinations
            options = {
                'dsos': dsos,
                'regions': data.get('fluvius_regions', []),
                'voltage_levels': data.get('connection_types', {}),
                'connection_types': data.get('connection_type_variants', {})
            }

            # Send response - headers already sent above
            self.wfile.write(json.dumps(options).encode())

        except Exception as e:
            # Error response - but headers already sent with 200, so send error as JSON
            error_response = {
                'error': str(e),
                'error_type': type(e).__name__,
                'traceback': traceback.format_exc(),
                'message': 'Failed to load configuration data'
            }
            self.wfile.write(json.dumps(error_response).encode())

