// write all the JS functions here

document.addEventListener('DOMContentLoaded', function() {
    show_trainers();
    filter_trainers();

    document.querySelector('#filter-form-reset').addEventListener('click', function() {
        console.log('--- running reset ---');
        const desired_years_of_exp = document.querySelector('#filter_years_of_exp');
        const desired_desc = document.querySelector('#filter_desc');
        desired_years_of_exp.value = '',
        desired_desc.value = '';
        show_trainers();
    })

})

function show_trainers() {
    // show the trainer as a 'card' in the marketplace
    document.querySelector('#filtered-trainer-div').style.display = 'none';
    document.querySelector('#starred-trainers-div').style.display = 'none';
    document.querySelector('#booking-form-div').style.display = 'none';
    document.querySelector('#filter-form-div').style.display = 'block';
    document.querySelector('#trainer-profile-div').style.display = 'none';
    document.querySelector('#all-bookings-div').style.display = 'none';
    document.querySelector('#review-form').style.display = 'none';
    document.querySelector('#trainer-reviews-div').style.display = 'none';

    const marketplace = document.querySelector('#trainer-marketplace-div');
    marketplace.style.display = 'block'     // show all trainers and hide the filtered view
    marketplace.innerHTML = '';

    fetch('/get_users/trainer')
    .then(response => response.json())
    .then(trainers => {
        console.log("--- getting trainers---");
        console.log(trainers);
        trainers.forEach(trainer => {
            // each trainer comes in the serialized version
            marketplace.append(style_trainer_card(trainer));
        });
    })
}

function style_trainer_card(trainer, div_origin="marketplace") {
    // individual card of the trainer
    // div_origin specifies where the trainer card belongs to, either in the marketplace or the starred page
    const main_div = document.createElement('div');
    main_div.className = "trainer-card-div";
    if (div_origin === "starred") {
        main_div.id = `${trainer.username}-card-div`;
    }
    const headers = ["Name", "Years of Experience", "Description"];
    const fields = [trainer.username, trainer.years_of_exp, trainer.desc];

    for (let i=0; i<fields.length; i++) {
        const div = document.createElement('div');
        let text = `${headers[i]}: ${fields[i]}`;
        div.innerHTML = text;
        if (headers[i] === "Name") {
            text = `<b>${headers[i]}: ${fields[i]}</b>`;
            div.innerHTML = text;
            div.addEventListener('click', function() {
                // username of trainer is clickable and will take client to the profile page of trainer
                show_profile(trainer);
            })
        }
        main_div.append(div);   // append each attribute to the card
        hover(main_div, "khaki", "lightyellow");
    }
    // create the Star button
    main_div.append(add_remove_star_button(trainer.username, div_origin));
    return main_div;
}

function hover(div, mouseover_color, mouseleave_color) {
    // change color of the trainer card when the mouse hovers over it
    div.addEventListener('mouseover', function() {
        div.style.backgroundColor = mouseover_color;
    }) 
    div.addEventListener('mouseleave', function() {
        div.style.backgroundColor = mouseleave_color;
    })
}

