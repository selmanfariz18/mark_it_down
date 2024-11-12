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
        phone_number = request.data.get('phone_number')
        password = request.data.get('password')

        if not phone_number or not password:
            return Response({'message': 'Please provide both phone number and password.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the UserProfile exists for the given phone_number
        user_profile = UserProfile.objects.filter(phone_number=phone_number).first()
        if user_profile is None:
            return Response({'message': 'Phone number not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            user = user_profile.user  # Get the associated User

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