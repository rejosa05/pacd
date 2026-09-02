from django.contrib import admin
from django.urls import include, path
from app.views import logs, services
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

    path('logs_', logs, name="logs_"),
    
    path('services_', services, name="services_")
]