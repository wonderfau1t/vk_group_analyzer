import time

from rest_framework.response import Response
from rest_framework.decorators import api_view
from vk_api_integration.methods import VKGroupInfo


@api_view(['GET'])
def check_group(request):
    start_time = time.time()
    group_id = request.query_params.get('group_id')
    group_info = VKGroupInfo(group_id)
    end_time = time.time()
    print(end_time - start_time)
    return Response(group_info.to_json())
