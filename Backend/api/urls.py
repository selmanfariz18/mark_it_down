from django.urls import path
from api import views

urlpatterns = [
    path('signup/', views.Signup.as_view(), name='Signup'),
    path('signin/', views.SignInView.as_view(), name='signin'),
    path('create_project/', views.CreateProject.as_view(), name='create_project'),
]