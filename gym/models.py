from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

# Create your models here.

# user can either be a Client or a Trainer, depending on who logs in, the UI will be different 

# user is either a client or a trainer
class User(AbstractUser) :
    user_type = models.CharField(max_length=7)  # client or trainer
    years_of_exp = models.PositiveIntegerField(null=True)
    desc = models.TextField(null=True)
    hourly_rate = models.PositiveIntegerField(null=True)    # to the nearest dollar
    def serialize(self) :
        return {
            "id" : self.id,
            "username": self.username,
            "user_type" : self.user_type,
            "years_of_exp" : self.years_of_exp,
            "desc" : self.desc,
            "hourly_rate" : self.hourly_rate,
        }
    

# a Star object represents a trainer that a client has starred
class Star(models.Model) :
    # which client's starred page does it belong to
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client')

    # which trainer is inside this client's starred page
    trainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trainer')


# a Booking object represents information regarding the booking made by a client with a trainer of choice
class Booking(models.Model) :
    # the client that booked a trainer
    booker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="booker")

    # the trainer that got booked by this client
    booked_trainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="booked_trainer")

    # the datetime of the booking between the client and the trainer
    booked_datetime = models.CharField(max_length=12)

    # the duration of the booking (duration of training session with trainer) in hours
    duration = models.PositiveIntegerField()

    # the location of the gym where the training will be held
    gym_location = models.CharField(max_length=64)

    # the total cost of the training session (trainer.hourly_rate * duration)
    total_amt = models.PositiveIntegerField(null=True)

    # to indicate whether the booking has been accepted by the trainer or not
    accepted = models.BooleanField(default=False)

    def serialize(self) :
        return {
            "booker": self.booker.username,
            "booked_trainer": self.booked_trainer.username,
            "datetime" : self.booked_datetime,
            "duration" : self.duration,
            "gym_location" : self.gym_location,
            "total_amt" : self.total_amt, 
            "accepted" : self.accepted
        }
    

class Review(models.Model) :
    # the content of the comment
    content = models.TextField(null=True)

    # who made this comment (which client)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="commenter")

    # which trainer did the commenter (client) made the comment on
    trainer_profile = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trainer_profile")

    def serialize(self) :
        return {
            "reviewer" : self.reviewer.username, 
            "trainer_profile" : self.trainer_profile.username, 
            "content" : self.content
        }