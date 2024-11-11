import re
from typing import Tuple

from .client import client
from .models import MainInfo, PostsInfo, GroupInfo


def get_group_info(group_id: int | str, user_access_token=None) -> GroupInfo | None:
    main_info, group_id = get_main_info(group_id)
    if main_info:
        posts_info = get_posts_info(group_id)
        if user_access_token:
            main_info.can_message = can_message_to_group(group_id, user_access_token)

        return GroupInfo(
            main_info=main_info,
            posts_info=posts_info,
        )
    return None


def get_main_info(group_id: int) -> Tuple[MainInfo, int] | Tuple[None, None]:
    params = {
        'group_id': group_id,
        'extended': 1,
        'fields': 'contacts,cover,description,fixed_post,market,activity,members_count'
    }
    response = client.get('groups.getById', params)
    data = response['response']['groups'][0] if response.get('response') else {}

    if bool(data.get('name')):
        online_response = client.get('groups.getOnlineStatus', params={'group_id': group_id})
        status = online_response.get('response', {}).get('status') == 'online'

        return MainInfo(
            name=data.get('name'),
            photo_100=data.get('photo_100'),
            photo_200=data.get('photo_200'),
            activity=data.get('activity'),
            members_count=data.get('members_count'),
            contacts=bool(data.get('contacts')),
            cover=bool(data['cover']['enabled']),
            screen_name=bool(data.get('screen_name')),
            description=bool(data.get('description')),
            fixed_post=bool(data.get('fixed_post')),
            market=bool(data['market']['enabled']),
            status=status,
            can_message=None
        ), data.get('id')
    return None, None


def get_posts_info(group_id: int) -> PostsInfo:
    params = {
        'owner_id': f'-{group_id}',
        'count': 100
    }
    response = client.get('wall.get', params)
    posts = response['response']['items']

    count_of_reposts = sum(1 for post in posts if 'copy_history' in post)
    average_time_between_posts = get_average_time_between_posts(posts)
    count_of_posts_with_hashtags = get_count_of_posts_with_hashtags(posts)

    return PostsInfo(
        count_of_original_posts=len(posts) - count_of_reposts,
        count_of_reposts=count_of_reposts,
        average_time_between_posts=average_time_between_posts,
        count_of_posts_with_hashtags=count_of_posts_with_hashtags,
        count_of_posts_without_hashtags=len(posts) - count_of_posts_with_hashtags
    )


def can_message_to_group(group_id: int, user_access_token: str) -> bool:
    # Получить можно только с помощью ключа пользователя
    response = client.get('groups.getById', params={'group_id': group_id, 'fields': 'can_message'},
                          access_token=user_access_token)
    data = response['response']['groups'][0]
    return bool(data['can_message'])


def get_average_time_between_posts(posts) -> dict:
    timestamps = sorted([post['date'] for post in posts], reverse=True)
    intervals = [timestamps[i] - timestamps[i + 1] for i in range(len(timestamps) - 1)]
    average_interval = sum(intervals) / len(intervals)
    return {
        'days': average_interval // 86400,
        'hours': (average_interval % 86400) // 3600,
        'minutes': (average_interval % 3600) // 60
    }


def get_count_of_posts_with_hashtags(posts) -> int:
    hashtag_pattern = re.compile(r'#\w+')
    posts_with_hashtags = 0
    for post in posts:
        if 'text' in post and hashtag_pattern.search(post['text']):
            posts_with_hashtags += 1
    return posts_with_hashtags
