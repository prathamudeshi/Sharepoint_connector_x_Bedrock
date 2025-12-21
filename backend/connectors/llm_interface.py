from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any

class LLMInterface(ABC):
    """
    Abstract Base Class for LLM Services.
    Designed to be model-agnostic (Gemini, Bedrock, etc.)
    """

    @abstractmethod
    def generate_response(self, message: str, history: List[Dict[str, str]] = None, context_files: List[Any] = None) -> str:
        """
        Generate a response based on the message, chat history, and optional context files.
        
        Args:
            message: The user's input message.
            history: List of previous messages [{'role': 'user'/'model', 'content': '...'}].
            context_files: List of file contents or references to include in context.
            
        Returns:
            The model's text response.
        """
        pass

    @abstractmethod
    def stream_response(self, message: str, history: List[Dict[str, str]] = None, context_files: List[str] = None):
        """
        Generator for streaming responses.
        """
        pass
