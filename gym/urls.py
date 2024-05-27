from django.urls import path

from . import views

urlpatterns = [
    # general
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("get_users/<str:desired_type>", views.get_users, name="get_users"),    # return the queryset of a specific type of user

    # for client
    path("", views.index, name="index"),    # main page for the client

    path("filter_trainers", views.filter_trainers, name="filter_trainers"),     # filter the desired trainers based on years_of_exp and description
    
    path("add_trainer_to_starred", views.add_trainer_to_starred, name="add_trainer_to_starred"),  # add this trainer to the current user's starred page
    path("get_starred_trainers", views.get_starred_trainers, name="get_starred_trainers"),  # get all the starred trainers for this current user
    path("remove_trainer_from_starred", views.remove_trainer_from_starred, name="remove_trainer_from_starred"),  # remove this trainer from current user's starred page
    path("check_starred/<str:trainer_username>", views.check_starred, name="check_starred"),  # check if this trainer belongs to current user's starred page

    path("book_trainer/<str:trainer_username>", views.book_trainer, name="book_trainer"),   # client will fill up a form to book this trainer
    path("get_all_booked", views.get_all_booked, name="get_all_booked"),    # get all the Booking objects that have the booker = current client
    path("check_booked/<str:trainer_username>", views.check_booked, name="check_booked"),   # check if this client has already made a booking with the trainer
    path("remove_booking", views.remove_booking, name="remove_booking"),    # delete the Booking object between this current client and trainer

    path("get_reviews/<str:trainer_username>", views.get_reviews, name="get_reivews"),   # get the reviews of this trainer 
    path("create_review/<str:trainer_username>", views.create_review, name="create_review"),     # create review that current user made on trainer

    # for trainer
    path("trainer_page", views.trainer_page, name="trainer_page"),      # main page for the trainer
    path("get_unconfirmed_bookings", views.get_unconfirmed_bookings, name="get_unconfirmed_bookings"),  # get the bookngs where booked_trainer=trainer

    path("get_trainer_profile", views.get_trainer_profile, name="get_trainer_profile"),   # get the attributes of the trainer 

    path('update_profile', views.update_profile, name="update_profile"),    # for trainer to update profile through edit

    path("get_accepted_bookings", views.get_accepted_bookings, name="get_accepted_bookings"),   # get all bookings that have been acceppted, for trainer
    path("accept_booking", views.accept_booking, name="accept_booking"),
    path("decline_booking", views.decline_booking, name="decline_booking"),

    path("get_client_reviews", views.get_client_reviews, name="get_client_reviews"),    # get the review left by a client on trainer's profile page
    path("create_review", views.create_review, name="create_review"),   # creates a Review object 
]