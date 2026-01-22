from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            params = json.loads(post_data.decode('utf-8'))

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
            
            # Calculate fees
            result = calculate_grid_fees(params, data)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def calculate_grid_fees(params, data):
    """
    Calculate grid fees based on parameters
    """
    dso_tso = params.get('dso_tso')
    region = params.get('region', '')
    voltage = params.get('voltage')
    connection_type = params.get('connection_type')
    offtake_energy = float(params.get('offtake_energy', 0))  # MWh/y
    injection_energy = float(params.get('injection_energy', 0))  # MWh/y
    peak_monthly = float(params.get('peak_monthly', 0))  # MW
    peak_yearly = float(params.get('peak_yearly', 0))  # MW
    contracted_capacity = float(params.get('contracted_capacity', 0))  # MVA
    is_bess = params.get('is_bess', False)
    
    # Find matching fee configuration
    fee_config = None
    for fee in data['fees']:
        matches = True
        
        if fee['DSO/TSO Selection'] != dso_tso:
            matches = False
        
        if dso_tso == 'Fluvius' and fee.get('Region') != region:
            matches = False
        
        if fee.get('Voltage Level') != voltage:
            matches = False
        
        # Connection type might be NaN for some configurations (like Elia)
        if pd_notna(fee.get('Connection Type')) and fee.get('Connection Type') != connection_type:
            matches = False
        
        if matches:
            fee_config = fee
            break
    
    if not fee_config:
        return {
            'error': 'No matching fee configuration found',
            'details': f'DSO/TSO: {dso_tso}, Region: {region}, Voltage: {voltage}, Connection: {connection_type}'
        }
    
    # Get BESS exemptions if applicable
    bess_multipliers = {}
    if is_bess:
        for exemption in data['bess_exemptions']:
            if exemption['DSO/TSO Selection'] == dso_tso:
                fee_type = exemption['Fee Type']
                multiplier = exemption['Multiplier']
                bess_multipliers[fee_type] = multiplier
    
    # Calculate fees
    fees_breakdown = {}
    total_injection = 0
    total_offtake = 0
    
    # Injection fees
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
    
    # Offtake fees
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

def pd_notna(value):
    """Check if value is not NaN or None"""
    if value is None:
        return False
    if isinstance(value, float):
        import math
        return not math.isnan(value)
    return True
