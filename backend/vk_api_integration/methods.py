import os
import json
from django.conf import settings
from typing import NamedTuple
from .client import VKClient

client = VKClient('https://api.vk.com/method', '5.199', settings.API_KEY)


class Posts(NamedTuple):
    original_posts: int
    reposts: int


class VKGroupInfo:
    def __init__(self, group_identifier: str | int):
        fields = ['cover', 'description', 'can_message', 'market', 'fixed_post', 'contacts', 'status']
        params = {
            'group_id': group_identifier,
            'fields': ','.join(fields)
        }
        self.group_info: dict = client.get('groups.getById', params)['groups'][0]
        self.group_id = self.group_info.get('id')
        self.posts = client.get('wall.get', {'owner_id': f'-{self.group_id}', 'count': 100})['items']
        self.has_shortlink = bool(self.group_info.get('screen_name'))
        self.has_cover = bool(self.group_info['cover'].get('enabled'))
        self.has_description = bool(self.group_info.get('description'))
        self.has_market = bool(self.group_info['market'].get('enabled'))
        self.has_contacts = bool(self.group_info['contacts'])
        self.has_pinned_post = bool(self.group_info.get('fixed_post'))
        self.can_message = bool(self.group_info.get('can_message'))
        self.is_online = client.get('groups.getOnlineStatus', {'group_id': self.group_id})['status'] == 'online' if self.can_message else False
        self.average_time_between_posts = self.get_average_time_between_posts()
        self.posts_stat = self.get_posts()

    def get_average_time_between_posts(self) -> dict:
        timestamps = sorted([post['date'] for post in self.posts], reverse=True)
        intervals = [timestamps[i] - timestamps[i + 1] for i in range(len(timestamps) - 1)]
        average_interval = sum(intervals) / len(intervals)
        return {
            'days': average_interval // 86400,
            'hours': (average_interval % 86400) // 3600,
            'minutes': (average_interval % 3600) // 60
        }

    def get_posts(self) -> Posts:
        reposts = sum(1 for post in self.posts if 'copy_history' in post)
        return Posts(len(self.posts) - reposts, reposts)

    def to_json(self) -> str:
        data = {
            'group_id': self.group_id,
            'has_shortlink': self.has_shortlink,
            'has_cover': self.has_cover,
            'has_description': self.has_description,
            'has_market': self.has_market,
            'has_contacts': self.has_contacts,
            'has_pinned_post': self.has_pinned_post,
            'can_message': self.can_message,
            'is_online': self.is_online,
            'average_time_between_posts': self.average_time_between_posts,
            'posts_stat': self.posts_stat._asdict()  # Convert NamedTuple to dict
        }
        return data


