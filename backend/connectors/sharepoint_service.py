import requests
import msal
import os
from dotenv import load_dotenv

load_dotenv()

from django.utils import timezone
from accounts.msal_client import get_msal_app

class SharePointService:
    """
    Connects to Microsoft SharePoint via Microsoft Graph API.
    """
    def __init__(self, user):
        self.user = user
        try:
            self.creds = user.sharepoint_credentials
        except Exception:
            raise Exception("User does not have SharePoint credentials linked.")

        self.access_token = self.creds.access_token

    def _authenticate(self):
        # Refresh the token using the refresh_token
        refresh_token = self.creds.refresh_token
        if not refresh_token:
            raise Exception("No refresh token available.")
            
        app = get_msal_app()
        result = app.acquire_token_by_refresh_token(
            refresh_token,
            scopes=["User.Read", "Files.Read"]
        )
        
        if "access_token" in result:
             self.access_token = result["access_token"]
             # Update DB
             self.creds.access_token = result["access_token"]
             if "refresh_token" in result:
                 self.creds.refresh_token = result["refresh_token"]
             
             # Update expiry if provided (simplified)
             self.creds.save()
        else:
             raise Exception(f"Failed to refresh token: {result.get('error_description')}")
    
    def get_token(self):
        # Check if token is expired or close to expiring (buffer of 5 mins)
        if not self.creds.expires_at or self.creds.expires_at <= timezone.now() + timezone.timedelta(minutes=5):
            print("DEBUG: Token expired or expiring soon. Refreshing...")
            self._authenticate()
        return self.access_token

    def get_headers(self):
        return {
            "Authorization": f"Bearer {self.get_token()}",
            "Content-Type": "application/json"
        }

    def list_files(self, folder_id=None):
        """
        Lists files and folders from the user's personal drive.
        If folder_id is provided, lists children of that folder.
        """
        if folder_id:
             endpoint = f"https://graph.microsoft.com/v1.0/me/drive/items/{folder_id}/children"
        else:
             endpoint = "https://graph.microsoft.com/v1.0/me/drive/root/children"
        
        response = requests.get(endpoint, headers=self.get_headers())
        if response.status_code == 200:
            data = response.json()
            print(f"DEBUG: Graph API Response: {data}")
            items = []
            for item in data.get('value', []):
                is_file = 'file' in item
                is_folder = 'folder' in item
                
                if is_file or is_folder:
                    items.append({
                        'name': item['name'],
                        'id': item['id'],
                        'webUrl': item['webUrl'],
                        'downloadUrl': item.get('@microsoft.graph.downloadUrl'),
                        'type': 'folder' if is_folder else 'file'
                    })
            print(f"DEBUG: Found {len(items)} items")
            return items
        else:
            print(f"Error listing items: {response.text}")
            return []

    def get_file_content(self, file_id=None, download_url=None):
        """
        Downloads file content. 
        If download_url is provided (from list_files), use it.
        Otherwise, fetch the item to get the URL first.
        """
        if not download_url and file_id:
             # Fetch item metadata to get download URL
             endpoint = f"https://graph.microsoft.com/v1.0/me/drive/items/{file_id}"
             resp = requests.get(endpoint, headers=self.get_headers())
             if resp.status_code == 200:
                 download_url = resp.json().get('@microsoft.graph.downloadUrl')
        
        if download_url:
            # Download the actual content
            # Note: For large files, stream it. For this demo, we assume small text/pdfs.
            file_resp = requests.get(download_url)
            if file_resp.status_code == 200:
                # We need to handle different file types. 
                # For now, we return binary, and let the caller handle parsing (e.g. PDF vs Text)
                return file_resp.content
        
        return None
