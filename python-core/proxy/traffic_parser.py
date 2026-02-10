import json

def parse_chat_request(body: str) -> str:
    """Extracts the user prompt from a JSON chat request."""
    try:
        data = json.loads(body)
        messages = data.get("messages", [])
        for msg in reversed(messages):
            if msg.get("role") == "user":
                return msg.get("content", "")
    except:
        pass
    return body
