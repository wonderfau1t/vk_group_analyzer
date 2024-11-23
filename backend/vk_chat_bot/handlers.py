import random
import time

from api.views import generate_response
from vk_api_integration import get_group_info
from .keyboards import inline_main_menu_keyboard, inline_group_analysis_keyboard, to_main_menu_keyboard, main_menu_keyboard, empty_keyboard
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
        if handler['user_state'] == state and (handler['text'] is None or handler['text'] == message_text.lower()):
            handler['func'](user_id, message_text)
            return
    # send_message(user_id, 'Команда не распознана. Список возможных команд:\nАудит', main_menu_keyboard)


@message_handler(user_state='idle', text='начать')
def start_handler(user_id, message_text):
    clear_keyboard_message = 'Очистка прошлых клавиатур'
    send_message(user_id, clear_keyboard_message, empty_keyboard)
    response_message = 'Здравствуйте! Я помогу вам проверить оформление сообщества ВКонтакте по нескольким параметрам. Давайте начнем!'
    send_message(user_id, response_message, inline_main_menu_keyboard)


@message_handler(user_state='idle', text='аудит сообщества')
@message_handler(user_state='idle', text='аудит')
def audit_handler(user_id, message_text):
    response_message = 'Для аудита пришлите, пожалуйста, ссылку на сообщество, которое хотите проверить.'
    set_user_state(user_id, 'awaiting_link')
    send_message(user_id, response_message, inline_group_analysis_keyboard)


@message_handler(user_state='awaiting_link', text='выйти из аудита')
def main_menu_handler(user_id, message_text):
    response_message = 'Выхожу из состояния аудита. Если хотите начать аудит сообщества, введите в любой момент команду "Аудит"'
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
            send_message(user_id, ''.join(response_messages[pivot:]), main_menu_keyboard)
            send_message(user_id, '🔎 Если хотите проанализировать другое сообщество, то нажмите на "Аудит сообщества"',
                         inline_main_menu_keyboard)
            set_user_state(user_id, 'idle')
        else:
            send_message(user_id,
                         'Сообщество не найдено. Убедитесь, что ссылка верна и ведет на существующую группу ВКонтакте.',
                         to_main_menu_keyboard)
    else:
        send_message(user_id,
                     'Не удалось найти сообщество. Пожалуйста, убедитесь, что ссылка соответствует формату: https://vk.com/… и повторите попытку',
                     to_main_menu_keyboard)
