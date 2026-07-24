from django.contrib import admin
from django.urls import include, re_path as path
from app.views import index, dashboard, kiosk, transaction

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app.urls')),
    path('index', index, name="index"),
    path('kiosk_', kiosk, name="kiosk_"),
    path('dashboard_', dashboard, name="dashboard_"),
    path('transaction_', transaction, name="transaction_")
]