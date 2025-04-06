from django.urls import path
from .views import home, display, dashboard,update_division_log, login_view, logout_view, client_details, create_authorized_personnel , update_client_status, client_ticket

urlpatterns = [
    path('', login_view, name="hogins"),
    path('home/', home,name="home"),
    path('display-all/', display, name="display_page"),
    path('dashboard/', dashboard, name="dashboard"),
    path('login/', login_view, name="login"),
    path('logout/', logout_view, name ="logout"),
    path('client-details/', client_details, name="client_page"),
    path('account/', create_authorized_personnel, name="account"),
    path('update_client_status/', update_client_status, name = "update_client_status"),
    path('ticket/<int:client_id>/', client_ticket, name="client_ticket"),
    path('update_division_log/', update_division_log, name='update_division_log')
]