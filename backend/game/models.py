from django.db import models

class Player(models.Model):
  username=models.CharField(max_length=100)
  flips_quantity=models.IntegerField()
  used_time=models.IntegerField()
  date=models.DateTimeField()
  has_completed=models.BooleanField()
