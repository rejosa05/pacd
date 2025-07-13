from django.urls import path
from .view.routing import *
from .view.display_view import *
from .view.transactions import *
from .view.dashboard import *
from .view.actions import *
from .view.notifications import *
from .view.viewdata import *
from .view.graph import *
from .view.account import *

urlpatterns = [
    path('', login_view, name="logins"), 

    path('display/', display_view, name="display-page"),
    path('ticket/<int:client_id>/', ticket_view, name="client_ticket"),
    path('clients/', client_details, name="client-page"),
    path('que-view/', que_view, name="que-view"),
    path('serving-client', serving_client, name="serving-client"),

    path('login/', login_view, name="login"),
    path('logout/', logout_view, name ="logout"),
    
    
    path('f_transactions/', f_transactions, name='f_transactions'),
    path('f_dashboard', f_dashboard, name='f_dashboard'),
    path('transaction-history/', transaction_history, name="transaction-history"),


    path('forwarded-client-to-unit/', forwarded_client_to_unit, name='forwarded-client-to-unit'),
    path('skipped-client/', skipped_client, name='skipped-client'),
    path('skipped-client-unit', skipped_client_unit, name='skipped-client-unit'),
    
    path('notifications-pacd/', notifications_pacd, name='notifications-pacd'),
    path('notifications-unit/', notifications_unit, name="notifications-unit"),
    path('count-type-transaction/', count_type_transaction, name="count-type-transaction"),
    path('count-type-transactio-unit/', count_type_transaction_unit, name="count-type-transaction-unit"),

    path('update-details', update_user_details, name='update-details'),

    path('account/<int:id>/', get_account, name='get-account'),
    path('dashboard/<int:id>/', get_client, name="get-client"),
    path('unit-dashboard/<int:id>/', get_client, name="get-client-unit"),

    path('update-client-status-served/', update_client_status_served, name='update-client-status-served'), # // served by PACD resolved
    path('update-client-status-served-unit/', update_client_status_served_unit, name='update-client-status-served-unit'), # // served by unit resolved

    path('get-daily-data/', get_daily_data, name='get-daily-data'),
    path('get-monthly-data', get_monthly_data, name='get-monthly-data'),
    path('get-type-data/', get_type_data, name='get-type-data'),
    
    # path('get-monthly-data-unit/', get_monthly_data_unit, name='get-monthly-data-unit'),
    

    path('reports', reports_page, name='reports'),
    path('accountList', accountList, name="accountList"),
    path('transactions', transaction, name="transactions"),
    path('dashboard', dashboard, name="dashboard"),
    path('account', accounts, name="account"),
    path('services', services_page, name="services"),
]