from dataclasses import dataclass, asdict
from typing import List, Dict


@dataclass
class Parameter:
    id: str
    title: str
    description: str


@dataclass
class APIResponse:
    name: str
    photo_100: str
    photo_200: str
    activity: str
    members_count: int
    score: int
    good: List[Parameter]
    normal: List[Parameter]
    bad: List[Parameter]

    def to_dict(self):
        return asdict(self)
