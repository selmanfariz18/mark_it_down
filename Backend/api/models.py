from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Project(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports")
    title = models.CharField(max_length=255)
    isDeleted = models.BooleanField(default=False)
    created_date = models.DateTimeField()    

    def __str__(self):
        return self.title

class Task(models.Model):
    report = models.ForeignKey(Project, related_name='projects', on_delete=models.CASCADE)
    description = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=25, choices=(('done','done'), ('not_done','not_done')), default='not_done')
    created_date = models.DateTimeField()
    last_updated_on = models.DateTimeField()
    isDeleted = models.BooleanField(default=False)

    def __str__(self):
        return self.description
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    git_pac = models.CharField(max_length=255, blank=True, null=True)
    
