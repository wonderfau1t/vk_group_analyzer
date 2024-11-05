import re

from backend.vk_api_integration.client import client
from backend.vk_api_integration.models import GroupInfo


def extract_group_id(link):
    match = re.search(r'vk\.com/(?:club|public)?(\w+)', link)
    if match:
        return match.group(1)
    return None


def send_message(user_id: int, message: str):
    client.get('messages.send', params={'user_id': user_id, 'message': message, 'random_id': 0})


def generate_response(data: GroupInfo) -> str:
    text = f"""
    Короткая ссылка: {data.main_info.screen_name}
    Обложка: {data.main_info.cover}
    Описание: {data.main_info.description}
    """
    return text
