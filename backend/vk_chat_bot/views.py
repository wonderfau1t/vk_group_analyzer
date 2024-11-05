from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.request import Request

from vk_api_integration.methods import get_group_info
from vk_api_integration.models import GroupInfo
from .utils import send_message, extract_group_id, generate_response


@api_view(['POST'])
def vk_callback(request: Request) -> HttpResponse:
    data = request.data

    if data.get('type') == 'confirmation':
        print(settings.VK_CONFIRMATION_TOKEN)
        return HttpResponse(settings.VK_CONFIRMATION_TOKEN, content_type="text/plain")

    elif data.get('type') == 'message_new':
        user_id = data['object']['message']['from_id']
        message_text = data['object']['message']['text']

        group_id = extract_group_id(message_text)
        if group_id:
            group_info: GroupInfo = get_group_info(group_id)
            response_message = generate_response(group_info)
        else:
            response_message = "Не удалось найти ссылку на сообщество в сообщении."
        print(message_text)
        send_message(user_id, response_message)
        return HttpResponse('ok', content_type='text/plain')
    return HttpResponse('ok', content_type='text/plain')
