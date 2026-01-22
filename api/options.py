from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
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

            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(json.dumps(options).encode())

        except FileNotFoundError as e:
            # Detailed error for debugging
            error_info = {
                'error': 'Data file not found',
                'details': str(e),
                'current_dir': os.path.dirname(os.path.abspath(__file__)),
                'cwd': os.getcwd(),
                'attempted_path': data_path if 'data_path' in locals() else 'unknown',
                'dir_contents': os.listdir(os.path.dirname(os.path.abspath(__file__)))
            }
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_info).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {
                'error': str(e),
                'error_type': type(e).__name__,
                'message': 'Failed to load configuration data'
            }
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

