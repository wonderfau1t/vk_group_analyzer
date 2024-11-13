from dataclasses import dataclass


@dataclass
class ResultOfCheck:
    contacts: bool
    cover: bool
    clips: bool
    screen_name: bool
    description: bool
    fixed_post: bool
    market: bool
    status: bool
    can_message: bool | None
    reposts: bool | None
    hashtags: bool | None
    average_time_between_posts: dict | None
    er: float | None


@dataclass
class GroupInfo:
    name: str
    photo_100: str
    photo_200: str
    activity: str
    members_count: int
    result_of_check: ResultOfCheck
