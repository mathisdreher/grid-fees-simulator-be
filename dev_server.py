#!/usr/bin/env python3
"""
Local development server that serves both static files and API endpoints.
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import sys
import csv

# Add api directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(__file__), **kwargs)
    
    def do_GET(self):
        if self.path == '/api/options':
            self.handle_options()
        elif self.path == '/' or self.path == '/index.html':
            self.path = '/public/index.html'
            super().do_GET()
        elif not self.path.startswith('/api/'):
            # Serve from public directory
            if not self.path.startswith('/public/'):
                self.path = '/public' + self.path
            super().do_GET()
        else:
            self.send_error(404)
    
    def do_POST(self):
        if self.path == '/api/calculate':
            self.handle_calculate()
        elif self.path == '/api/compare':
            self.handle_compare()
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def send_json(self, data):
        response = json.dumps(data).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', len(response))
        self.end_headers()
        self.wfile.write(response)
    
    def get_post_data(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))
    
    def handle_options(self):
        try:
            data_path = os.path.join(os.path.dirname(__file__), 'api', 'data.json')
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            options = {
                'dsos': ['Elia', 'Fluvius', 'Sibelga', 'Ores', 'Resa'],
                'regions': data.get('fluvius_regions', []),
                'voltage_levels': data.get('connection_types', {}),
                'connection_types': data.get('connection_type_variants', {})
            }
            self.send_json(options)
        except Exception as e:
            self.send_json({'error': str(e)})
    
    def handle_calculate(self):
        try:
            params = self.get_post_data()
            data_path = os.path.join(os.path.dirname(__file__), 'api', 'data.json')
            
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            result = self.calculate_grid_fees(params, data)
            self.send_json(result)
        except Exception as e:
            self.send_json({'error': str(e)})
    
    def handle_compare(self):
        self.send_json({'error': 'Compare endpoint not implemented'})
    
    def calculate_grid_fees(self, params, data):
        dso_tso = params.get('dso_tso', '').strip()
        region = params.get('region', '').strip()
        voltage = params.get('voltage', '').strip()
        connection_type = params.get('connection_type', '').strip()
        offtake_energy = float(params.get('offtake_energy', 0))
        injection_energy = float(params.get('injection_energy', 0))
        peak_monthly = float(params.get('peak_monthly', 0))
        peak_yearly = float(params.get('peak_yearly', 0))
        contracted_capacity = float(params.get('contracted_capacity', 0))
        is_bess = params.get('is_bess', False)
        
        fee_config = None
        for fee in data['fees']:
            matches = True
            
            fee_dso = (fee.get('DSO/TSO Selection') or '').strip()
            fee_region = (fee.get('Region') or '').strip()
            fee_voltage = (fee.get('Voltage Level') or '').strip()
            fee_connection = (fee.get('Connection Type') or '').strip()
            
            if fee_dso != dso_tso:
                matches = False
            
            if dso_tso == 'Fluvius' and fee_region != region:
                matches = False
            
            if fee_voltage != voltage:
                matches = False
            
            if fee_connection and fee_connection != connection_type:
                matches = False
            
            if matches:
                fee_config = fee
                break
        
        if not fee_config:
            return {
                'error': 'No matching fee configuration found',
                'details': f'DSO/TSO: {dso_tso}, Region: {region}, Voltage: {voltage}, Connection: {connection_type}'
            }
        
        bess_multipliers = {}
        if is_bess:
            for exemption in data['bess_exemptions']:
                if (exemption.get('DSO/TSO Selection') or '').strip() == dso_tso:
                    fee_type = exemption['Fee Type']
                    multiplier = exemption['Multiplier']
                    bess_multipliers[fee_type] = multiplier
        
        fees_breakdown = {}
        total_injection = 0
        total_offtake = 0
        
        injection_fees = {
            'Injection Fixed': (fee_config.get('Injection Fixed', 0) or 0, 1),
            'Injection Contracted': (fee_config.get('Injection Contracted', 0) or 0, contracted_capacity),
            'Injection Peak Monthly': (fee_config.get('Injection Peak Monthly', 0) or 0, peak_monthly * 12),
            'Injection Peak Yearly': (fee_config.get('Injection Peak Yearly', 0) or 0, peak_yearly),
            'Injection Volumetric': (fee_config.get('Injection Volumentric', 0) or 0, injection_energy),
            'Injection Other': (fee_config.get('Injection Other', 0) or 0, 1)
        }
        
        for fee_type, (rate, quantity) in injection_fees.items():
            multiplier = bess_multipliers.get(fee_type, 1.0) if is_bess else 1.0
            fee_value = rate * quantity * multiplier
            if fee_value > 0:
                fees_breakdown[fee_type] = {
                    'rate': rate,
                    'quantity': quantity,
                    'multiplier': multiplier,
                    'total': fee_value
                }
                total_injection += fee_value
        
        offtake_fees = {
            'Offtake Fixed': (fee_config.get('Offtake Fixed', 0) or 0, 1),
            'Offtake Contracted': (fee_config.get('Offtake Contracted', 0) or 0, contracted_capacity),
            'Offtake Peak Monthly': (fee_config.get('Offtake Peak Monthly', 0) or 0, peak_monthly * 12),
            'Offtake Peak Yearly': (fee_config.get('Offtake Peak Yearly', 0) or 0, peak_yearly),
            'Offtake Volumetric': (fee_config.get('Offtake Volumetric', 0) or 0, offtake_energy),
            'Offtake Other': (fee_config.get('Offtake Other', 0) or 0, offtake_energy if offtake_energy > 0 else 1)
        }
        
        for fee_type, (rate, quantity) in offtake_fees.items():
            multiplier = bess_multipliers.get(fee_type, 1.0) if is_bess else 1.0
            fee_value = rate * quantity * multiplier
            if fee_value > 0:
                fees_breakdown[fee_type] = {
                    'rate': rate,
                    'quantity': quantity,
                    'multiplier': multiplier,
                    'total': fee_value
                }
                total_offtake += fee_value
        
        return {
            'success': True,
            'total_injection': round(total_injection, 2),
            'total_offtake': round(total_offtake, 2),
            'total': round(total_injection + total_offtake, 2),
            'breakdown': fees_breakdown,
            'configuration': {
                'dso_tso': dso_tso,
                'region': region,
                'voltage': voltage,
                'connection_type': connection_type,
                'is_bess': is_bess
            }
        }

if __name__ == '__main__':
    port = 8080
    print(f"Starting development server at http://localhost:{port}")
    print("Press Ctrl+C to stop")
    httpd = HTTPServer(('0.0.0.0', port), DevHandler)
    httpd.serve_forever()
