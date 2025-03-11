from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import datetime

class Book(models.Model):
    title = models.CharField(max_length=100)
    author = models.CharField(max_length=100)
    published_date = models.DateField()

    def __str__(self):
        return self.title
    
class PacdUser(models.Model):
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    created_date = models.DateField()

    def __str__(self):
        return self.username
    
class ClientDetails(models.Model):
    client_id = models.CharField(max_length=100)
    client_fullname = models.CharField(max_length=100)
    client_queue_no = models.CharField(max_length=100)
    client_lane_type = models.CharField(max_length=100)
    client_transaction_type = models.CharField(max_length=100)
    client_status = models.CharField(max_length=100)
    created_date = models.DateField()

    def __str__(self):
        return self.client_id
    
    @staticmethod
    def reset_queue():
        today = datetime.now().date()
        ClientDetails.objects.filter(created_date=today).update(client_queue_no="1")

@receiver(post_save, sender=ClientDetails)
def reset_queue(sender, instance, **kwargs):
    if instance.created_date == datetime.now().date():
        instance.reset_queue()
# Create your models here.