function filter_trainers() {
    // return the subset of trainers that fit the filter requirements entered into the filter form
    const filter_form = document.querySelector('#filter-form-div');
    filter_form.style.display = 'block';

    filter_form.addEventListener('submit', function(event) {
        event.preventDefault();     // prevent default form submission when submit button is clicked
        document.querySelector('#trainer-marketplace-div').style.display = 'none';
        document.querySelector('#starred-trainers-div').style.display = 'none';
        document.querySelector('#trainer-profile-div').style.display = 'none';
        document.querySelector('#booking-form-div').style.display = 'none';
        document.querySelector('#all-bookings-div').style.display = 'none';
        document.querySelector('#review-form').style.display = 'none';
        document.querySelector('#trainer-reviews-div').style.display = 'none';

        const filtered_div = document.querySelector('#filtered-trainer-div');
        filtered_div.innerHTML = '';
        filtered_div.style.display = 'block';      // show the filtered view and hide all trainer view

        // get the values from the form inputs
        console.log("--- getting filter form values ---");
        const desired_years_of_exp = document.querySelector('#filter_years_of_exp').value;
        const desired_desc = document.querySelector('#filter_desc').value;
        if (desired_years_of_exp === '' && desired_desc === '') {
            // if the filter form input values are empty, just show all the trainers and return
            document.querySelector('#trainer-marketplace-div').style.display = 'block';
            return;
        }
        console.log(`filter form input years_of_exp: ${desired_years_of_exp}`);
        console.log(`filter form input desc: ${desired_desc}`);

        // pass the values from the form inputs into the view function
        fetch('/filter_trainers', {
            method: "POST",
            body: JSON.stringify({
                desired_years_of_exp : desired_years_of_exp,
                desired_desc : desired_desc
            })
        })
        .then(response => response.json())
        .then(trainers => {
            console.log("--- getting filtered trainers---");
            console.log(trainers);

            // the response is all the trainers that fit the filter
            trainers.forEach(trainer => {
                filtered_div.append(style_trainer_card(trainer));
            })
        })
    })
}

function add_remove_star_button(trainer_username, page_origin) {
    // the Star button is either 'adding trainer to Starred' or 'removing trainer from Starred'
    const star_button = document.createElement('button');
    star_button.className = 'btn btn-primary';
    star_button.style.marginTop = "10px";

    // check if the trainer has been starred or not by the current user and render the correct innerHTML of button
    fetch(`/check_starred/${trainer_username}`)
    .then(response => response.json())
    .then(data => {
        if (data.already_starred) {
            star_button.innerHTML = "Remove from Starred";
        } else {
            star_button.innerHTML = "Add to Starred";
        }
    })

    star_button.addEventListener('click', function() {
        if (page_origin === "marketplace") {
            // trainer cards in marketplace can either be 'Add' or 'Remove'
            if (star_button.innerHTML == "Add to Starred") {
                add_trainer_to_star(trainer_username);
                star_button.innerHTML = "Remove from Starred";
            } else if (star_button.innerHTML === "Remove from Starred") {
                remove_trainer_from_star(trainer_username, false);
                star_button.innerHTML = "Add to Starred";
            }
        } else if (page_origin === "starred") {
            // trainer cards in starred can only be 'Remove'
            remove_trainer_from_star(trainer_username, true);
        }
    })
    return star_button;
}

