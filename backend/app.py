from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Cho phép React gọi API

chat_history = [{"role": "system", "content": "You are a helpful assistant."}]
# OLLAMA_URL = "http://ollama:11434/api/chat"  # Gọi container Ollama
#OLLAMA_URL = "http://localhost:11434/api/chat"  # Gọi Ollama trên máy thật (Docker host)
OLLAMA_URL = "http://192.168.2.44:11434/api/chat"  # Gọi Ollama trên máy thật (Docker host)

@app.route('/api/chat', methods=['POST'])
def chat():
    global chat_history
    user_message = request.json.get('message', '')
    model = request.json.get('model', 'gemma:2b')  # Lấy model từ client, mặc định là gemma:2b
    chat_history.append({"role": "user", "content": user_message})

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": model,
            "messages": chat_history,
            "stream": False
        })
        data = response.json()
        # Kiểm tra dữ liệu trả về
        if isinstance(data, dict) and "message" in data and isinstance(data["message"], dict) and "content" in data["message"]:
            assistant_reply = data["message"]["content"]
            chat_history.append({"role": "assistant", "content": assistant_reply})
            return jsonify({"reply": assistant_reply})
        else:
            print("Ollama trả về:", data)
            return jsonify({"reply": f"⚠️ Ollama không trả về dữ liệu hợp lệ: {data}"})
    except Exception as e:
        print("Error:", e)
        return jsonify({"reply": f"Không kết nối được với Ollama: {e}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
