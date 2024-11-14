import re

from api.models import APIResponse
from vk_api_integration.client import client


def extract_group_id(link):
    match = re.search(r'(?:m\.)?vk\.com/(.*)', link)
    if match:
        return match.group(1)
    return None


def send_message(user_id: int, message: str, keyboard: str | None = None):
    params = {
        'user_id': user_id,
        'message': message,
        'random_id': 0,
    }
    if keyboard:
        params['keyboard'] = keyboard
    response = client.post('messages.send', params)
    print(response)


def generate_message_text(data: APIResponse) -> str:
    text = "Аудит сообщества закончен. Сообщество было проверено по самым важным параметрам, которые могут влиять на " \
           "привлечение клиентов и подписчиков.\nРезультаты:\n"
    for parameter in data.good:
        text += f"\n🟢 {parameter.title}\n{parameter.description}\n"
    text += "||"
    for parameter in data.normal:
        text += f"\n🟡 {parameter.title}\n{parameter.description}\n"
    for parameter in data.bad:
        text += f"\n🔴 {parameter.title}\n{parameter.description}\n"

    text += ("\n✔️Аудит сообщества закончен. Качество подготовки сообщества и его контент стратегия — "
             "определяют интерес к группе и дальнейшее взаимодействие (от крепкого комьюнити до продаж). "
             "Если у вас остались вопросы и вы хотите разобрать их подробнее,"
             "вы всегда можете написать в чат комьюнити смм и таргета 👉https://vk.cc/cEyBab \n")
    return text
