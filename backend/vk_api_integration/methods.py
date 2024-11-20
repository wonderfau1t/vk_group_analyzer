import re
from datetime import datetime, timedelta
from typing import Tuple

from .client import client
from .models import GroupInfo, ResultOfCheck


def get_group_info(group_id: int | str, user_access_token=None) -> GroupInfo | None:
    if user_access_token:
        group_info, group_id = get_main_info(group_id, user_access_token)
    else:
        group_info, group_id = get_main_info(group_id)
    if group_info:
        posts_info = get_posts_info(group_id, group_info.members_count)
        group_info.result_of_check.reposts = posts_info['reposts']
        group_info.result_of_check.reposts = posts_info['hashtags']
        group_info.result_of_check.average_time_between_posts = posts_info['average_time_between_posts']
        group_info.result_of_check.er = posts_info['er']
        if user_access_token:
            group_info.can_message = can_message_to_group(group_id, user_access_token)

        return group_info
    return None


def get_main_info(group_id: int) -> Tuple[GroupInfo, int] | Tuple[None, None]:
    params = {
        'group_id': group_id,
        'fields': 'contacts,counters,cover,description,fixed_post,market,activity,members_count'
    }
    response = client.get('groups.getById', params)
    data = response['response']['groups'][0] if response.get('response') else {}

    if bool(data.get('name')):
        online_response = client.get('groups.getOnlineStatus', params={'group_id': group_id})
        status = online_response.get('response', {}).get('status') == 'online'

        return GroupInfo(
            name=data.get('name'),
            photo_100=data.get('photo_100'),
            photo_200=data.get('photo_200'),
            activity=data.get('activity'),
            members_count=data.get('members_count'),
            result_of_check=ResultOfCheck(
                contacts=bool(data.get('contacts')),
                cover=bool(data.get('cover', {}).get('enabled')),
                clips=(data['counters'].get('clips', 0) > 0),
                screen_name=bool(data.get('screen_name')),
                description=bool(data.get('description')),
                fixed_post=bool(data.get('fixed_post')),
                market=bool(data.get('market', {}).get('enabled')),
                status=status,
                can_message=None,
                reposts=None,
                hashtags=None,
                average_time_between_posts=None,
                er=None
            )
        ), data.get('id')
    return None, None


def get_posts_info(group_id: int, members_count: int):
    params = {
        'owner_id': f'-{group_id}',
        'count': 100
    }
    response = client.get('wall.get', params)
    posts = response['response']['items']
    recent_posts = filter_recent_posts(posts, 30)

    reposts_exists = bool(sum(1 for post in recent_posts if 'copy_history' in post))
    hashtags_exists = bool(sum(1 for post in recent_posts if re.search(r'#\w+', post.get('text', ''))))
    average_time_between_posts = get_average_time_between_posts(recent_posts)
    er = round(sum(post['comments']['count'] + post['likes']['count'] + post['reposts']['count'] for post in recent_posts) / members_count * 100, 2)

    return {
        'reposts': reposts_exists,
        'hashtags': hashtags_exists,
        'average_time_between_posts': average_time_between_posts,
        'er': er
    }


def filter_recent_posts(posts, days: int):
    cutoff_date = datetime.now() - timedelta(days=days)
    return [post for post in posts if datetime.fromtimestamp(post['date']) > cutoff_date]


def can_message_to_group(group_id: int, user_access_token: str) -> bool:
    # Получить можно только с помощью ключа пользователя
    response = client.get('groups.getById', params={'group_id': group_id, 'fields': 'can_message'},
                          access_token=user_access_token)
    data = response['response']['groups'][0]
    return bool(data['can_message'])


def get_average_time_between_posts(posts) -> dict:
    if len(posts) < 2:
        return {
            'error_message': 'За месяц менее 2х постов'
        }
    timestamps = sorted([post['date'] for post in posts], reverse=True)
    intervals = [timestamps[i] - timestamps[i + 1] for i in range(len(timestamps) - 1)]
    average_interval = sum(intervals) / len(intervals)
    return {
        'days': average_interval // 86400,
        'hours': (average_interval % 86400) // 3600,
        'minutes': (average_interval % 3600) // 60
    }
