from django.urls import path
from . import views

urlpatterns = [
    path('', views.home,name="hellow_world"),
    path('home/', views.home,name="home"),
    path('display/', views.display, name="display_page"),
    path('dashboard/', views.dashboard, name="dashboard_page"),
    path('logins/', views.login_view, name="login_page"),
]