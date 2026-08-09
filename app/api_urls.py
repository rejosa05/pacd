from django.urls import path
from .views_ import user_management, client_transactions, que_display
   

urlpatterns  = [   
    path('api/users/', user_management.list_users, name='api_list_users'),
    path('api/options/', user_management.list_options, name='api_list_options'),
    path('api/users/add/', user_management.add_user, name='api_add_user'),
    path('api/users/<int:profile_id>/', user_management.get_user, name='api_get_user'),
    path('api/users/<int:profile_id>/edit/', user_management.edit_user, name='api_edit_user'),
    path('api/users/<int:profile_id>/toggle-status/', user_management.toggle_status, name='api_toggle_status'),
    path('api/users/<int:profile_id>/delete/', user_management.delete_user, name='api_delete_user'),


]
