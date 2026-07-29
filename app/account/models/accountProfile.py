from django.db import models
from django.contrib.auth.models import User


# class Unit(models.Model):
#     STATUS_CHOICES = [('Active', 'Active'), ('Inactive', 'Inactive')]

#     unit_name = models.CharField(max_length=100, unique=True)
#     unit_code = models.CharField(max_length=20, unique=True, blank=True, null=True)
#     description = models.CharField(max_length=255, blank=True, null=True)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.unit_name


# class Division(models.Model):
#     namee = models.CharField(max_length=100, unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name


# class Position(models.Model):
#     name = models.CharField(max_length=100, unique=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name


class AccountProfile(models.Model):
    """
    Extension sa Django's built-in auth.User. Ang username, email, ug
    password sa user kay naa sa auth_user table (Django default) —
    dinhi ra naka-store ang PACD-specific info: position, division,
    unit, ug status.
    """
    # STATUS_CHOICES = [('Active', 'Active'), ('Inactive', 'Inactive')]

    # user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account_profile')
    # position = models.ForeignKey(Position, on_delete=models.SET_NULL, blank=True, null=True, related_name='profiles')
    # division = models.ForeignKey(Division, on_delete=models.SET_NULL, blank=True, null=True, related_name='profiles')
    # unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, blank=True, null=True, related_name='profiles')
    # contact_number = models.CharField(max_length=20, blank=True, null=True)
    # status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')
    first_name = models.CharField(max_length=20, blank=True, null=True)
    last_name = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.status}"