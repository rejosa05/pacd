from django.urls import path
from .views import home, display, dashboard, login_view, client_details,success, account_user

urlpatterns = [
    path('', home, name="hellow_world"),
    path('home/', home,name="home"),
    path('display-all/', display, name="display_page"),
    path('dashboard/', dashboard, name="dashboard_page"),
    path('logins/', login_view, name="login_page"),
    path('client-details/', client_details, name="client_page"),
    path('success/', success, name="success_page"),
    path('account/', account_user, name="account_page"),
]