from django.urls import path
from .views import home, display, dashboard, login_view, client_details, account_user, update_client_status, client_ticket

urlpatterns = [
    path('', home, name="hellow_world"),
    path('home/', home,name="home"),
    path('display-all/', display, name="display_page"),
    path('dashboard/', dashboard, name="dashboard"),
    path('logins/', login_view, name="login_page"),
    path('client-details/', client_details, name="client_page"),
    path('account/', account_user, name="account_page"),
    path('update_client_status/', update_client_status, name = "update_client_status"),
    path('ticket/<int:client_id>/', client_ticket, name="client_ticket"),
]