function add_trainer_to_star(trainer_username) {
    // add this trainer to the starred page (passing in the trainer's username)
    fetch("/add_trainer_to_starred", {
        method: "POST",
        body: JSON.stringify({
            trainer_username: trainer_username
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(`---adding ${trainer_username} to starred---`);
        console.log(result);
    })
}

function get_starred_trainers() {
    // return all the trainers that were Starred by the current user, in the Starred page
    document.querySelector('#trainer-marketplace-div').style.display = 'none';
    document.querySelector('#filtered-trainer-div').style.display = 'none';
    document.querySelector('#filter-form-div').style.display = 'none';
    document.querySelector('#trainer-profile-div').style.display = 'none';
    document.querySelector('#booking-form-div').style.display = 'none';
    document.querySelector('#all-bookings-div').style.display = 'none';
    document.querySelector('#review-form').style.display = 'none';
    document.querySelector('#trainer-reviews-div').style.display = 'none';

    const starred_trainer_div = document.querySelector('#starred-trainers-div');
    starred_trainer_div.style.display = 'block';
    starred_trainer_div.innerHTML = '';

    fetch('/get_starred_trainers')
    .then(response => response.json())
    .then(starred_trainers => {
        console.log("--- getting the starred trainers ---");
        console.log(starred_trainers);

        starred_trainers.forEach(trainer => {
            // render each trainer profile in the same card style as the cards in the marketplace
            starred_trainer_div.append(style_trainer_card(trainer, "starred"));
        })
    })
}

function remove_trainer_from_star(trainer_username, from_starred_page) {
    // remove the trainer from the Starred page of this current user
    if (from_starred_page) {
        // if the button that was clicked belong to a card inside the Starred page, then remove the card when button is pressed
        const starred_trainer = document.querySelector(`#${trainer_username}-card-div`);
        starred_trainer.remove();
    }

    fetch('/remove_trainer_from_starred', {
        method: "POST", 
        body: JSON.stringify({
            trainer_username : trainer_username
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(`---removing ${trainer_username} from starred---`);
        console.log(result);
    })
}

function show_profile(trainer) {
    // show the profile page of the trainer, when the trainer's div gets clicked on
    document.querySelector('#trainer-marketplace-div').style.display = 'none';
    document.querySelector('#filtered-trainer-div').style.display = 'none';
    document.querySelector('#filter-form-div').style.display = 'none';
    document.querySelector('#starred-trainers-div').style.display = 'none';
    document.querySelector('#booking-form-div').style.display = 'none';
    document.querySelector('#all-bookings-div').style.display = 'none';

    document.querySelector('#review-form').style.display = 'block';
    document.querySelector('#trainer-reviews-div').style.display = 'block';

    const trainer_profile = document.querySelector('#trainer-profile-div');
    trainer_profile.style.display = 'block';
    trainer_profile.innerHTML = '';
    trainer_profile.style.marginTop = '40px';
    trainer_profile.style.padding = '20px';

    const headers = ["Name", "Years of Experience", "Description", "Hourly Rate"];
    const entries = [trainer.username, trainer.years_of_exp, trainer.desc, trainer.hourly_rate];

    for (let i = 0; i < entries.length; i++) {
        const div = document.createElement('div');
        div.innerHTML = `<h5><b>${headers[i]}:</b> ${entries[i]}</h5>`;
        trainer_profile.append(div);
    }
    // check if the trainer has already been booked by the client or not
    fetch(`/check_booked/${trainer.username}`)
    .then(response => response.json())
    .then(data => {
        if (!data.already_booked) {
            // add the booking button to the trainer's profile page if not yet booked by current user
            trainer_profile.append(booking_button(trainer.username));
        }
    })

    show_reviews(trainer.username);
    create_review(trainer.username);
}

function book_trainer(trainer_username) {
    // create a booking object to represent the current client booking this trainer
    // attached this to the 'Confirm Booking' button
    // this function gets the booking confirmed

    // get the input value from the booking form
    const booking_datetime = document.querySelector('#booking-datetime').value;
    const booking_duration = document.querySelector('#booking-duration').value;
    const booking_location = document.querySelector('#booking-location').value;

    // pass the input values to the view function
    fetch(`/book_trainer/${trainer_username}`, {
        method: "POST",
        body: JSON.stringify({
            booking_datetime : booking_datetime,
            booking_duration : booking_duration,
            booking_location : booking_location
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(`---trainer: ${trainer_username}, is being booked---`);
        console.log(result);

        document.querySelector('#booking-form-div').style.display = 'none';
        alert("Booking Successful!");
    })
}

function booking_button(trainer_username) {
    // the button that allows the current user to book a trainer
    // this button should be rendered on the trainer's profile page
    // this button shows the booking form
    const booking_form = document.querySelector('#booking-form-div');
    // create the button
    const book_button = document.createElement('button');
    book_button.className = 'btn btn-primary';
    book_button.innerHTML = 'Book This Trainer';

    book_button.addEventListener('click', function() {
        // show the booking form and attach submit handler to the 'Confirm Booking' button
        book_button.style.display = 'none';
        document.querySelector('#booking-form-div').style.display = 'block';
        // when the form is submitted (when the 'Confirm Booking' button is clicked)
        booking_form.addEventListener('submit', function(event) {
            event.preventDefault();     // prevent default submission of form
            book_trainer(trainer_username);
        })
    })

    return book_button;
}

function remove_trainer_from_booked(trainer_username) {
    // remove the booking that the current user made with the trainer, from client's bookings page
    document.querySelector(`#${trainer_username}-booking-div`).remove();
    fetch('/remove_booking', {
        method: "POST", 
        body: JSON.stringify({
            trainer_username : trainer_username
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(`--- removing ${trainer_username} from booking---`);
        console.log(result);
    })
}

function remove_booking_button(trainer_username) {
    // remove_trainer_from_booked is tied to the click handler of this button
    const remove_button = document.createElement('button');
    remove_button.innerHTML = "Remove Booking";
    remove_button.className = 'btn btn-primary';
    remove_button.style.marginTop = '10px';
    remove_button.addEventListener('click', function(){
        remove_trainer_from_booked(trainer_username);
    })
    return remove_button;
}

function get_all_booked() {
    // return all the bookings that have been made by the current user
    document.querySelector('#trainer-marketplace-div').style.display = 'none';
    document.querySelector('#filtered-trainer-div').style.display = 'none';
    document.querySelector('#filter-form-div').style.display = 'none';
    document.querySelector('#starred-trainers-div').style.display = 'none';
    document.querySelector('#booking-form-div').style.display = 'none';
    document.querySelector('#trainer-profile-div').style.display = 'none';
    document.querySelector('#review-form').style.display = 'none';
    document.querySelector('#trainer-reviews-div').style.display = 'none';

    const all_bookings = document.querySelector('#all-bookings-div');
    all_bookings.style.display = 'block';
    all_bookings.innerHTML = '';

    fetch('/get_all_booked')
    .then(response => response.json())
    .then(bookings => {
        console.log("--- getting all the bookings ---");
        console.log(bookings);
        bookings.forEach(booking => {
            // booked_trainer is a User object (trainer), booking.booked_trainer = trainer's username
            const main_div = document.createElement('div');
            main_div.className = "booking-main-div";
            main_div.id = `${booking.booked_trainer}-booking-div`;
            entries = [booking.booked_trainer, booking.datetime, booking.duration, booking.gym_location, booking.total_amt];
            headers = ["Trainer", "Date and Time", "Duration (hours)", "Location of Gym", "Total Amount (Dollars)"];

            for (let i = 0; i < entries.length; i++) {
                const div = document.createElement('div');
                div.innerHTML = `${headers[i]}: ${entries[i]}`;
                main_div.append(div);
            }
            // bookings that exist inside the Bookings page should only have the "Remove Booking" button
            if (booking.accepted) {
                const div = document.createElement('div');
                div.innerHTML = '<b>Trainer has accepted your booking request!</b>';
                main_div.append(div);
            } else {
                // if the booking has yet to be accepted by the trainer, allow the client to remove booking
                main_div.append(remove_booking_button(booking.booked_trainer));
            }
            all_bookings.append(main_div);
        })
    })
}

function show_reviews(trainer_username) {
    // appends all the reviews belonging to this trainer to the trainer-reviews-div
    // call this function in show_profile
    const trainer_reviews = document.querySelector('#trainer-reviews-div');
    trainer_reviews.innerHTML = '';

    fetch(`/get_reviews/${trainer_username}`)
    .then(response => response.json())
    .then(reviews => {
        // each review is the serialize version
        reviews.forEach(review => {
            trainer_reviews.append(create_review_card(review.content, review.reviewer));
        })
    })
}

function create_review_card(content, reviewer) {
    // creates a card for the review, that will be appended to the trainer's page when the user clicks on it
    entries = [content, reviewer];
    headers = ["", "From: "];

    const main_div = document.createElement('div');
    main_div.className = 'trainer-review-card';

    for (let i=0; i < entries.length; i++) {
        const div = document.createElement('div');
        const text = `${headers[i]}${entries[i]}`;
        div.innerHTML = text;
        main_div.append(div);
    }
    return main_div;
}

function create_review(trainer_username) {
    // attach this to the review form submit handler
    document.getElementById('review-form').addEventListener('submit', function(event) {
        event.preventDefault();     // prevent default form submission

        // const trainer_reviews = document.getElementById('#trainer-reviews-div');
        const review_content = document.getElementById('review-content').value;
        document.getElementById('review-content').innerHTML = "";

        // pass value to server-side to create new Review object
        fetch('/create_review', {
            method: "POST",
            body: JSON.stringify({
                review_content : review_content,
                trainer : trainer_username
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            console.log("---successfully created new review---");
        })
        location.reload();
    })
}

