from django.urls import path
from .views import home, display, dashboard, login_view, client_details,success, account_user, update_client_status, client_ticket

urlpatterns = [
    path('', home, name="hellow_world"),
    path('home/', home,name="home"),
    path('display-all/', display, name="display_page"),
    path('dashboard/', dashboard, name="dashboard_page"),
    path('logins/', login_view, name="login_page"),
    path('client-details/', client_details, name="client_page"),
    path('success/', success, name="success_page"),
    path('account/', account_user, name="account_page"),
    path('update-status/<int:client_queue_no>/', update_client_status, name="update_status"),
    path('ticket/<int:client_id>/', client_ticket, name="client_ticket"),
]