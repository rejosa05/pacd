from django.contrib import admin
from django.urls import include, re_path as path
from app.views import dashboard, kiosk, transaction, user, logs, display
from app.views_.loginViews import login_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app.urls')),
    path('index', login_view, name="index"),
    path('kiosk_', kiosk, name="kiosk_"),
    path('dashboard_', dashboard, name="dashboard_"),
    path('transaction_', transaction, name="transaction_"),
    path('users_', user, name="users_"),
    path('logs_', logs, name="logs_"),
    path('display_', display, name="display_")
]