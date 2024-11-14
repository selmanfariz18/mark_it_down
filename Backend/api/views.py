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
    authentication_classes = []  # No authentication required
    permission_classes = [AllowAny]  # Allow any user to access this view

    def post(self, request):
        data = request.data

        # Extract fields from the request
        first_name = data.get('first_name')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')


        # Validate required fields
        required_fields = ['first_name', 'password', 'confirm_password']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return Response(
                {'error': f"Missing fields: {', '.join(missing_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate if passwords match
        if password != confirm_password:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user with the same phone number already exists
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the user
        try:
            if email:
                user = User.objects.create_user(
                    username=first_name,
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

        # Optionally, you can return additional data such as user ID or token
        return Response({'message': 'Account created successfully'}, status=status.HTTP_201_CREATED)
        
            
class SignInView(APIView):
    authentication_classes = []  # No authentication required
    permission_classes = [AllowAny]  # Allow any user to access this view

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'message': 'Please provide both phone number and password.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the UserProfile exists for the given phone_number
        user_profile = User.objects.filter(email=email).first()
        if user_profile is None:
            return Response({'message': 'Email not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            user = user_profile  # Get the associated User

            # Authenticate the user
            if user.check_password(password):
                # Generate token or get an existing token
                token, created = Token.objects.get_or_create(user=user)

                return Response({
                    'token': token.key,  # Return the token in the response
                    'message': 'Login successful!'
                }, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Invalid password.'}, status=status.HTTP_401_UNAUTHORIZED)

        except Exception as e:
            return Response({'message': 'An error occurred: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class TokenValidationView(APIView):
    authentication_classes = [TokenAuthentication]  # Require token authentication
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        # If the request reaches this point, the token is valid
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
        
        # Return a simple response with project details
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
        
        # Fetch all projects created by the logged-in user
        projects = Project.objects.filter(created_by=user)

        # Manually create a list of project dictionaries
        project_list = [
            {
                "id": project.id,
                "title": project.title,
                "created_date": project.created_date
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

        # Get the project by ID
        project = get_object_or_404(Project, id=project_id, created_by=user)
        
        # Delete the project
        project.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
# ================Detail page view================
    
class ProjectDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]    
    
    def get(self, request, project_id):
        # Ensure the user is authenticated
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)
        
        # Get the project by ID, or return 404 if not found
        project = get_object_or_404(Project, id=project_id, created_by=user)

        # Get related tasks for this project
        tasks = Task.objects.filter(report = project)

        # Prepare the tasks data
        task_data = []
        for task in tasks:
            task_data.append({
                "id": task.id,
                "description": task.description,
                "status": task.status,
                "created_date": task.created_date,
                "last_updated_on": task.last_updated_on
            })

        # Prepare the response data
        response_data = {
            "id": project.id,
            "title": project.title,
            "created_date": project.created_date,
            "tasks": task_data
        }

        # Return the project details and tasks as JSON
        return Response(response_data, status=200)
    
class AddTaskView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]
    def post(self, request, project_id):
        # Ensure the user is authenticated
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=401)

        # Fetch the project to which we will add the task
        project = get_object_or_404(Project, id=project_id, created_by=user)

        # Get the task description from the request body
        task_description = request.data.get("description")

        if not task_description:
            return Response({"error": "Task description is required"}, status=400)

        # Create the new task
        task = Task.objects.create(
            report=project,
            description=task_description,
            status="not_done",  # The task is initially unchecked
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

        # Only the creator of the task can change its status
        if task.report.created_by != user:
            return Response({"error": "Permission denied"}, status=403)

        # Set the current datetime
        task.last_updated_on = datetime.now()  # Use datetime for both date and time
        task.status = 'done' if task.status == 'not_done' else 'not_done'
        task.save()

        return Response({
            "id": task.id,
            "description": task.description,
            "status": task.status,
            "last_updated_on": task.last_updated_on,  # Include last_updated_on in response
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
            # Get the profile associated with the user
            profile = Profile.objects.get(user=user)
            git_pac = profile.git_pac if profile.git_pac else ""
        except Profile.DoesNotExist:
            git_pac = ""
            
        return Response({'git_pac': git_pac})
    
    
# ===========Profile==================    
    
class UserProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            # Get the profile associated with the user
            profile = Profile.objects.get(user=user)
            git_pac = profile.git_pac if profile.git_pac else ""
        except Profile.DoesNotExist:
            git_pac = ""

        return Response({
            "username": user.username,
            "git_pac": git_pac
        }, status=200)
        
    def put(self, request):
        """Handle PUT request to update git_pac."""
        user = request.user
        git_pac = request.data.get("git_pac", "").strip()
        
        # Validate the input
        if git_pac is None:
            return Response({"error": "Git PAC value is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch or create the profile for the user
            profile, created = Profile.objects.get_or_create(user=user)
            profile.git_pac = git_pac
            profile.save()
            return Response({
                "message": "Git PAC updated successfully",
                "git_pac": profile.git_pac
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to update Git PAC: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)