from django.contrib import admin
from django.urls import include, re_path as path
from app.views import dashboard, kiosk, transaction, logs, display, services
from app.views_ import loginViews

urlpatterns = [
    path('admin/', admin.site.urls),
    path('account/', include('app.api_urls')),
    path('', include('app.urls')),

    # Index
    path('login_', loginViews.loginView, name="login_"),
    path('logout_', loginViews.logout_view, name="logout_"),
    path('home', loginViews.loginView, name="index"),
    # path('', loginViews.loginView, name="index"),

    # Pages
    
    path('kiosk_', kiosk, name="kiosk_"),
    path('dashboard_', dashboard, name="dashboard_"),
    path('transaction_', transaction, name="transaction_"),
    path('logs_', logs, name="logs_"),
    path('display_', display, name="display_"),
    path('services_', services, name="services_")
]