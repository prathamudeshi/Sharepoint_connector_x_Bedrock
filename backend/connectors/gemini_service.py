import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import List, Dict, Any
from .llm_interface import LLMInterface

load_dotenv()

class GeminiService(LLMInterface):
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        # User explicitly requested gemini-2.5-flash
        self.model_name = "gemini-2.5-flash"
        try:
             self.model = genai.GenerativeModel(self.model_name)
        except Exception as e:
             # Fallback or log error if the model name is invalid in the SDK
             print(f"Warning: Could not load {self.model_name}, falling back to gemini-1.5-flash. Error: {e}")
             self.model = genai.GenerativeModel("gemini-1.5-flash")


    def generate_response(self, message: str, history: List[Dict[str, str]] = None, context_files: List[Any] = None) -> str:
        # Construct chat history for Gemini
        chat_history = []
        if history:
            for msg in history:
                role = "user" if msg.get("role") == "user" else "model"
                chat_history.append({"role": role, "parts": [msg.get("content", "")]})
        
        # Start chat session
        chat = self.model.start_chat(history=chat_history)
        
        # Prepare message payload
        user_parts = []
        
        # Add context files as parts
        if context_files:
            for item in context_files:
                if isinstance(item, str):
                    # Legacy text content
                    user_parts.append(item)
                elif isinstance(item, dict) and "data" in item and "mime_type" in item:
                    # Native file content
                    user_parts.append({
                        "mime_type": item["mime_type"],
                        "data": item["data"]
                    })
        
        # Add text message
        user_parts.append(message)

        response = chat.send_message(user_parts)
        return response.text

    def stream_response(self, message: str, history: List[Dict[str, str]] = None, context_files: List[str] = None):
        chat_history = []
        if history:
            for msg in history:
                role = "user" if msg.get("role") == "user" else "model"
                chat_history.append({"role": role, "parts": [msg.get("content", "")]})
        
        chat = self.model.start_chat(history=chat_history)
        
        prompt = message
        if context_files:
            context_str = "\n\n".join([f"--- File Content ---\n{c}" for c in context_files])
            prompt = f"{context_str}\n\nQuestion: {message}"

        response = chat.send_message(prompt, stream=True)
        for chunk in response:
            if chunk.text:
                yield chunk.text
