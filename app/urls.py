from django.urls import path


from .views_ import client_transactions, user_management, client_kiosk, que_display

urlpatterns = [

    path('client_transactions', client_transactions.client_transaction_page, name="client_transactions"),
    path('user_management', user_management.user_management_page, name='user_management'),

    
    path('client_kiosk', client_kiosk.client_register_page, name='client_kiosk'),
    path('client_kiosk/register/', client_kiosk.register_client, name='client_kiosk_register'),
    
    path("api/display-queue/", que_display.display_queue_api , name="display_queue_api"),
    path("api/clients-list/", client_transactions.clients_list_api, name="clients_list_api"),
]