from flask import Flask, request, jsonify, session
from flask_cors import CORS
import requests

app = Flask(__name__)
app.secret_key = "your_secret_key_here"  # Thay bằng secret key mạnh
CORS(app, supports_credentials=True)  # Cho phép gửi cookie

SYSTEM_PROMPT = {"role": "system", "content": "You are a helpful assistant."}
OLLAMA_URL = "http://192.168.2.45:11434/api/chat"

def get_history():
    return session.get("chat_history", [SYSTEM_PROMPT])

def set_history(history):
    session["chat_history"] = history

@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    model = request.json.get('model', 'gemma:2b')
    history = get_history()
    history.append({"role": "user", "content": user_message})

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": model,
            "messages": history,
            "stream": False
        })
        data = response.json()
        if isinstance(data, dict) and "message" in data and isinstance(data["message"], dict) and "content" in data["message"]:
            assistant_reply = data["message"]["content"]
            history.append({"role": "assistant", "content": assistant_reply})
            set_history(history)
            return jsonify({"reply": assistant_reply})
        else:
            print("Ollama returned:", data)
            return jsonify({"reply": f"⚠️ Ollama did not return valid data: {data}"})
    except Exception as e:
        print("Error:", e)
        return jsonify({"reply": f"Cannot connect to Ollama: {e}"})

@app.route('/api/reset', methods=['POST'])
def reset_chat():
    set_history([SYSTEM_PROMPT])
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
