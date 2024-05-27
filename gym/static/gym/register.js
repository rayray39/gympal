function show_register_fields() {
    const user_type = document.querySelector('#user_type').value;
    console.log(`---User type selected: ${user_type} ---`);

    const trainer_registration = document.querySelector('#trainer-registration-div');
    trainer_registration.innerHTML = '';

    // for trainer's year(s) of exp
    const years_of_exp_input = document.createElement("input");
    years_of_exp_input.type = "number";
    years_of_exp_input.name = "years_of_exp";
    years_of_exp_input.max = 99;
    years_of_exp_input.min = 1;
    years_of_exp_input.required = true;
    years_of_exp_input.className = "form-control";
    years_of_exp_input.placeholder = "Years of Experience (Number)";

    // description of trainer
    const desc_input = document.createElement("textarea");
    desc_input.name = "desc";
    desc_input.className = "form-control";
    desc_input.placeholder = "Describe Yourself (eg. Specialties, Focus area etc.)";
    desc_input.required = true;
    desc_input.style.marginTop = "15px";

    // hourly rate of trainer
    const hourly_rate_input = document.createElement("input");
    hourly_rate_input.type = "number";
    hourly_rate_input.name = "hourly_rate";
    hourly_rate_input.min = 60;
    hourly_rate_input.max = 400;
    hourly_rate_input.required = true;
    hourly_rate_input.className = "form-control";
    hourly_rate_input.placeholder = "Hourly Rate (To nearest dollar)";
    hourly_rate_input.style.marginTop = "15px";

    if (user_type === "trainer") {
        trainer_registration.append(years_of_exp_input, desc_input, hourly_rate_input);
    } else if (user_type === "client") {
        trainer_registration.style.display = 'none';
    }
}