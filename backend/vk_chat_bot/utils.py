import re

from vk_api_integration.client import client
from vk_api_integration.models import GroupInfo


def extract_group_id(link):
    match = re.search(r'(?:m\.)?vk\.com/(.*)', link)
    if match:
        return match.group(1)
    return None


def send_message(user_id: int, message: str, keyboard: str | None = None):
    params = {
        'user_id': user_id,
        'message': message, 'random_id': 0,
    }
    if keyboard:
        params['keyboard'] = keyboard
    client.get('messages.send', params)


def generate_response(data: GroupInfo) -> str:
    text = f"""
    Короткая ссылка: {data.main_info.screen_name}
    Обложка: {data.main_info.cover}
    Описание: {data.main_info.description}
    """
    return text
