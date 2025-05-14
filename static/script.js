    document.addEventListener("DOMContentLoaded", () => {
      const dateField = document.getElementById("date");
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
      dateField.value = today; // Set the value of the date field
    });
  
    // Automatically set quantity to 1 when a food item is selected
    document.querySelectorAll('.food-select').forEach(select => {
      select.addEventListener('change', function () {
        const quantitySelectId = this.getAttribute('data-quantity');
        const quantitySelect = document.getElementById(quantitySelectId);
  
        // Automatically set quantity to 1 when a food item is selected
        if (this.value !== '' && this.value !== 'No Food') {
          quantitySelect.value = 1;
        } else {
          quantitySelect.value = 0; // Set to 0 if "No Food" is selected
        }
      });
    });
    document.querySelectorAll('.food-select').forEach(select => {
  select.addEventListener('change', function () {
    const quantitySelectId = this.getAttribute('data-quantity');
    const quantitySelect = document.getElementById(quantitySelectId);

    // Clear existing quantity options
    quantitySelect.innerHTML = '';

    if (this.value === 'Rice') {
      // Add Shared and Full options for Rice
      quantitySelect.innerHTML = `
        <option value="Shared" selected>Shared</option>
        <option value="Full">Full</option>
      `;
    } else if (this.value === 'No Food') {
      // Add No Food option
      quantitySelect.innerHTML = `
        <option value="0" selected>No Food</option>
      `;
    } else {
      // Add default quantity options for other foods
      for (let i = 1; i <= 10; i++) {
        quantitySelect.innerHTML += `<option value="${i}">${i}</option>`;
      }
    }
  });
});

// Submit form data to Google Apps Script
const scriptURL = "https://script.google.com/macros/s/AKfycbwjCu4SvCcV6IaeDSa_ZVmoZj96b8hAO8xolBikyBMIsiChUkr1Mx0eh0kGbHMGztBL9Q/exec";
const form = document.forms["mess-form"];
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  // Send data to Google Apps Script
  /*fetch(scriptURL, { method: "POST", body: formData })
    .then((response) => {
      swal("Done", "Submitted Successfully.", "success");
    })
    .catch((error) => {
      swal("Error", "Something went wrong. Please try again!", "error");
    });*/
});
document.querySelectorAll('.food-select, .quantity-select').forEach(element => {
  element.addEventListener('change', () => {
    // Get the meal type (breakfast, lunch, or dinner)
    const mealType = element.name.split('-')[0];

    // Get the selected food and quantity
    const foodSelect = document.querySelector(`select[name="${mealType}-food"]`);
    const quantitySelect = document.querySelector(`select[name="${mealType}-quantity"]`);
    const totalSpan = document.getElementById(`${mealType}-total`);

    const selectedFood = foodSelect.options[foodSelect.selectedIndex];
    const price = parseInt(selectedFood.getAttribute('data-price')) || 0;
    const quantity = parseInt(quantitySelect.value) || 0;

    // Calculate the total
    const total = price * quantity;

    // Display the total
    totalSpan.textContent = `₹${total}`;
  });
});

// Add event listener to the form submission
document.getElementById('mess-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  // Calculate totals for each meal
  const meals = ['breakfast', 'lunch', 'dinner'];
  const totals = {};

  meals.forEach(mealType => {
    const foodSelect = document.querySelector(`select[name="${mealType}-food"]`);
    const quantitySelect = document.querySelector(`select[name="${mealType}-quantity"]`);

    const selectedFood = foodSelect.options[foodSelect.selectedIndex];
    const price = parseInt(selectedFood.getAttribute('data-price')) || 0;
    const quantity = parseInt(quantitySelect.value) || 0;

    totals[mealType] = price * quantity;
  });

  // Prepare form data
  const formData = new FormData(document.getElementById('mess-form'));
  formData.append('breakfast-total', totals.breakfast);
  formData.append('lunch-total', totals.lunch);
  formData.append('dinner-total', totals.dinner);
  formData.append('grand-total', totals.breakfast + totals.lunch + totals.dinner);

  // Send data to Google Apps Script
  const scriptURL = 'https://script.google.com/macros/s/AKfycbwjCu4SvCcV6IaeDSa_ZVmoZj96b8hAO8xolBikyBMIsiChUkr1Mx0eh0kGbHMGztBL9Q/exec'; // Replace with your script URL
  try {
    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (result.status === 'success') {
      Swal.fire('Success', 'Data submitted successfully!', 'success');
    } else {
      Swal.fire('Error', result.message, 'error');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to submit data. Please try again.', 'error');
  }
});
function calculateMealTotal(meal) {
  const foodSelect = document.querySelector(`select[name="${meal}-food"]`);
  const quantitySelect = document.querySelector(`select[name="${meal}-quantity"]`);
  const totalSpan = document.getElementById(`${meal}-total`);
  if (!foodSelect || !quantitySelect || !totalSpan) return 0;

  const selectedFood = foodSelect.options[foodSelect.selectedIndex];
  const price = parseInt(selectedFood?.getAttribute('data-price')) || 0;
  const quantity = parseInt(quantitySelect.value) || 0;
  const total = price * quantity;
  totalSpan.textContent = `₹${total}`;
  return total;
}

function updateAllTotals() {
  const breakfast = calculateMealTotal('breakfast');
  const lunch = calculateMealTotal('lunch');
  const dinner = calculateMealTotal('dinner');
  const grandTotal = breakfast + lunch + dinner;
  document.getElementById('total').textContent = `₹${grandTotal}`;
}

// Attach event listeners
['breakfast', 'lunch', 'dinner'].forEach(meal => {
  document.querySelector(`select[name="${meal}-food"]`).addEventListener('change', updateAllTotals);
  document.querySelector(`select[name="${meal}-quantity"]`).addEventListener('change', updateAllTotals);
});

// Initial calculation on page load
updateAllTotals();