from dataclasses import dataclass, asdict
from typing import List, Dict


@dataclass
class Parameter:
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
    good: Dict[str, Parameter]
    normal: Dict[str, Parameter]
    bad: Dict[str, Parameter]

    def to_dict(self):
        return asdict(self)
