from django.urls import path, include
from . import views

urlpatterns = [
  path('', views.index, name="index"),
  path('get/', views.get, name="get"),
  path('add/', views.add, name="add"),
  path('delete/<int:id>/', views.delete, name="delete"),
]
