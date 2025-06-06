from django.urls import path
from . import views
from .view.author_view import *
from .view.display_view import *
from .view.pacd_dashboard_view import *
from .view.unit_dashboard_view import *
from .view.actions import *
from .view.notifications import *
from .view.viewdata import *

urlpatterns = [
    path('', login_view, name="logins"),

    path('display/', display_view, name="display-page"),
    path('ticket/<int:client_id>/', ticket_view, name="client_ticket"),
    path('clients/', client_details, name="client-page"),
    path('que-view/', que_view, name="que-view"),
    
    path('account/', add_account, name="account"),
    path('user-type/', user_type, name="user-type"),
    path('login/', login_view, name="login"),
    path('logout/', logout_view, name ="logout"),
    

    path('unit-dashboard', unit_dashboard, name="unit-dashboard"),
    path('unit-pending/', unit_pending, name="unit-pending"),
    path('unit-resolved/', unit_resolved_client, name="unit-resolved"),
    
    path('pacd-dashboard/', pacd_dashboard, name="pacd-dashboard"),
    path('pending_clients/', pending_clients, name='pending_clients'),
    path('forwarded-clients/', forwarded_clients, name="forwarded-client"),
    path('resolved-client/', resolved_client, name="resolved-client"),


    path('pacd-resolved-client/', pacd_resolved_client, name='pacd-resolved-client'),
    path('forwarded-client-to-unit/', forwarded_client_to_unit, name='forwarded-client-to-unit'),
    path('skipped-client/', skipped_client, name='skipped-client'),
    path('skipped-client-unit', skipped_client_unit, name='skipped-client-unit'),
    
    path('notifications-pacd/', notifications_pacd, name='notifications-pacd'),
    path('notifications-unit/', notifications_unit, name="notifications-unit"),
    path('count-type-transaction/', count_type_transaction, name="count-type-transaction"),

    path('update-details', update_user_details, name='update-details'),

    path('account/<int:id>/', get_account, name='get-account'),
    path('pacd-dashboard/<int:id>/', get_client, name="get-client"),

    path('update_client_status_served/', update_client_status_served, name='update_client_status_served'),


    path('reports', reports_page, name='reports'),
    path('transactionsTotal', views.transactionsTotal, name="transactionsTotal"),
    path('accountList', views.accountList, name="accountList"),
    path('save_update_forwarded_client', views.save_update_forwarded_client, name="save_update_forwarded_client"),
]