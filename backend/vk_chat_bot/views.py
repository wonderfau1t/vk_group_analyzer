import redis
from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.request import Request
from vk_api_integration import get_group_info
from api.views import generate_response

from .keyboards import main_menu_keyboard, group_analysis_keyboard
from .utils import send_message, extract_group_id, generate_message_text

redis_client = redis.Redis(host='localhost', port=6379, db=0)
redis_client.flushdb()


@api_view(['POST'])
def vk_callback(request: Request) -> HttpResponse:
    data = request.data

    if data.get('type') == 'confirmation':
        return HttpResponse(settings.VK_CONFIRMATION_TOKEN, content_type='text/plain')

    elif data.get('type') == 'message_new':
        user_id = data['object']['message']['from_id']
        message_text = data['object']['message']['text']
        message_handler(user_id, message_text)
        return HttpResponse('ok', content_type='text/plain')


def set_user_state(user_id, state):
    redis_client.set(f'user_state:{user_id}', state)


def get_user_state(user_id):
    state = redis_client.get(f'user_state:{user_id}')
    return state.decode('utf-8') if state else 'idle'


def message_handler(user_id: int, message_text: str):
    state = get_user_state(user_id)
    if state == 'idle':
        if message_text == 'Начать':
            response_message = 'Приветствие'
            keyboard = main_menu_keyboard
        elif message_text in ('Анализ сообщества', 'Анализ'):
            response_message = 'Скиньте ссылку на сообщество'
            keyboard = group_analysis_keyboard
            set_user_state(user_id, 'awaiting_link')
        else:
            response_message = 'Команда не распознана :( \nСписок возможных команд:\nАнализ\nДоп. функционал 1\n Доп. функционал 2'
            keyboard = None
        send_message(user_id, response_message, keyboard)
    elif state == 'awaiting_link':
        if message_text == 'Главное меню':
            response_message = 'Возвращаю в главное меню'
            set_user_state(user_id, 'idle')
            send_message(user_id, response_message, main_menu_keyboard)
        else:
            group_id = extract_group_id(message_text)
            if group_id:
                group_info = get_group_info(group_id)
                if group_info:

                    group_info = generate_response(group_info)
                    response_messages = generate_message_text(group_info).split('||')
                    for i in range(len(response_messages)):
                        if i == len(response_messages) - 1:
                            send_message(user_id, response_messages[i], main_menu_keyboard)
                        else:
                            send_message(user_id, response_messages[i])
                    set_user_state(user_id, 'idle')
                else:
                    response_message = 'Группа не найдена'
                    send_message(user_id, response_message)
            else:
                response_message = 'Ссылка на группа должна быть в формате:\nhttps://vk.com/...'
                send_message(user_id, response_message)
