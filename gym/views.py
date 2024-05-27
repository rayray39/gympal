from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

import json

from .models import User, Star, Booking, Review

# Create your views here.

def index(request):
    # main page for the client
    return render(request, "gym/index.html")

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            # log the user in to create a session for them
            login(request, user)    
            # depending on user_type, render different pages
            if user.user_type == "client" :
                return HttpResponseRedirect(reverse("index"))
            elif user.user_type == "trainer":
                return HttpResponseRedirect(reverse("trainer_page"))
        else:
            # only if the user is not authenticated (user == None), then the message gets pass as the context
            return render(request, "gym/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "gym/login.html")


def logout_view(request):
    logout(request)     # delete session data associated with the user
    return render(request, "gym/logout.html", {
        "message": "You have been successfully logged out."
    })


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        user_type = request.POST["user_type"]
        if user_type == "client" :
            years_of_exp = None
            desc = None
            hourly_rate = None
        else :
            years_of_exp = request.POST["years_of_exp"]
            desc = request.POST["desc"]
            hourly_rate = request.POST["hourly_rate"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:    
            return render(request, "gym/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username=username, email=email, password=password, user_type=user_type, years_of_exp=years_of_exp, desc=desc, hourly_rate=hourly_rate)
            user.save()
        except IntegrityError:
            # only checks is username is taken
            return render(request, "gym/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        if user_type == "client" :
            return HttpResponseRedirect(reverse("index"))
        elif user_type == "trainer" :
            return HttpResponseRedirect(reverse("trainer_page"))
    else:
        return render(request, "gym/register.html")

# markeplace feature
def get_users(request, desired_type) :
    if desired_type == "all" :
        users = User.objects.all()
    elif desired_type == "client" :
        users = User.objects.filter(user_type=desired_type)
    elif desired_type == "trainer" :
        users = User.objects.filter(user_type=desired_type)
    else: 
        return JsonResponse({"error": "Type of User required"}, status=400)
    return JsonResponse([user.serialize() for user in users], safe=False)

# filter feature
def get_trainers_with_desc(desc_list) :
    filtered_trainers = []
    all_trainers = User.objects.filter(user_type="trainer")     # get all the trainers
    for trainer in all_trainers :               # loop through all the trainers
        for desc_attribute in desc_list :       # loop through all the attributes
            if desc_attribute in trainer.desc :     # if the trainer's desc contain any one of the desired desc attributes
                filtered_trainers.append(trainer)
                break
    return filtered_trainers

@csrf_exempt
def filter_trainers(request) :
    # load the data that is POSTed from the JS function
    data = json.loads(request.body)
    years_of_exp_input = data.get('desired_years_of_exp', '')
    desc_input = data.get('desired_desc', '')   

    # 1. exp empty
    # 2. desc empty
    # 3. both empty
    # 4. both NOT empty

    if desc_input == '' and years_of_exp_input == '' :
        get_users(request, "trainer")
    else :
        filtered_trainers = []
        if desc_input != '' and years_of_exp_input != '' :
            desired_desc = desc_input.strip()     # get rid of any leading and trailing whitespaces
            desired_desc_list = desired_desc.split(", ")    # list containing all the description attributes

            # get the trainers that fit the description criteria
            filtered_trainers = get_trainers_with_desc(desired_desc_list)       # filtered based on description first
            # of all the filtered trainers based on description, filter those that meet the year requirement
            filtered_trainers = [trainer for trainer in filtered_trainers if trainer.years_of_exp == years_of_exp_input]
            filtered_trainers = User.objects.filter(pk__in=[trainer.id for trainer in filtered_trainers])
        elif years_of_exp_input == '' :
            # years_of_exp filter is left blank
            desired_desc = desc_input.strip()     # get rid of any leading and trailing whitespaces
            desired_desc_list = desired_desc.split(", ")    # list containing all the description attributes
            filtered_trainers = get_trainers_with_desc(desired_desc_list)
            filtered_trainers = User.objects.filter(pk__in=[trainer.id for trainer in filtered_trainers])
        elif desc_input == '':
            # description filter is left blank
            filtered_trainers = User.objects.filter(user_type="trainer", years_of_exp=years_of_exp_input)
        return JsonResponse([trainer.serialize() for trainer in filtered_trainers], safe=False)
            
# starred feature
@csrf_exempt
def add_trainer_to_starred(request) :
    # add this trainer to the star page of the current user, by creating a new Star object
    data = json.loads(request.body)
    trainer_username = data.get("trainer_username")       # get the trainer from the JS function
    if trainer_username == '' or trainer_username == None :
        return JsonResponse({"error": "Trainer required"}, status=400)
    trainer = User.objects.get(username=trainer_username, user_type="trainer")
    star = Star(client=request.user, trainer=trainer)
    star.save()
    return JsonResponse({"message": f"Star object - client: {request.user.username}, trainer: {trainer_username} successfully created"}, status=200)

def get_starred_trainers(request) :
    # get the trainers inside the current user's starred page
    star_entries = Star.objects.filter(client=request.user)
    trainer_entries = []
    for entry in star_entries :
        trainer_entries.append(entry.trainer)
    starred = User.objects.filter(pk__in=[trainer.id for trainer in trainer_entries])
    return JsonResponse([starred_trainer.serialize() for starred_trainer in starred], safe=False)

@csrf_exempt
def remove_trainer_from_starred(request) :
    data = json.loads(request.body)
    trainer_username = data.get("trainer_username")
    if trainer_username == '' or trainer_username == None :
        return JsonResponse({"error": "Trainer required"}, status=400)
    trainer = User.objects.get(username=trainer_username, user_type="trainer")
    starred = Star.objects.get(client=request.user, trainer=trainer)
    starred.delete()
    return JsonResponse({"message": f"Star object - client: {request.user.username}, trainer: {trainer_username} successfully deleted"}, status=200)

def check_starred(request, trainer_username) :
    # check if the current user has already starred this trainer
    if trainer_username == '' or trainer_username == None :
        return JsonResponse({"error": "Trainer required"}, status=400)
    trainer = User.objects.get(username=trainer_username, user_type="trainer")
    # check whether there exists a Star object inside the database
    already_starred = Star.objects.filter(client=request.user, trainer=trainer).exists()
    data = {"already_starred" : already_starred}
    return JsonResponse(data)
    

# booking feature
@csrf_exempt
def book_trainer(request, trainer_username) :
    # the current user will be able to book the trainer based on relevant info provided from the HTML form
    if trainer_username == "":
        return JsonResponse({"error": "Trainer required"}, status=400)
    
    # get the data POSTed from the JS function
    data = json.loads(request.body)
    datetime = data.get('booking_datetime')
    duration = data.get('booking_duration')
    location = data.get('booking_location')

    booker = request.user
    booked_trainer = User.objects.get(username=trainer_username, user_type='trainer')   # get the trainer that was booked, by the username
    # print(f"duration: {duration}")
    # print(f"hourly rate: {booked_trainer.hourly_rate}")
    total_amt = int(booked_trainer.hourly_rate) * int(duration)
    # create a new Booking object and save it to database
    booked = Booking(booker=booker, booked_trainer=booked_trainer, booked_datetime=datetime, duration=duration, gym_location=location, total_amt=total_amt)
    booked.save()
    return JsonResponse({"message": f"{trainer_username} successfully booked by {booker.username}"})

def get_all_booked(request) :
    # get all the trainers that are booked by the current user
    # return all the Booking objects that have the current user as the booker
    booked = Booking.objects.filter(booker=request.user)
    return JsonResponse([booking.serialize() for booking in booked], safe=False)

def check_booked(request, trainer_username) :
    # check if the current user already has made a booking with the trainer
    if trainer_username == '' or trainer_username == None :
        return JsonResponse({"error": "Trainer required"}, status=400)
    trainer = User.objects.get(username=trainer_username, user_type="trainer")
    already_booked = Booking.objects.filter(booker=request.user, booked_trainer=trainer).exists()
    data = {"already_booked" : already_booked}
    return JsonResponse(data)

@csrf_exempt
def remove_booking(request) :
    # remove the booking, that was booked by the current user with the trainer
    data = json.loads(request.body)
    trainer_username = data.get("trainer_username")     # trainer's username was passed from the JS to view
    if trainer_username == '' or trainer_username == None :
        return JsonResponse({"error": "Trainer required"}, status=400)
    booker = request.user
    booked_trainer = User.objects.get(username=trainer_username, user_type="trainer")
    booking = Booking.objects.filter(booker=booker, booked_trainer=booked_trainer)
    booking.delete()    # delete the Booking object
    return JsonResponse({"message": f"booking between trainer: ${trainer_username} and client: ${request.user.username} is successfully cancelled"})

# review feature
def get_reviews(request, trainer_username) :
    # get all the reviews that were made on this trainer's profile
    if trainer_username == '' or trainer_username == None :
        return JsonResponse({"error": "Trainer required"}, status=400)
    trainer = User.objects.get(username=trainer_username, user_type="trainer")
    reviews = Review.objects.filter(trainer_profile=trainer)    # get all the reviews that were made on this trainer's profile
    return JsonResponse([review.serialize() for review in reviews], safe=False)

@csrf_exempt
def create_review(request, trainer_username) :
    # create a new Review object based on the review form that the current user filled on this trainer's profile page
    if trainer_username == '' or trainer_username == None :
        return JsonResponse({"error": "Trainer required"}, status=400)
    data = json.loads(request.body)
    content = data.get("content")   # get the content from the form 
    trainer = User.objects.get(username=trainer_username, user_type="trainer")
    reviewer = request.user

    review = Review(content=content, reviewer=reviewer, trainer_profile=trainer)
    review.save()

    data = {"client": reviewer}
    return JsonResponse(data)


# trainer's main page (unconfirmed bookings feature)
def trainer_page(request) :
    # main page for the trainer
    return render(request, "gym/trainer_page.html")

def get_unconfirmed_bookings(request) :
    # get all the bookings requested by the client made to the trainer
    # get the Booking objects where the booked_trainer = trainer
    trainer_username = request.user.username
    if trainer_username == '' or trainer_username == None :
        return JsonResponse({"error": "Trainer required"}, status=400)
    trainer = User.objects.get(username=trainer_username, user_type='trainer')
    bookings = Booking.objects.filter(booked_trainer=trainer, accepted=False)
    bookings = bookings.order_by("booked_datetime").all()
    return JsonResponse([booking.serialize() for booking in bookings], safe=False)

# trainer's profile page (for trainer accounts)
def get_trainer_profile(request):
    current_trainer = request.user
    return JsonResponse(current_trainer.serialize(), safe=False)

# edit trainer profile field feature
@csrf_exempt
def update_profile(request):
    data = json.loads(request.body)
    edited_field = data.get('edited_field')
    new_value = data.get('new_value')
    trainer = User.objects.get(username=request.user.username, user_type="trainer")
    # set the edited_field attribute of the trainer to take the new_value
    setattr(trainer, edited_field, new_value)
    trainer.save()
    return JsonResponse({"message": f"successfully updated {edited_field} of {request.user.username}"}, status=200)

# get all the accepted bookings by the trainer
def get_accepted_bookings(request) :
    # filter out the bookings where the trainer (current user) is the booked_trainer and have been accepted
    accepted_bookings = Booking.objects.filter(booked_trainer=request.user, accepted=True)
    accepted_bookings = accepted_bookings.order_by("booked_datetime").all()
    return JsonResponse([booking.serialize() for booking in accepted_bookings], safe=False)

# trainer accepts the booking from a client
@csrf_exempt
def accept_booking(request) :
    data = json.loads(request.body)
    booker_username = data.get("client_username")
    booker = User.objects.get(username=booker_username, user_type="client")

    trainer = request.user
    booking = Booking.objects.get(booker=booker, booked_trainer=trainer)    # get the booking between client and trainer
    booking.accepted = True
    booking.save()
    return JsonResponse({"message": f"Booking accepted: {booker_username} and {trainer.username}"}, status=200)

# trainer declines the booking from a client
@csrf_exempt
def decline_booking(request) :
    data = json.loads(request.body)
    booker_username = data.get("client_username")
    booker = User.objects.get(username=booker_username, user_type="client")

    trainer = request.user
    booking = Booking.objects.get(booker=booker, booked_trainer=trainer)    # get the booking between client and trainer
    booking.accepted = False    # do not delete so that the client will know that the booking is declined with some prompt
    booking.save()
    return JsonResponse({"message": f"Booking declined: {booker_username} and {trainer.username}"}, status=200)

def get_client_reviews(request) :
    # get all the client reviews for this trainer 
    trainer = request.user
    client_reviews = Review.objects.filter(trainer_profile=trainer)
    return JsonResponse([review.serialize() for review in client_reviews], safe=False)

@csrf_exempt
def create_review(request) :
    # creates a new Review object based on what the current user's review for a trainer
    data = json.loads(request.body)
    review_content = data.get("review_content")     # get content of the review
    trainer_username = data.get("trainer")
    trainer = User.objects.get(username=trainer_username, user_type="trainer")      # get the trainer
    reviewer = request.user     # get the current user

    review = Review(content=review_content, reviewer=reviewer, trainer_profile=trainer)
    review.save()
    return JsonResponse({"message": "Successfully created review"}, status=200)
