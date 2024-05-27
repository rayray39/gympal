document.addEventListener('DOMContentLoaded', function() {
    get_unconfirmed_bookings();

    // when the 'Profile' tab is clicked on
    document.querySelector('#trainer-profile-nav').addEventListener('click', function() {
        trainer_profile_page();
    })

    // when the 'Schedule' tab is clicked on
    document.querySelector('#trainer-schedule-nav').addEventListener('click', function(){
        get_accepted_bookings();
    })

    // when the 'Reviews' tab is clicked on
    document.querySelector('#trainer-review-nav').addEventListener('click', function() {
        get_client_reviews();
    })
})

function get_unconfirmed_bookings() {
    // getting all the unconfirmed bookings, for the trainer that is currently authenticated
    document.querySelector('#trainer-profile-page-div').style.display = 'none';
    document.querySelector('#trainer-schedule-page-div').style.display = 'none';
    document.querySelector('#trainer-review-page-div').style.display = 'none';

    const bookings_div = document.querySelector("#unconfirmed-bookings-div");
    bookings_div.style.display = 'block';
    bookings_div.innerHTML = '';

    fetch('/get_unconfirmed_bookings')
    .then(response => response.json())
    .then(bookings => {
        // each booking is the serialized version
        console.log('--- getting unconfirmed bookings---');
        console.log(bookings);

        bookings.forEach(booking => {
            const trainer_username = booking.booked_trainer;
            const client_username = booking.booker;

            const main_div = document.createElement('div');
            main_div.className = "trainer-unconfirmed-booking-div";
            main_div.id = `${client_username}-unconfirmed-booking-div`;    // use client username as the div id

            entries = [booking.booker, booking.datetime, booking.duration, booking.gym_location, booking.total_amt];
            headers = ["Client", "Date and Time", "Duration (hours)", "Location of Gym", "Total Amount (Dollars)"];

            for (let i = 0; i < entries.length; i++) {
                const div = document.createElement('div');
                div.innerHTML = `${headers[i]}: ${entries[i]}`;
                main_div.append(div);
            }
            main_div.append(accept_button(client_username), decline_button(client_username));
            bookings_div.append(main_div);
        })
    })
}

