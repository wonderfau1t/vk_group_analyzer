import random
import time
from concurrent.futures import ThreadPoolExecutor

import redis
from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.request import Request


from .handlers import handle_message

executor = ThreadPoolExecutor(max_workers=3)


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
            executor.submit(handle_message, user_id, attachments[0]['link']['url'])
        else:
            executor.submit(handle_message, user_id, message_text)
        return HttpResponse('ok', content_type='text/plain')
