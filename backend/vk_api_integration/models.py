from dataclasses import dataclass, asdict


@dataclass
class MainInfo:
    contacts: bool
    cover: bool
    screen_name: bool
    description: bool
    fixed_post: bool
    market: bool
    status: bool
    can_message: bool | None


@dataclass
class PostsInfo:
    count_of_original_posts: int
    count_of_reposts: int
    average_time_between_posts: dict
    count_of_posts_with_hashtags: int
    count_of_posts_without_hashtags: int


@dataclass
class GroupInfo:
    main_info: MainInfo
    posts_info: PostsInfo

    def to_dict(self):
        return asdict(self)
