from django.conf import settings
from requests import Session


class VKApiClient:
    def __init__(self):
        self.session = Session()
        self.api_version = "5.199"
        self.base_url = "https://api.vk.com/method/"
        self.tokens = {
            'groups.getById': settings.GROUP_ACCESS_TOKEN,
            'wall.get': settings.SERVICE_ACCESS_TOKEN,
            'stats.get': 'test',
            'groups.getOnlineStatus': settings.GROUP_ACCESS_TOKEN,
            'messages.send': settings.GROUP_ACCESS_TOKEN
        }

    def get(self, endpoint, params=None, access_token=None):
        params = params or {}
        params['v'] = self.api_version
        params['access_token'] = access_token or self.tokens[endpoint]
        url = self.base_url + endpoint

        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()


client = VKApiClient()
