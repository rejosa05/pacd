from django.urls import path
from . import views
from .view.author_view import login_view, logout_view
from .view.display_view import display_view, ticket_view, client_details, que_view
from .view.dashboard_view import user_type, pacd_unit_dashboard

urlpatterns = [
    path('', login_view, name="logins"),

    path('display/', display_view, name="display-page"),
    path('ticket/<int:client_id>/', ticket_view, name="client_ticket"),
    path('client-details/', client_details, name="client_page"),
    path('que-view/', que_view, name="que-view"),

    
    path('unit_dashboards/', views.unit_dashboard1, name="unit_dashboards"),
    path('pacd_dashboard/', views.pacd_dashboard1, name="pacd_dashboard"),
    
    path('user-type/', user_type, name="user-type"),
    path('login/', login_view, name="login"),
    path('logout/', logout_view, name ="logout"),
    
    path('account/', views.add_account, name="account"),
    path('update_division_log/', views.update_division_log, name='update_division_log'),
    path('resolved_clients/', views.resolved_clients, name='resolved_clients'),
    path('pending_clients/', views.pending_clients, name='pending_clients'),
    path('update_client_status_served/', views.update_client_status_served, name='update_client_status_served'),
    path('update_client_status_forwarded/', views.update_client_status_forwarded, name='update_client_status_forwarded'),
    path('unit_dashboard', views.unit_dashboard, name="unit_dashboard"),
    path('pacd_unit_dashboard', pacd_unit_dashboard, name="pacd_unit_dashboard"),
    path('fetch_all_resolved_client/', views.fetch_all_resolved_client, name="fetch_all_resolved_client"),
    path('fetch_all_resolved_client_unit', views.fetch_all_resolved_client_unit, name="fetch_all_resolved_client_unit"),
    path('reports_pacd', views.reports_pacd, name='reports_pacd'),
    path('transactionsTotal', views.transactionsTotal, name="transactionsTotal"),
    path('accountList', views.accountList, name="accountList"),
    path('save_update_forwarded_client', views.save_update_forwarded_client, name="save_update_forwarded_client"),
]