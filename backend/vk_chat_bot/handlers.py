import random
import time

from api.views import generate_response
from vk_api_integration import get_group_info
from .keyboards import main_menu_keyboard, group_analysis_keyboard
from .utils import send_message, extract_group_id, generate_message_text, set_user_state, get_user_state

handlers = []


def message_handler(user_state=None, text=None):
    def decorator(func):
        handlers.append({
            'user_state': user_state,
            'text': text,
            'func': func
        })
        return func

    return decorator


def handle_message(user_id, message_text):
    state = get_user_state(user_id)
    for handler in handlers:
        if handler['user_state'] == state and (handler['text'] is None or handler['text'] == message_text):
            handler['func'](user_id, message_text)
            return
    send_message(user_id, 'Команда не распознана. Список возможных команд:\nАудит', main_menu_keyboard)


@message_handler(user_state='idle', text='Начать')
def start_handler(user_id, message_text):
    response_message = 'Здравствуйте! Я помогу вам проверить оформление сообщества ВКонтакте по нескольким параметрам. Давайте начнем!'
    send_message(user_id, response_message, main_menu_keyboard)


@message_handler(user_state='idle', text='Аудит сообщества')
@message_handler(user_state='idle', text='Аудит')
def audit_handler(user_id, message_text):
    response_message = 'Для аудита пришлите, пожалуйста, ссылку на сообщество, которое хотите проверить.'
    set_user_state(user_id, 'awaiting_link')
    send_message(user_id, response_message, group_analysis_keyboard)


@message_handler(user_state='awaiting_link', text='Главное меню')
def main_menu_handler(user_id, message_text):
    response_message = 'Возвращаю в главное меню'
    set_user_state(user_id, 'idle')
    send_message(user_id, response_message, main_menu_keyboard)


@message_handler(user_state='awaiting_link')
def group_link_handler(user_id, message_text):
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
            send_message(user_id, '🔎 Если хотите проанализировать другое сообщество, то нажмите на "Аудит сообщества"',
                         main_menu_keyboard)
            set_user_state(user_id, 'idle')
        else:
            send_message(user_id,
                         'Сообщество не найдено. Убедитесь, что ссылка верна и ведет на существующую группу ВКонтакте.')
    else:
        send_message(user_id,
                     'Не удалось найти сообщество. Пожалуйста, убедитесь, что ссылка соответствует формату: https://vk.com/… и повторите попытку')
