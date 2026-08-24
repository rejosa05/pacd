from django.urls import path


from .views_ import client_transactions, user_management, client_kiosk, que_display, dashboard, loginViews

urlpatterns = [

    path('client_transactions', client_transactions.client_transaction_page, name="client_transactions"),
    path('user_management', user_management.user_management_page, name='user_management'),

    
    path('client_kiosk', client_kiosk.client_register_page, name='client_kiosk'),
    path('client_kiosk/register/', client_kiosk.register_client, name='client_kiosk_register'),

    path("display", que_display.que_display_page , name="display"),
    path("api/display-queue/", que_display.display_queue_api , name="display_queue_api"),
    path("api/clients-list/", client_transactions.clients_list_api, name="clients_list_api"),
    path("api/client/<int:client_id>",client_transactions.get_client, name="api_get_client"),
    path('api/client/<int:client_id>/update/', client_transactions.update_client, name='update_client'),
    path('api/client/<int:client_id>/serve/', client_transactions.serve_client, name='serve_client'), #admin 
    path('api/client/<int:client_id>/forward/', client_transactions.forward_client, name='forward_client'),
    path('api/client/<int:client_id>/serving/', client_transactions.serving_client, name='serving_client'),
    path('api/client/<int:client_id>/skip/', client_transactions.skip_client, name='skip_client'),

    path('api/divisions/', client_transactions.divisions_api, name='divisions_api'),
    path('api/units/', client_transactions.units_api, name='units_api'),
    path( "api/services/available/", client_transactions.available_services_api, name="available_services_api"),

    path('dashboard', dashboard.dashboard_page, name='dashboard'),
    path('', loginViews.login_page, name='index')
]