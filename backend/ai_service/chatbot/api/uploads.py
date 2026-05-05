import os
from flask import Blueprint, request, jsonify, send_from_directory

uploads_bp = Blueprint('uploads', __name__, url_prefix='/api')

UPLOAD_FOLDER = "/app/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@uploads_bp.post('/upload') 
def api_upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400

    file = request.files['file']

    if not file.filename:
        return jsonify({'error': 'No file selected'}), 400

    filename = file.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    file.save(filepath)

    return jsonify({
        'filename': filename,
        'path': f'/uploads/{filename}',
        'size': os.path.getsize(filepath),
    })


@uploads_bp.get('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)