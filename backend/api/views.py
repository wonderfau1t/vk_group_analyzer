import json
from math import ceil
from typing import List

from rest_framework.decorators import api_view
from rest_framework.response import Response

from vk_api_integration import GroupInfo
from vk_api_integration import get_group_info
from .models import APIResponse, Parameter

messages = json.load(
    open('/Users/wonderfau1t/workspace/python/vk_group_analyzer/backend/api/messages.json', 'r', encoding='utf-8'))


@api_view(['GET'])
def check_group(request):
    group_id = request.query_params.get('group_id')
    access_token = request.query_params.get('access_token')
    group_info: GroupInfo = get_group_info(group_id, access_token)
    response: APIResponse = generate_response(group_info)
    return Response(response.to_dict())


def generate_response(group_info: GroupInfo) -> APIResponse:
    good: List[Parameter] = []
    normal: List[Parameter] = []
    bad: List[Parameter] = []
    score = 0

    for field, value in group_info.result_of_check.__dict__.items():
        if field == 'average_time_between_posts':
            avegarage_time_between_posts_in_hours = value['days'] * 24 + value['hours'] + value['minutes'] / 60
            if avegarage_time_between_posts_in_hours < 6:
                normal.append(Parameter(
                    id=field,
                    title=messages['average_time_between_posts']['title'],
                    description=messages['average_time_between_posts']['low'].format(int(value['days']),
                                                                                     int(value['hours']),
                                                                                     int(value['minutes']))
                ))
            elif 6 < avegarage_time_between_posts_in_hours < 30:
                good.append(Parameter(
                    id=field,
                    title=messages['average_time_between_posts']['title'],
                    description=messages['average_time_between_posts']['medium'].format(int(value['days']),
                                                                                        int(value['hours']),
                                                                                        int(value['minutes']))
                ))
                score += 7.69
            else:
                normal.append(Parameter(
                    id=field,
                    title=messages['average_time_between_posts']['title'],
                    description=messages['average_time_between_posts']['high'].format(int(value['days']),
                                                                                      int(value['hours']),
                                                                                      int(value['minutes']))
                ))
        elif field == 'er':
            good.append(Parameter(
                id=field,
                title=messages[field]['title'],
                description=messages[field]['info'].format(value)
            ))
            score += 7.69
        elif value:
            good.append(Parameter(
                id=field,
                title=messages[field]['title'],
                description=messages[field]['positive']
            ))
            score += 7.69
        else:
            if field in ['cover', 'description', 'can_message']:
                bad.append(Parameter(
                    id=field,
                    title=messages[field]['title'],
                    description=messages[field]['negative']
                ))
            else:
                normal.append(Parameter(
                    id=field,
                    title=messages[field]['title'],
                    description=messages[field]['negative']
                ))

    return APIResponse(
        name=group_info.name,
        photo_100=group_info.photo_100,
        photo_200=group_info.photo_200,
        activity=group_info.activity,
        members_count=group_info.members_count,
        score=ceil(score),
        good=good,
        normal=normal,
        bad=bad
    )
