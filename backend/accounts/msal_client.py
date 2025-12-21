import msal
import os
from dotenv import load_dotenv

load_dotenv()

def get_msal_app():
    return msal.ConfidentialClientApplication(
        os.getenv("SHAREPOINT_CLIENT_ID"),
        authority=f"https://login.microsoftonline.com/{os.getenv('SHAREPOINT_TENANT_ID')}",
        client_credential=os.getenv("SHAREPOINT_CLIENT_SECRET")
    )

def get_auth_url(redirect_uri):
    app = get_msal_app()
    return app.get_authorization_request_url(
        ["User.Read", "Files.Read"],
        redirect_uri=redirect_uri
    )

def acquire_token_by_code(code, redirect_uri):
    app = get_msal_app()
    return app.acquire_token_by_authorization_code(
        code,
        scopes=["User.Read", "Files.Read"],
        redirect_uri=redirect_uri
    )