function accept_button(client_username) {
    // a button for the trainer to accept the booking made by the client
    // once the button is clicked, 'shift' the card to schedule page and remove the card from unconfirmed bookings page
    const accept = document.createElement('button');
    accept.innerHTML = 'Accept';
    accept.className = 'btn btn-primary';
    accept.style.marginTop = "10px";
    accept.style.marginRight = "10px";

    accept.addEventListener('click', function() {
        document.getElementById(`${client_username}-unconfirmed-booking-div`).remove();
        alert("Booking Accepted! View all accepted bookings under Schedule.");
        fetch('/accept_booking', {
            method: "POST", 
            body: JSON.stringify({
                client_username : client_username
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            console.log(`trainer is accepting ${client_username}`);
        })
    })
    return accept;
}

function decline_button(client_username) {
    // a button for the trainer to decline the booking made by the client
    const decline = document.createElement('button');
    decline.innerHTML = 'Decline';
    decline.className = 'btn btn-primary';
    decline.style.marginTop = "10px";

    decline.addEventListener('click', function() {
        alert("Booking Declined! Client will be notified of your rejection.");
        fetch('/decline_booking', {
            method: "POST", 
            body: JSON.stringify({
                client_username : client_username
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            console.log(`trainer is declining ${client_username}`);
        })
    })
    return decline;
}

function trainer_profile_page() {
    // show the profile page of current authenticated trainer
    document.querySelector('#unconfirmed-bookings-div').style.display = 'none';
    document.querySelector('#trainer-schedule-page-div').style.display = 'none';
    document.querySelector('#trainer-review-page-div').style.display = 'none';

    const profile = document.querySelector('#trainer-profile-page-div');
    profile.style.display = 'block';
    profile.innerHTML = '';
    console.log("--- showing profile of trainer ---");

    fetch('/get_trainer_profile')
    .then(response => response.json())
    .then(trainer => {
        entries = [trainer.username, trainer.years_of_exp, trainer.desc, trainer.hourly_rate];
        headers = ["Name", "Years of Experience", "Description", "Hourly Rate (Dollars)"];
        id_name = ["username", "years_of_exp", "desc", "hourly_rate"];      // field (model attribute name)

        for (let i=0; i < entries.length; i++) {
            // div for the field attribute (editable)
            const entry_div = document.createElement('div');
            entry_div.id = `${id_name[i]}-profile-field-div`;   // this is the div that will be editable
            entry_div.style.fontSize = "24px";
            entry_div.style.display = 'inline-block';
            entry_div.innerHTML = `${entries[i]}`

            // div for the header
            const header_div = document.createElement('div');
            header_div.style.fontSize = "24px";
            header_div.style.display = 'inline-block';
            header_div.innerHTML = `<b>${headers[i]}</b>:`;

            const main_div = document.createElement('div');
            main_div.append(header_div, " ", entry_div);
            profile.append(main_div);
            if (entries[i] !== trainer.username) {
                // first arg = id name, second arg = previous value
                profile.append(edit_profile_field_button(id_name[i], entries[i]));
            }
        }
    })
}

function edit_profile_field_button(field, previous_value) {
    // button to allow the trainer to edit the fields (years of exp, desc, hourly rate) in his/her profile page
    const edit = document.createElement('button');
    edit.innerHTML = "Edit";
    edit.id = `${field}-edit-profile-field-div`;
    edit.className = "btn btn-primary";
    edit.style.marginBottom = "20px";

    edit.addEventListener('click', function() {
        // replace the existing field with a textarea and a display a 'Save Changes' button
        console.log(`editing field: ${field}`);
        edit.style.display = 'none';

        // create the save button
        const save = document.createElement('button');
        save.className = 'btn btn-primary';
        save.innerHTML = "Save Changes";
        save.id = `${field}-save-profile-field-div`;
        save.style.marginTop = "10px";
        save.addEventListener('click', function() {
            save_profile_changes(field);
        })

        // replace the existing edit button with the save button
        edit.replaceWith(save);

        // create the textarea to key in the new edits, populate the textarea with the previous value
        const edit_textarea = document.createElement("textarea");
        edit_textarea.id = `${field}-textarea-profile-field-div`;   // this textarea contains the new value 
        edit_textarea.className = 'form-control';
        edit_textarea.cols = 180;
        edit_textarea.innerHTML = previous_value;

        // replace original div with the textarea
        document.getElementById(`${field}-profile-field-div`).replaceWith(edit_textarea);
    })

    return edit;
}

function save_profile_changes(edited_field) {
    // button that saves the edited field and updates the object in the database
    const text_area = document.getElementById(`${edited_field}-textarea-profile-field-div`);
    const new_value = text_area.value;
    const div = document.createElement('div');
    div.id = `${edited_field}-profile-field-div`;
    div.innerHTML = new_value;
    div.style.fontSize = "24px";
    div.style.display = "inline-block";
    
    text_area.replaceWith(div);     // replace the textarea with a div that contains the new edited value

    document.getElementById(`${edited_field}-save-profile-field-div`).replaceWith(edit_profile_field_button(edited_field, new_value));

    // update the database for this trainer's info
    fetch('/update_profile', {
        method: "POST",
        body: JSON.stringify({
            edited_field : edited_field,    // the field that was edited
            new_value : new_value           // the new value that was input into the textarea
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        console.log(`---successfuly updated ${edited_field}---`);
    })
}

function get_accepted_bookings() {  // for schedule page
    // fetch all the bookings that have already been accepted by the current trainer
    // bookings should not have any buttons
    document.querySelector('#trainer-profile-page-div').style.display = 'none';
    document.querySelector("#unconfirmed-bookings-div").style.display = 'none';
    document.querySelector('#trainer-review-page-div').style.display = 'none';

    const accepted = document.querySelector('#trainer-schedule-page-div');
    accepted.style.display = 'block';
    accepted.innerHTML = '';

    fetch('/get_accepted_bookings')
    .then(response => response.json())
    .then(bookings => {
        bookings.forEach(booking => {
            // each booking is the serialized version
            console.log('--- getting accepted(confirmed) bookings---');
            console.log(bookings);

            const main_div = document.createElement('div');
            main_div.className = "trainer-accepted-booking-div";

            entries = [booking.booker, booking.datetime, booking.duration, booking.gym_location, booking.total_amt];
            headers = ["Client", "Date and Time", "Duration (hours)", "Location of Gym", "Total Amount (Dollars)"];

            for (let i = 0; i < entries.length; i++) {
                // append each information as a div into main_div (card)
                const div = document.createElement('div');
                div.innerHTML = `${headers[i]}: ${entries[i]}`;
                main_div.append(div);
            }
            accepted.append(main_div);
        })
    })
}

function get_client_reviews() {
    // fetch all the client reviews for this trainer and display them on a page
    document.querySelector('#trainer-profile-page-div').style.display = 'none';
    document.querySelector("#unconfirmed-bookings-div").style.display = 'none';
    document.querySelector('#trainer-schedule-page-div').style.display = 'none';

    const trainer_review = document.querySelector('#trainer-review-page-div');
    trainer_review.style.display = 'block';
    trainer_review.innerHTML = '';

    fetch('/get_client_reviews')
    .then(response => response.json())
    .then(reviews => {
        console.log(reviews);
        console.log('--- getting client reviews ---');

        reviews.forEach(review => {
            entries = [review.content, review.reviewer];
            headers = ["", "From: "];

            const main_div = document.createElement('div');
            main_div.className = 'trainer-review-card';

            for (let i=0; i < entries.length; i++) {
                const div = document.createElement('div');
                const text = `${headers[i]}${entries[i]}`;
                div.innerHTML = text;
                main_div.append(div);
            }
            trainer_review.append(main_div);
        })
    })
}