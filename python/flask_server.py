import os
import sys
import json
import re
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
from paddleocr import PaddleOCR
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# --- Initialize Flask App ---
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)  # Allow requests from React frontend

# Create uploads directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- Initialize Models ---
print("Initializing PaddleOCR engine...")
try:
    ocr_engine = PaddleOCR(lang='en')
    print("PaddleOCR engine ready.")
except Exception as e:
    print(f"FATAL ERROR: Could not initialize PaddleOCR. Error: {e}")
    sys.exit(1)

try:
    api_key = os.getenv('API_KEY')
    if not api_key:
        print("Warning: API_KEY not found in environment variables")
    else:
        genai.configure(api_key=api_key)
        print("Gemini AI configured.")
except Exception as e:
    print(f"ERROR: API Key Configuration Error: {e}")

# --- Core Processing Functions ---
def extract_text_with_ocr(image_path, engine):
    """Extract text using PaddleOCR"""
    try:
        print(f"Processing image: {image_path}")
        result = engine.predict(image_path)
        
        if not result:
            print("No OCR results returned")
            return ""
        
        text_lines = []
        for res in result:
            if 'rec_texts' in res:
                rec_texts = res['rec_texts']
                text_lines.extend(rec_texts)
                print(f"SUCCESS: Found {len(rec_texts)} text lines: {rec_texts}")
        
        extracted_text = "\n".join(text_lines) if text_lines else ""
        print(f"Final extracted text: '{extracted_text}'")
        return extracted_text
        
    except Exception as e:
        print(f"Error during OCR: {e}")
        import traceback
        traceback.print_exc()
        return ""

def extract_business_card_details(ocr_text):
    """Extract structured business card details using Gemini AI"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        prompt = f"""
        You are an expert AI data extractor specializing in parsing business card details.
        Analyze the OCR text and structure it into a clean JSON object.

        --- RAW OCR TEXT ---
        {ocr_text}
        --------------------

        Extract these fields:
        - prefix: Professional title before name (e.g., "Prof", "Dr")
        - name: Full name of the person (without prefix/suffix)
        - suffix: Degrees/certifications after name (e.g., "PhD", "MBA")
        - department: Primary department or role
        - special_designation: Secondary role or specific group
        - organization: Company or institution name
        - phone_number: Phone number with country code if available
        - email: Email address
        - website: Website URL
        - address: Full physical address

        Rules:
        1. If a field is not present, use `null`
        2. Clean up OCR errors and formatting issues
        3. Return ONLY valid JSON starting with {{ and ending with }}
        4. Do not include markdown or explanations
        """
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up the response
        response_text = re.sub(r'```json', '', response_text)
        response_text = re.sub(r'```', '', response_text)
        response_text = re.sub(r'^[^{]*', '', response_text)
        response_text = re.sub(r'[^}]*$', '', response_text)
        
        print(f"Cleaned Gemini response: {response_text}")
        
        if response_text and response_text.startswith('{') and response_text.endswith('}'):
            return json.loads(response_text)
        else:
            raise ValueError("Invalid JSON format from Gemini")
            
    except Exception as e:
        print(f"Error during Gemini API call: {e}")
        
        # Fallback - create structured data manually from OCR text
        return create_fallback_data(ocr_text)

def create_fallback_data(ocr_text):
    """Create fallback structured data when AI processing fails"""
    lines = [line.strip() for line in ocr_text.split('\n') if line.strip()]
    
    name_parts = []
    department = None
    phone = None
    email = None
    website = None
    address_parts = []
    
    for line in lines:
        if '@' in line and '.' in line:
            email = line
        elif line.startswith('+') and any(c.isdigit() for c in line):
            phone = line
        elif '.' in line and '@' not in line and 'LOGO' not in line.upper():
            website = line
        elif any(word in line.upper() for word in ['STREET', 'ADDRESS', 'ROAD', 'AVE']):
            address_parts.append(line)
        elif not department and len(name_parts) > 0:
            department = line
        elif len(name_parts) < 2 and line.isupper():
            name_parts.append(line)
    
    return {
        "prefix": None,
        "name": " ".join(name_parts) if name_parts else "Unknown",
        "suffix": None,
        "department": department,
        "special_designation": None,
        "organization": None,
        "phone_number": phone,
        "email": email,
        "website": website,
        "address": ", ".join(address_parts) if address_parts else None
    }

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- API Endpoints ---
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "OCR API"})

@app.route('/extract-card', methods=['POST'])
def extract_card():
    """Extract business card information from uploaded image"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not (file and allowed_file(file.filename)):
            return jsonify({"error": "File type not allowed. Use PNG, JPG, or JPEG"}), 400

        # Save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        print(f"Saved file to: {filepath}")
        
        # Extract text using OCR
        ocr_text = extract_text_with_ocr(filepath, ocr_engine)
        
        if not ocr_text or ocr_text.strip() == "":
            return jsonify({"error": "OCR could not detect any text in the image"}), 400
        
        print(f"OCR detected text: {ocr_text}")
        
        # Extract structured data
        extracted_data = extract_business_card_details(ocr_text)
        
        # Add the raw OCR text to the response for debugging
        extracted_data["raw_ocr_text"] = ocr_text
        
        return jsonify({
            "success": True,
            "data": extracted_data
        })

    except Exception as e:
        print(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500
    
    finally:
        # Clean up uploaded file
        if 'filepath' in locals() and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"Warning: Could not remove file {filepath}: {e}")

# --- Run the Flask Server ---
if __name__ == '__main__':
    print("Starting OCR Flask Server...")
    print("Make sure to set your API_KEY environment variable for Gemini AI")
    app.run(host='0.0.0.0', port=5001, debug=True)