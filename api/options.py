from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Load data - handle both local and Vercel environments
            try:
                # Try current directory first (Vercel)
                current_dir = os.path.dirname(os.path.abspath(__file__))
                data_path = os.path.join(current_dir, 'data.json')
                with open(data_path, 'r') as f:
                    data = json.load(f)
            except FileNotFoundError:
                # Fallback for different directory structures
                data_path = os.path.join(os.getcwd(), 'api', 'data.json')
                with open(data_path, 'r') as f:
                    data = json.load(f)
            
            # Extract unique options from fees data
            dsos = ['Elia', 'Fluvius', 'Sibelga', 'Ores', 'Resa']
            
            # Get all unique combinations
            options = {
                'dsos': dsos,
                'regions': data['fluvius_regions'],
                'voltage_levels': data['connection_types'],
                'connection_types': data['connection_type_variants']
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
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
