from django.urls import path
from .view.author_view import *
from .view.display_view import *
from .view.pacd_transactions import *
from .view.pacd_dashboard import *
from .view.unit_transactions import *
from .view.unit_dashboard import *
from .view.actions import *
from .view.notifications import *
from .view.viewdata import *
from .view.graph import *

urlpatterns = [
    path('', login_view, name="logins"), 

    path('display/', display_view, name="display-page"),
    path('ticket/<int:client_id>/', ticket_view, name="client_ticket"),
    path('clients/', client_details, name="client-page"),
    path('que-view/', que_view, name="que-view"),
    path('serving-client', serving_client, name="serving-client"),

    path('account/', add_account, name="account"),
    path('user-type/', user_type, name="user-type"),
    path('login/', login_view, name="login"),
    path('logout/', logout_view, name ="logout"),
    

    path('unit-transactions', unit_transactions, name="unit-transactions"),
    path('unit-dashboard', unit_dashboard, name="unit-dashboard"),
    path('unit-pending/', unit_pending, name="unit-pending"),
    path('transaction-history-unit/', transaction_history_all_unit, name="transaction-history-unit"),
    path('unit-resolved/', unit_resolved_client, name="unit-resolved"),
    
    path('pacd-transactions/', pacd_transactions, name="pacd-transactions"),
    path('pending_clients/', pending_clients, name='pending_clients'),
    path('transaction-history/', transaction_history, name="transaction-history"),

    path('pacd-dashboard/', pacd_dashboard, name="pacd-dashboard"),
    path('transaction-history-all/', transaction_history_all, name="transaction-history-all"),
    path('total-counts', total_counts, name='total-counts'),


    path('forwarded-client-to-unit/', forwarded_client_to_unit, name='forwarded-client-to-unit'),
    path('skipped-client/', skipped_client, name='skipped-client'),
    path('skipped-client-unit', skipped_client_unit, name='skipped-client-unit'),
    
    path('notifications-pacd/', notifications_pacd, name='notifications-pacd'),
    path('notifications-unit/', notifications_unit, name="notifications-unit"),
    path('count-type-transaction/', count_type_transaction, name="count-type-transaction"),
    path('count-type-transactio-unit/', count_type_transaction_unit, name="count-type-transaction-unit"),

    path('update-details', update_user_details, name='update-details'),

    path('account/<int:id>/', get_account, name='get-account'),
    path('pacd-dashboard/<int:id>/', get_client, name="get-client"),
    path('unit-dashboard/<int:id>/', get_client, name="get-client-unit"),

    path('update-client-status-served/', update_client_status_served, name='update-client-status-served'), # // served by PACD resolved
    path('update-client-status-served-unit/', update_client_status_served_unit, name='update-client-status-served-unit'), # // served by unit resolved

    path('get-daily-data/', get_daily_data, name='get-daily-data'),
    path('get-monthly-data', get_monthly_data, name='get-monthly-data'),
    path('get-daily-data-unit/', get_daily_data_unit, name='get-daily-data-unit'),
    path('get-monthly-data-unit/', get_monthly_data_unit, name='get-monthly-data-unit'),
    


    path('reports', reports_page, name='reports'),
    path('accountList', accountList, name="accountList"),
]