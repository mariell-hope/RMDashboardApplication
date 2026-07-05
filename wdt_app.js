// Class definitions
//Parent class
class Employee {
    constructor(name,surName){
  this.name = name;
  this.surName = surName;
    }
}

//Child class 1
class StaffMember extends Employee {
    constructor(name, surname, picture, email){
        super(name, surname); //    calling the parent constructor
        
        //Data from API
        this.picture = picture;
        this.email = email;

        //System state
        this.status = 'In';
        this.outTime = null;
        this.duration = null;
        this.expectedReturnTime = null;
        this.breakReason = "";

        this.staffMemberIsLate = false;
        this.lateNotificationShown = false;

    }
    //clockOut method
    clockOut(durationMinutes, reason) {
        const now = new Date();
        
        this.status = "Out";
        this.breakReason = reason;
        
        this.outTime = now;
        this.duration = durationMinutes;
       
        const expected = new Date(now.getTime() + durationMinutes * 60000);
        this.expectedReturnTime = expected;
        
        this.staffMemberIsLate = false;
        this.lateNotificationShown = false;
    }

    //clockIn method 
    clockIn(){
        this.status = "In"

        this.breakReason= "";
        
        this.outTime = null;
        this.duration = null;
        this.expectedReturnTime = null;

        this.staffMemberIsLate = false;
        this.lateNotificationShown = false;
    }

    // Formatting method
    getFormattedDuration() {
        if (this.duration === null) return "";

        if (this.duration < 60) {
            return this.duration + " minutes";
        }

        const hours = Math.floor(this.duration / 60);
        const minutes = this.duration % 60;

        return hours + "h " + minutes + "m";
    }
//Late Detection method
  checkIfLate() {
    if (this.status === "Out") {

        const now = new Date();

        if (now > this.expectedReturnTime && !this.lateNotificationShown)
             {

            this.staffMemberIsLate = true;
            this.lateNotificationShown = true;

            return true;
        }
    }
    return false;
    
  }

