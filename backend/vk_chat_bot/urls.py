from django.urls import path

from . import views

urlpatterns = [
    path('', views.vk_callback)
]
