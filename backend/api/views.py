from rest_framework.decorators import api_view
from rest_framework.response import Response

from backend.vk_api_integration.methods import get_group_info
from backend.vk_api_integration.models import GroupInfo


@api_view(['GET'])
def check_group(request):
    group_id = request.query_params.get('group_id')
    group_info: GroupInfo = get_group_info(group_id)
    return Response(group_info.to_dict())
