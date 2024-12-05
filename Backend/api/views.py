from datetime import datetime
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from django.core.exceptions import MultipleObjectsReturned
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import Project, Task, Profile
from django.shortcuts import get_object_or_404

# Create your views here.


class Signup(APIView):
    authentication_classes = []  
    permission_classes = [AllowAny]  

    def post(self, request):
        data = request.data

        first_name = data.get('first_name')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        required_fields = ['first_name', 'password', 'confirm_password']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return Response(
                {'error': f"Missing fields: {', '.join(missing_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if password != confirm_password:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=first_name).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the user
        try:
            if email:
                user = User.objects.create_user(
                    username=email,
                    password=password,
                    first_name=first_name,
                    email=email
                )
            else:
                user = User.objects.create_user(
                    username=first_name,
                    password=password,
                    first_name=first_name
                )
        except Exception as e:
            return Response({'error': f'Error creating user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
        return Response({'message': 'Account created successfully'}, status=status.HTTP_201_CREATED)
        
            
class SignInView(APIView):
    authentication_classes = []  
    permission_classes = [AllowAny]  

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'message': 'Please provide both phone number and password.'}, status=status.HTTP_400_BAD_REQUEST)

        user_profile = User.objects.filter(email=email).first()
        if user_profile is None:
            return Response({'message': 'Email not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            user = user_profile  

            if user.check_password(password):
                token, created = Token.objects.get_or_create(user=user)

                return Response({
                    'token': token.key, 
                    'message': 'Login successful!'
                }, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Invalid password.'}, status=status.HTTP_401_UNAUTHORIZED)

        except Exception as e:
            return Response({'message': 'An error occurred: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class TokenValidationView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        return Response({'message': 'Token is valid.'}, status=status.HTTP_200_OK)
    
    
    
#################Project views#################


class CreateProject(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
      
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        
        title = request.data.get('title')
        if not title:
            return Response({"error": "Project title is required"}, status=status.HTTP_400_BAD_REQUEST)
        
       
        project = Project.objects.create(
            created_by=user,
            title=title,
            created_date=datetime.now()
        )
        
        return Response({
            "id": project.id,
            "title": project.title,
            "created_date": project.created_date,
            "created_by": project.created_by.username
        }, status=status.HTTP_201_CREATED)
        
class ProjectListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        
        projects = Project.objects.filter(created_by=user)

        project_list = [
            {
                "id": project.id,
                "title": project.title,
                "created_date": project.created_date,
                "isDeleted": project.isDeleted
            }
            for project in projects
        ]
        
        return Response(project_list, status=status.HTTP_200_OK)
    
class ProjectDeleteView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def delete(self, request, project_id):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        
        project = get_object_or_404(Project, id=project_id, created_by=user)
        
        project.isDeleted=True
        project.save()
        
        
        # project.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ProjectRestoreView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def delete(self, request, project_id):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        
        project = get_object_or_404(Project, id=project_id, created_by=user)
        
        project.isDeleted=False
        project.save()
        
        
        # project.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ProjectActualDeleteView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def delete(self, request, project_id):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        
        project = get_object_or_404(Project, id=project_id, created_by=user)
        
        
        project.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# ================Detail page view================
    
class ProjectDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]    
    
    def get(self, request, project_id):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
        
        project = get_object_or_404(Project, id=project_id, created_by=user)

        tasks = Task.objects.filter(report = project, isDeleted=False)

        task_data = []
        for task in tasks:
            task_data.append({
                "id": task.id,
                "description": task.description,
                "status": task.status,
                "created_date": task.created_date,
                "last_updated_on": task.last_updated_on
            })
            
        deleted_tasks = Task.objects.filter(report = project, isDeleted=True)
        deleted_task_data = []
        for task in deleted_tasks:
            deleted_task_data.append({
                "id": task.id,
                "description": task.description,
                "status": task.status,
                "created_date": task.created_date,
                "last_updated_on": task.last_updated_on
            })

        response_data = {
            "id": project.id,
            "title": project.title,
            "created_date": project.created_date,
            "tasks": task_data,
            "deleted_task": deleted_task_data
        }

        return Response(response_data, status=200)
    
class AddTaskView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]
    def post(self, request, project_id):
        
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        project = get_object_or_404(Project, id=project_id, created_by=user)

        task_description = request.data.get("description")

        if not task_description:
            return Response({"error": "Task description is required"}, status=400)

      
        task = Task.objects.create(
            report=project,
            description=task_description,
            status="not_done",  
            created_date=datetime.now(),  
            last_updated_on=datetime.now(),  
        )

        return Response({
            "id": task.id,
            "description": task.description,
            "status": task.status,
            "created_date": task.created_date,
            "last_updated_on": task.last_updated_on,
        }, status=201)
        
class UpdateTaskStatusView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]
    
    def patch(self, request, task_id):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        task = get_object_or_404(Task, id=task_id)

        if task.report.created_by != user:
            return Response({"error": "Permission denied"}, status=403)

        task.last_updated_on = datetime.now() 
        task.status = 'done' if task.status == 'not_done' else 'not_done'
        task.save()

        return Response({
            "id": task.id,
            "description": task.description,
            "status": task.status,
            "last_updated_on": task.last_updated_on,  
        })
        
class UpdateTaskDescriptionView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, task_id):
        
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found."}, status=404)

        
        if task.report.created_by != request.user:
            return Response({"detail": "You do not have permission to edit this task."}, status=403)

        
        new_description = request.data.get("description", None)

        if new_description:
            task.description = new_description

        
        task.last_updated_on = datetime.now()
        task.save()

        
        response_data = {
            "id": task.id,
            "description": task.description,
            "status": task.status,
            "last_updated_on": task.last_updated_on.isoformat(),
        }

        return Response(response_data, status=200)
    
class get_pac(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self,request):
        user = request.user
        
        try:
            
            profile = Profile.objects.get(user=user)
            git_pac = profile.git_pac if profile.git_pac else ""
        except Profile.DoesNotExist:
            git_pac = ""
            
        return Response({'git_pac': git_pac})
    

class UpdateProjectTitleView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, project_id):
        try:
            
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"detail": "Project not found."}, status=404)

        if project.created_by != request.user:
            return Response({"detail": "You do not have permission to edit this project."}, status=403)

        new_title = request.data.get("title", None)

        if not new_title:
            return Response({"detail": "Title cannot be empty."}, status=400)

        project.title = new_title
        project.last_updated_on = datetime.now()
        project.save()

        response_data = {
            "id": project.id,
            "title": project.title,
            "last_updated_on": project.last_updated_on.isoformat(),
        }

        return Response(response_data, status=200)
    
class DeleteTaskView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found."}, status=404)

        if task.report.created_by != request.user:
            return Response({"detail": "You do not have permission to delete this task."}, status=403)

        task.isDeleted=True
        task.save()

        # task.delete()
        return Response({"detail": "Task deleted successfully."}, status=204)
    
class RestoreTaskView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found."}, status=404)

        if task.report.created_by != request.user:
            return Response({"detail": "You do not have permission to delete this task."}, status=403)

        task.isDeleted=False
        task.save()

        # task.delete()
        return Response({"detail": "Task deleted successfully."}, status=204)
    
class DeleteActualTaskView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"detail": "Task not found."}, status=404)

        if task.report.created_by != request.user:
            return Response({"detail": "You do not have permission to delete this task."}, status=403)


        task.delete()
        return Response({"detail": "Task deleted successfully."}, status=204)
    
    
# ===========Profile==================    
    
class UserProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            
            profile = Profile.objects.get(user=user)
            git_pac = profile.git_pac if profile.git_pac else ""
        except Profile.DoesNotExist:
            git_pac = ""

        return Response({
            "username": user.first_name,
            "git_pac": git_pac
        }, status=200)
        
    def put(self, request):
        """Handle PUT request to update git_pac."""
        user = request.user
        git_pac = request.data.get("git_pac", "").strip()
        
        if git_pac is None:
            return Response({"error": "Git PAC value is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile, created = Profile.objects.get_or_create(user=user)
            profile.git_pac = git_pac
            profile.save()
            return Response({
                "message": "Git PAC updated successfully",
                "git_pac": profile.git_pac
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to update Git PAC: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)