  //Remaining time method
  getRemainingTime() {
    if(!this.expectedReturnTime) return "";
    
    const now = new Date();
    const diff = this.expectedReturnTime - now;

    if (diff <=0) return "Late";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}m ${seconds}s`;
}

}

//Child class 2
class DeliveryDriver extends Employee {
    constructor(name, surname, vehicle, telephone, deliveryAdress){
        super(name, surname);

        this.vehicle = vehicle;
        this.telephone = telephone;
        this.deliveryAdress = deliveryAdress;

        this.status = "Available";

        this.expectedReturnTime = null;
        this.deliveryDriverIsLate = false;
        this.lateNotificationShown = false;
    }

    //Starting delivery
    startDelivery(durationMinutes){
        const now = new Date();

        this.status = "Out for Delivery";
        this.expectedReturnTime = new Date(
            now.getTime() + durationMinutes * 60000
        );

        this.deliveryDriverIsLate = false;
        this.lateNotificationShown = false;
    }

    //Complete delivery
    completeDelivery () {
        this.status = "Available";
        this.expectedReturnTime = null;
        this.deliveryDriverIsLate = false;
        this.lateNotificationShown = false;
    }

    //Checking if delivery driver is late
    checkIfLate(){
        if (this.status === "Out for Delivery"){
            const now = new Date();

            if (now > this.expectedReturnTime && !this.lateNotificationShown){
                this.deliveryDriverIsLate = true;
                this.lateNotificationShown = true;
                return true;
            }
        }
        return false;
    }
}


//API function
let staffArray = [];

let deliveryArray = [];



let currentSearch = "";

//wrapper functions

function staffMemberIsLate(staff){
    return staff.checkIfLate();
}

function deliveryDriverIsLate(driver){
    return driver.checkIfLate();
}

function staffUserGet() {

    fetch("https://6a4ab1d8edfa6a2b5fd81175.mockapi.io/api/staff")
    .then(response => response.json())
    .then(result => {

            result.forEach(member => {

            const staff = new StaffMember(
                member.name,
                member.surname,
                member.image,
                member.email_address
            );
            staffArray.push(staff);
        });

        populateStaffTable();
        updateDashboardCards();
    })

    .catch(error => {
        console.error("Error fetching staff:", error);

    });
}

document.addEventListener("DOMContentLoaded", function () {
    staffUserGet();
    document.getElementById("inBtn").addEventListener("click", staffIn);
    document.getElementById("outBtn").addEventListener("click", staffOut);
});

//Rendering functions
let selectedStaffIndex = null;

let selectedDeliveryIndex = null;

function populateStaffTable(staffList = staffArray) {
    const tableBody = document.querySelector("#staffTable tbody");
    tableBody.innerHTML = "";

    staffList.forEach((member, index) => {

        const row = document.createElement("tr");

        if(member.staffMemberIsLate) {
            row.classList.add("table-danger");
        }

        row.innerHTML= `
        <td><img src = "${member.picture}" width="50"></td>
        <td>${member.name}</td>
        <td>${member.surName}</td>
        <td>${member.email}</td>
        <td>${member.status}</td> 
        <td>${member.breakReason}</td>
        <td>${member.outTime ? member.outTime.toLocaleTimeString() : ""}</td>
        <td>${member.getFormattedDuration()}</td>
        <td>${member.expectedReturnTime ? member.expectedReturnTime.toLocaleTimeString() : ""}</td>
        `;

        if (index === selectedStaffIndex) {
            row.classList.add("selected-row")
        }

        row.addEventListener("click", () => {

            if(selectedStaffIndex === index){
                selectedStaffIndex = null;

            document.querySelectorAll("#staffTable tbody tr")
            .forEach(r => r.classList.remove("selected-row"));

            return;
            }
            selectedStaffIndex = index;

            document.querySelectorAll("#staffTable tbody tr")
            .forEach(r => r.classList.remove("selected-row"));

            row.classList.add("selected-row")
        });
        tableBody.appendChild(row);
    });
}

//In button events
function staffIn(){
    if (selectedStaffIndex === null) {
        alert("Select a staff member first");
        return;
    }
    staffArray[selectedStaffIndex].clockIn();
    populateStaffTable();
    updateDashboardCards();
}

function staffOut() {
    if(selectedStaffIndex === null){

        alert("Select a staff member first");
        
        return;
    }

    const modal = 
     new bootstrap.Modal(
        document.getElementById("clockOutModal")
     );

     modal.show();
}

document
.getElementById("confirmClockOutBtn")
.addEventListener("click", function() {

    const reason =
     document.getElementById("reasonSelect").value;

     const minutes = 
      document.getElementById("durationInput").value;

      if(!reason) {
        alert("Select a reason");
        return;
      }

      if (!minutes || Number(minutes) <=0) {
        alert("Enter a valid duration");
        return;
      }

      staffArray[selectedStaffIndex].clockOut(
        Number(minutes),
        reason
      );
      populateStaffTable();

      updateDashboardCards();
      
      const modalElement = 
      document.getElementById("clockOutModal");

      const modal = 
      bootstrap.Modal.getInstance(modalElement);

      modal.hide();
});

function updateDashboardCards() {

    const staffIn = staffArray.filter(
        staff => staff.status === "In"
    ).length;

    const staffOut = staffArray.filter(
        staff => staff.status === "Out"
    ).length;

    const lateStaff = staffArray.filter(
        staff => staff.staffMemberIsLate
    ).length;

    const activeDeliveries = deliveryArray.length;

    document.getElementById("staffInCount").textContent = staffIn;

    document.getElementById("staffOutCount").textContent = staffOut;

    document.getElementById("lateStaffCount").textContent = lateStaff;

    document.getElementById("deliveryCount").textContent = activeDeliveries;
}
function showLateToast(staff){
    const container = document.getElementById("toastContainer");

    const now = new Date();
    const minutesLate =
    Math.floor((now - staff.expectedReturnTime) / 60000);

    const toastId = `toast-${staff.name}-${staff.surname}`;

    const toast = document.createElement("div");

    toast.className = "toast show text-bg-danger";
    toast.id = toastId;

    toast.innerHTML = `
    <div class="toast-header text-bg-danger">
      <img src="${staff.picture}" width="40" class="me-2">
      <strong>${staff.name} ${staff.surName}</strong><br>
      <button class="btn-close btn-close-white me-2 m-auto"
          onclick="this.closest('.toast').remove()"></button> 
      </div>
      <div class="toast-body">
      Staff member is late by <span class="late-time">${minutesLate}</span> minutes
         </div> 
    `;
    container.appendChild(toast);

    startLateTimer(staff, toastId);

}

function showDeliveryLateToast(driver){

    const container = document.getElementById("toastContainer");

    const toastId = `delivery-${driver.name}-${driver.surName}`;

    const toast = document.createElement("div");

    toast.className = "toast show text-bg-danger border-0";
    toast.id = toastId;

    toast.innerHTML = `
    <div class = "toast-header bg-danger text-white border-0">
    <strong>${driver.name} ${driver.surName} is late </strong>
    <button class="btn-close ms-auto"
    onclick="this.closest('.toast').remove()"></button>

