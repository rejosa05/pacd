from django.urls import path
from . import views
from .view.author_view import *
from .view.display_view import display_view, ticket_view, client_details, que_view
from .view.pacd_dashboard_view import forwarded_clients, pending_clients, resolved_client
from .view.unit_dashboard_view import *
from .view.actions import *
from .view.notifications import *
from django.contrib.auth import views as auth_views

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
    
    path('notifications-pacd/', notifications_pacd, name='notifications-pacd'),
    path('notifications-unit/', notifications_unit, name="notifications-unit"),

    path('update_client_status_served/', views.update_client_status_served, name='update_client_status_served'),


    path('reports', reports_page, name='reports'),
    path('transactionsTotal', views.transactionsTotal, name="transactionsTotal"),
    path('accountList', views.accountList, name="accountList"),
    path('save_update_forwarded_client', views.save_update_forwarded_client, name="save_update_forwarded_client"),
]