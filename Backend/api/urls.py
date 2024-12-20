from django.urls import path
from api import views

urlpatterns = [
    path('signup/', views.Signup.as_view(), name='signup'),
    path('signin/', views.SignInView.as_view(), name='signin'),
    path('profile/', views.UserProfileView.as_view(), name='profile_api'),
    path('get_pac/', views.get_pac.as_view(), name='get_pac'),
    path('create_project/', views.CreateProject.as_view(), name='create_project'),
    path('projects/',views.ProjectListView.as_view(),name='project-list'),
    path('projects/<int:project_id>/update_title/', views.UpdateProjectTitleView.as_view(), name='update_project_title'),
    path('projects/<int:project_id>/', views.ProjectDetailView.as_view(), name='project_detail'),
    path('projects/<int:project_id>/add_task/', views.AddTaskView.as_view(), name='add_task'),
    path('projects/<int:project_id>/delete/', views.ProjectDeleteView.as_view(), name='project_delete'),
    path('projects/<int:project_id>/restore/', views.ProjectRestoreView.as_view(), name='project_restore'),
    path('projects/<int:project_id>/actual_delete/', views.ProjectActualDeleteView.as_view(), name='project_actual_delete'),
    path('tasks/<int:task_id>/delete/', views.DeleteTaskView.as_view(), name='delete-task'),
    path('tasks/<int:task_id>/restore/', views.RestoreTaskView.as_view(), name='restore-task'),
    path('tasks/<int:task_id>/update_status/', views.UpdateTaskStatusView.as_view(), name='update_task_status'),
    path('tasks/<int:task_id>/update_description/', views.UpdateTaskDescriptionView.as_view(), name='update_task_description'),
    path('tasks/<int:task_id>/actual_delete/', views.DeleteActualTaskView.as_view(), name='delete-actual-task'),
]