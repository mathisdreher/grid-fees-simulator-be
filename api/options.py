from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Load data - handle both local and Vercel environments
            import sys
            data = None
            errors = []

            # Try multiple paths
            paths_to_try = [
                os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json'),
                os.path.join(os.getcwd(), 'api', 'data.json'),
                '/var/task/api/data.json',  # Vercel specific path
            ]

            for path in paths_to_try:
                try:
                    with open(path, 'r') as f:
                        data = json.load(f)
                    break
                except Exception as e:
                    errors.append(f"{path}: {str(e)}")
                    continue

            if data is None:
                raise FileNotFoundError(f"Could not find data.json. Tried: {'; '.join(errors)}")

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
