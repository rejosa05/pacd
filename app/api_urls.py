from django.urls import path
from .views_ import user_management as views # User Management
   

urlpatterns  = [   
    path('api/users/', views.list_users, name='api_list_users'),
    path('api/options/', views.list_options, name='api_list_options'),
    path('api/users/add/', views.add_user, name='api_add_user'),
    path('api/users/<int:profile_id>/', views.get_user, name='api_get_user'),
    path('api/users/<int:profile_id>/edit/', views.edit_user, name='api_edit_user'),
    path('api/users/<int:profile_id>/toggle-status/', views.toggle_status, name='api_toggle_status'),
    path('api/users/<int:profile_id>/delete/', views.delete_user, name='api_delete_user'),

]
