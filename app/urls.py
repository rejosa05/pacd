from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name="logins"),
    path('display-all/', views.display, name="display_page"),
    path('unit_dashboards/', views.unit_dashboard1, name="unit_dashboards"),
    path('pacd_dashboard/', views.pacd_dashboard1, name="pacd_dashboard"),
    path('dashboard/', views.pacd_dashboard, name="dashboard"),
    path('dashboards/', views.dashboard, name="dashboards"),
    path('login/', views.login_view, name="login"),
    path('logout/', views.logout_view, name ="logout"),
    path('client-details/', views.client_details, name="client_page"),
    path('account/', views.create_authorized_personnel, name="account"),
    path('ticket/<int:client_id>/', views.client_ticket, name="client_ticket"),
    path('update_division_log/', views.update_division_log, name='update_division_log'),
    path('resolved_clients/', views.resolved_clients, name='resolved_clients'),
    path('pending_clients/', views.pending_clients, name='pending_clients'),
    path('update_client_status_served/', views.update_client_status_served, name='update_client_status_served'),
    path('update_client_status_forwarded/', views.update_client_status_forwarded, name='update_client_status_forwarded'),
    path('unit_dashboard', views.unit_dashboard, name="unit_dashboard"),
    path('pacd_unit_dashboard', views.pacd_unit_dashboard, name="pacd_unit_dashboard"),
    path('fetch_all_resolved_client/', views.fetch_all_resolved_client, name="fetch_all_resolved_client"),
    path('fetch_all_resolved_client_unit', views.fetch_all_resolved_client_unit, name="fetch_all_resolved_client_unit"),
    path('reports_pacd', views.reports_pacd, name='reports_pacd'),
    path('transactionsTotal', views.transactionsTotal, name="transactionsTotal")
]