from django.urls import path
from . import views

urlpatterns = [
    path('check_group', views.check_group)
]
