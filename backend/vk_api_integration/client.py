import requests


class VKClient:
    def __init__(self, base_url: str, api_version: str, access_token: str):
        self.api_version = api_version
        self.access_token = access_token
        self.base_url = base_url

    def get(self, endpoint: str, params: dict):
        params.update({'access_token': self.access_token, 'v': self.api_version})
        response = requests.get(f'{self.base_url}/{endpoint}', params)
        # print(response.json())
        return response.json()['response']