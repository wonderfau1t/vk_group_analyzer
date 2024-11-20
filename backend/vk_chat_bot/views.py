import random
import time

import redis
from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.request import Request

from api.views import generate_response
from vk_api_integration import get_group_info
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
        attachments = data['object']['message']['attachments']
        if attachments:
            message_handler(user_id, attachments[0]['link']['url'])
        else:
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
            response_message = ('Здравствуйте! Я помогу вам проверить оформление сообщества ВКонтакте по нескольким параметрам '
                                'Давайте начнем!')
            keyboard = main_menu_keyboard
        elif message_text in ('Аудит сообщества', 'Аудит'):
            response_message = 'Для аудита пришлите, пожалуйста, ссылку на сообщество, которое хотите проверить.'
            keyboard = group_analysis_keyboard
            set_user_state(user_id, 'awaiting_link')
        else:
            response_message = 'Команда не распознана. Список возможных команд:\nГлавное меню\nАудит'
            keyboard = main_menu_keyboard
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
                    send_message(user_id, 'Аудит сообщества начался ⌛️Результаты будут в течение 1-3 минут.')
                    group_info = generate_response(group_info)
                    response_messages = generate_message_text(group_info)
                    pivot = len(response_messages) // 2
                    time.sleep(random.randint(5, 8))
                    send_message(user_id, ''.join(response_messages[:pivot]))
                    send_message(user_id, ''.join(response_messages[pivot:]))
                    send_message(user_id, '🔎 Если хотите проанализировать другое сообщество, то нажмите на "Аудит сообщества"', main_menu_keyboard)
                    set_user_state(user_id, 'idle')
                else:
                    response_message = 'Сообщество не найдено. Убедитесь, что ссылка верна и ведет на существующую группу ВКонтакте.'
                    send_message(user_id, response_message)
            else:
                response_message = 'Не удалось найти сообщество. Пожалуйста, убедитесь, что ссылка соответствует формату: https://vk.com/… и повторите попытку'
                send_message(user_id, response_message)
