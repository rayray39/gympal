# Gympal

# Overview
**GymPal** is a tool for gym-goers, especially newbies who are afraid of the environment and are unsure of what to do, to engage a personal trainer. The personal trainer can then provide 
necessary assistance and advice that are crucial for getting those 'newbie gains'. Gymgoers can filter, select, book and view personal trainers that have registered under GymPal. 
They can essentially tailor their trainings to suit their preferences based on the trainer's experience, description and even cost of trainings. Personal trainers, on the other hand, 
will be able to view bookings and either accept or decline them. 

Hereon the gym-goer will be called the client and the personal trainer will just be called trainer. 

![GymPal 1](https://github.com/rayray39/gympal/assets/108506541/83543b26-d12b-4118-b1e8-2bbadf10bc22)

# Distinctiveness
**GymPal** is distinct in the sense that it allows 2 different types of users to be registered - **the client and the trainer**. Depending on whether the user registers as a client or a trainer, 
the user interface that they interact with will be different. Different web pages, features and functionalities will be rendered for each type of user. This is because the client's goals 
would be different from the trainer's goals and there is simply no need for the client to view information that the trainer has access to, and vice versa. 
GymPal is also a single-page application (or rather 2 pages). There is only a single web page for both the client and trainer respectively. 

# Complexity
As a client, you are able to view the entire list of trainers, on the **Marketplace** page, that registered on GymPal. The client is able to see the trainer's name, number of years of experience 
in the gym training scene, a description - which shows what the trainer specialises in training, and an hourly rate that the client has to pay for the trainer's services. 

At the top of the **Marketplace** page, there is a unique _Filter_ feature which allows the client to filter for the trainers based on the client's preferences. The 2 filter fields are years 
of experience and description. The client can choose to either filter based on years of experience, description, or both. If both fields are filled in, the function filters based on description 
first and then years of experience. For eg. if the filter fields are description='muay thai' and years or experience='2', the function will first filter for trainers that specialises in muay thai.
Among these filtered trainers, the function will then further select those that also have 2 years of experience. Clicking on the 'Reset' button clears the filters. 
The complexity of this feature stems from the paasing of information from the client-side to the server-side and then back to the client.
Firstly, when the filter fields are filled in, a JavaScript function (client-side) retrieves the values and using the POST method of the fetch API, passes the values to the view function (server-side) 
for processing. After the view function successfully filters the trainers that meet the requirements, this set of trainers is passed back to the JavaScript function (client-side) to be rendered on the webpage. 

In the **Starred** page, the client can view all the trainers that she has starred. This page provides a simplified look of the main Marketplace page. The complexity of this feature lies in the 
number of API endpoints required. The first API endpoint checks if the client has already starred the trainer. Depending on the outcome of this, the button rendered to the client is differet. 
There are 2 more API endpoints that add and remove the trainer from the client's starred page on the server-side. The last API endpoint returns all trainers that have been starred by the client, 
thereby filling up the Starred page. 

By clicking on the name of the trainer, the client can access the **profile page of the trainer** and book the trainer for training sessions. The complexity of the booking feature lies in the 
creation of the booking form and passing the information to the server-side for creation of the booking. All bookings will require additional information such as the duration of session and location of gym. 

As a trainer, you are able to view all the bookings requested under the **Unconfired Bookings** page. Once bookings have been accepted, they will show up in the **Schedule** page. You can also change 
information in your **Profile** page, such as the years of experience, description and hourly rate. 

The main complexity for the trainers lies in the _Edit profile_ page feature. Each information is editable and will thus require a unique id, to ensure that editing a field will not affect the rest. 
When the edit button is clicked, a textarea and a new save button are created dynamically. The textarea replaces the original field's position in the DOM and the save button replaces the edit 
button's position in the DOM. Once the save button is clicked, it creates a new div and retrieves the value inside the textarea. It then stores the value inside the div and replaces the textarea 
with the div inside the DOM. It also uses the POST method of the fetch API to update the profile of the trainer in the server-side. The save button is then replaced by the original edit button 
in the DOM. 

It is also important to note that if the hourly_rate is updated, only bookings booked by the client thereafter will be calculated based on the new hourly_rate. If bookings are accpected,
a prompt will be shown on the client's booking stating that it was successful. Else, the client can choose to remove it and make a new booking. 

# Specifications
## General
#### Specification 1: Registration - users can either register as a _Client_ or a _Trainer_. 

## Client
#### Specification 1: Marketplace page - where clients can view all the trainers that are registered on GymPal. 
#### Specification 2: Marketplace Filter - clients can filter for trainers in the marketplace based on years of experience and description. 
#### Specification 3: Starred page - clients can star trainers they want and view them on this page. 
#### Specification 4: Bookings page - clients can see all the bookings (rejected or successful) that they requested.
#### Specification 5: Profile page Booking - clients can click on the username of the trainer and book the trainer through a form. 
#### Specification 6: Review - clients can leave a review on a trainer's page, through a form. Clients will be able to see reviews left by other clients.

![GymPal 2](https://github.com/rayray39/gympal/assets/108506541/7ce6cf0d-92f5-4de5-a388-f6e4d9962e09)

## Trainer
#### Specification 1: Unconfirmed Bookings page - trainers can see all bookings that they can accept and decline. 
#### Specification 2: Schedule page - accepted bookings by the trainer will be displayed on this page. 
#### Specification 3: Profile page - trainer can edit information about themselves (years of experience, description and hourly rate).

![GymPal 3](https://github.com/rayray39/gympal/assets/108506541/f974b038-3377-4353-9017-bfae3aba1d93)

# Lessons Learnt
1. Using vanilla JavaScript to create dynamic web interfaces, including the use of buttons, textareas, and forms.
2. Understanding the interaction between the client-side and server-side, and how data can be passed from the client-side to the server-side for processing.
3. The design and development of a Single-Page Application, through the use of JavaScript to dynamically display content to the user.
4. Representing and using JSON data.
5. Using and understanding the fetch API, which retrieves information and returns a promise. The promise is only resolved when needed.  
6. Using the Django framework as an abstraction of SQL, to create models and enable the interaction with database.
7. Using Python to create view functions that allow the frontend (client-side JavaScript) to interact with the backend (Django) and vice versa.
8. Django's Model-View-Template (MVT) software design pattern. 

# File Structure
`gym` is the name of the application and `capstone` is the name of the project. 
`gym/models.py` contains the Django models used. There are 4 models created for GymPal. 
1. User - represents either the client or the trainer.
2. Star - a Star object captures the relationship between the trainer that has been starred by a client.
3. Booking - a Booking object captures the relationship and information regarding a booking made between a client and a trainer.
4. Review - a Review object represents the relationship and information regarding a review left by a client, the content and the trainer's page.

`gym/views.py` contains all the view functions necessary for processing of data and transferring of data back to the client-side. 
`gym/templates/gym` contains all the HTML files for the web pages. 
`gym/static/gym` contains all the CSS files necessary for the styling of the web pages. 
`gym/urls.py` contains the urls (API endpoints that the Frontend invokes, to allow Backend to process the data).

# How to Use
- In the master branch, download all the files.
- Ensure that Python (3.9.X) and Django (4.2.X) are installed, preferablly in a virtual environment.
- Open the command prompt, and perform the following steps
    1. `python manage.py makemigrations gym`, this step creates the set of 'instructions' to allow Django to build the database models.
    2. `python manage.py migrate`, this step implements the set of 'instructions' created in step 1.
    3. `python manage.py runserver`, this step creates the server locally.
    4. Enter the local server address into the web browser and the website should appear.
