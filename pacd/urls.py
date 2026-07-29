from django.contrib import admin
from django.urls import include, re_path as path
from app.views import dashboard, kiosk, transaction, logs, display, services
from app.views_.loginViews import loginView
from app.views_.userViews import userView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app.urls')),
    


    # Pages
    path('index', loginView, name="index"),
    path('kiosk_', kiosk, name="kiosk_"),
    path('dashboard_', dashboard, name="dashboard_"),
    path('transaction_', transaction, name="transaction_"),
    path('users_', userView, name="users_"),
    path('logs_', logs, name="logs_"),
    path('display_', display, name="display_"),
    path('services_', services, name="services_")
]