    </div>

    <div class="toast-body">
    return time was ${driver.expectedReturnTime.toLocaleTimeString()}<br>
    Phone number: ${driver.telephone}<br>
    Address: ${driver.deliveryAdress}
    </div>
    `;
    container.appendChild(toast);
}

function startLateTimer(staff, toastId){
    const interval = setInterval(() => {

        const toast = document.getElementById(toastId);
        //stopping if toast is closed
        if (!toast) {
            clearInterval(interval);
            return;
        }
        if(staff.status !=="Out" || !staff.expectedReturnTime){
            clearInterval(interval);
            return;
        }

        const now = new Date();
        const minutesLate = 
        Math.floor((now - staff.expectedReturnTime) / 60000);

        const timeSpan = toast.querySelector(".late-time");

        if(timeSpan) {
            timeSpan.textContent = minutesLate;
        }
    }, 1000);
}

//Live update timer
setInterval(() => {
    staffArray.forEach(staff => {
        if (staffMemberIsLate(staff)) {
            showLateToast(staff);
        }
    });

    deliveryArray.forEach(driver =>{
        if(deliveryDriverIsLate(driver)) {
            showDeliveryLateToast(driver);
        }
    });
    filterStaff();
    populateDeliveryTable();
    updateDashboardCards();
}, 1000);

//DELIVERY

//Getting data and displaying from schedule delivery to deliveryboard
function addDelivery() {
    const vehicle = document.getElementById("vehicleInput").value;
    const name = document.getElementById("nameInput").value.trim();
    const surname = document.getElementById("surnameInput").value.trim();
    const telephone = document.getElementById("telephoneInput").value.trim();
    const address = document.getElementById("addressInput").value.trim();
    const returnTime = document.getElementById("returnTimeInput").value;

    if(!validateDelivery(vehicle, name, surname, telephone,address,returnTime)){
        return;
    }
    const driver = new DeliveryDriver(name, surname, vehicle, telephone, address);

    const today = new Date();
    const [hours, minutes] = returnTime.split(":").map(Number);

    const expectedReturnTime = new Date(today);
    expectedReturnTime.setHours(hours, minutes, 0,0);

    driver.expectedReturnTime = expectedReturnTime;
    driver.status = "Out for Delivery";


    deliveryArray.push(driver);

    populateDeliveryTable();
    
    updateDashboardCards();

    //Clear form
    document.getElementById("vehicleInput").value="";
    document.getElementById("nameInput").value = "";
    document.getElementById("surnameInput").value="";
    document.getElementById("telephoneInput").value="";
    document.getElementById("addressInput").value ="";
    document.getElementById("returnTimeInput").value="";
}

function validateDelivery(vehicle, name, surname, telephone, address, returnTime){

    const nameRegex = /^[A-Za-z\s]+$/;
    const surnameRegex = /^[A-Za-z\s]+$/;
    const addressRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9\s.,'-]+$/;
    const phoneRegex = /^[0-9]{7,}$/;

    if(!vehicle || !name || !surname || !telephone || !address || !returnTime) {
        alert("Please fill in all fields");
        return false;
    }

    if (!nameRegex.test(name)) {
    alert("Name must contain letters only.");
    return false;
}

//Surname validation
if(!surnameRegex.test(surname)) {
    alert("Surname must contain letters only.");
    return false;
}
//Telephone validation

if (!phoneRegex.test(telephone)) {
    alert("Telephone must contain at least 7 numbers.");
    return false;
}

//Address validation

if (!addressRegex.test(address)) {
    alert("Address must contain both text and a number.");
    return false;
}
return true;
}

function getVehicleIcon(vehicle){
    if (vehicle === "Car") {
        return '<i class="bi bi-car-front-fill vehicleIconDisplay"></i>';
    }
    if(vehicle === "Motorcycle") {
        return '<i class="bi bi-bicycle vehicleIconDisplay"></i>';
    }
    return "";
}

function populateDeliveryTable() {

    const tableBody = document.querySelector("#deliveryTable tbody");
    tableBody.innerHTML = "";

    deliveryArray.forEach((driver, index) => {

        const row = document.createElement("tr");

        if (driver.deliveryDriverIsLate) {
            row.classList.add("table-danger");
        }

        if(index === selectedDeliveryIndex) {
            row.classList.add("selected-row");
        }

        row.innerHTML = `
        <td>${getVehicleIcon(driver.vehicle)}</td>
        <td>${driver.name}</td>
        <td>${driver.surName}</td>
        <td>${driver.telephone}</td>
        <td>${driver.deliveryAdress}</td>
        <td>${driver.expectedReturnTime.toLocaleTimeString()}</td>
        `;
        row.addEventListener("click", () =>{
            if(selectedDeliveryIndex === index) {
                selectedDeliveryIndex = null;


            document.querySelectorAll("#deliveryTable tbody tr")
            .forEach(r => r.classList.remove("selected-row"));
            
            return;
            }
            selectedDeliveryIndex = index;

            document.querySelectorAll("#deliveryTable tbody tr")
            .forEach(r => r.classList.remove("selected-row"));

            row.classList.add("selected-row");
        });

        tableBody.appendChild(row);
    });
}

document
.getElementById("clearDeliveryBtn")
.addEventListener("click", () => {

    if (selectedDeliveryIndex === null) {
        alert("Select a delivery first");
        return;
    }

    const confirmDelete = confirm(
        "Are you sure you want to delete this delivery?"
    )
    if(!confirmDelete) return;


    deliveryArray.splice(selectedDeliveryIndex, 1);
    selectedDeliveryIndex = null;

    populateDeliveryTable();
    updateDashboardCards();
});

function digitalClock() {
    const now = new Date();

    const day = now.getDate();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const month = months[now.getMonth()];
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const formattedTime = 
    `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;

    document.getElementById("clockDisplay").textContent = formattedTime;
}

// Search functionality
document.getElementById("searchStaff").addEventListener("input", function() {

    currentSearch = this.value.toLowerCase().trim();

    filterStaff();
});

function filterStaff() {

    const filteredStaff = staffArray.filter(member =>

        member.name.toLowerCase().includes(currentSearch) ||

        member.surName.toLowerCase().includes(currentSearch)

    );

    populateStaffTable(filteredStaff);

}