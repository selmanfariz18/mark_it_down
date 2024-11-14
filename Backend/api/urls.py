from django.urls import path
from api import views

urlpatterns = [
    path('signup/', views.Signup.as_view(), name='Signup'),
    path('signin/', views.SignInView.as_view(), name='signin'),
    path('profile/', views.UserProfileView.as_view(), name='profile_api'),
    path('get_pac/', views.get_pac.as_view(), name='get_pac'),
    path('create_project/', views.CreateProject.as_view(), name='create_project'),
    path('projects/',views.ProjectListView.as_view(),name='project-list'),
    path('projects/<int:project_id>/', views.ProjectDetailView.as_view(), name='project_detail'),
    path('projects/<int:project_id>/add_task/', views.AddTaskView.as_view(), name='add_task'),
    path('projects/<int:project_id>/delete/', views.ProjectDeleteView.as_view(), name='project_delete'),
    path('tasks/<int:task_id>/update_status/', views.UpdateTaskStatusView.as_view(), name='update_task_status'),
    path('tasks/<int:task_id>/update_description/', views.UpdateTaskDescriptionView.as_view(), name='update_task_description'),
]