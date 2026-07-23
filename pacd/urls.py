from django.contrib import admin
from django.urls import include, re_path as path
from app.views import index, dashboard

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app.urls')),
    path('index', index, name="index"),
    path('dashboard_', dashboard, name="dashboard_")
]