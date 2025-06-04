document.addEventListener("DOMContentLoaded", () => {
  // Set today's date as default
  const dateField = document.getElementById("date");
  if (dateField) {
    const today = new Date().toISOString().split("T")[0];
    dateField.value = today;
  }

  // Dynamically update quantity options based on selected food
  document.querySelectorAll('.food-select').forEach(select => {
    select.addEventListener('change', function () {
      const quantitySelectId = this.getAttribute('data-quantity');
      const quantitySelect = document.getElementById(quantitySelectId);
      if (!quantitySelect) return;

      quantitySelect.innerHTML = '';

      if (this.value === 'Rice') {
        quantitySelect.innerHTML = `
          <option value="Shared" data-price="0">Shared</option>
          <option value="Full" data-price="60">Full</option>
        `;
      } else if (this.value === 'No Food') {
        quantitySelect.innerHTML = `<option value="0" data-price="0" selected>No Food</option>`;
      } else {
        quantitySelect.innerHTML = `<option value="0" data-price="0" selected>No Food</option>`;
        for (let i = 1; i <= 10; i++) {
          quantitySelect.innerHTML += `<option value="${i}" data-price="${this.selectedOptions[0].getAttribute('data-price')}">${i}</option>`;
        }
      }
      // Trigger change to update totals
      quantitySelect.dispatchEvent(new Event('change'));
    });
  });

  // Calculate and display totals
  function calculateMealTotal(meal) {
    const foodSelect = document.querySelector(`select[name="${meal}-food"]`);
    const quantitySelect = document.querySelector(`select[name="${meal}-quantity"]`);
    const totalSpan = document.getElementById(`${meal}-total`);
    if (!foodSelect || !quantitySelect || !totalSpan) return 0;

    const selectedFood = foodSelect.options[foodSelect.selectedIndex];
    const selectedQuantity = quantitySelect.options[quantitySelect.selectedIndex];

    // Prefer price from quantity option if present (for Rice Full/Shared)
    let price = 0;
    if (selectedQuantity && selectedQuantity.getAttribute('data-price')) {
      price = parseInt(selectedQuantity.getAttribute('data-price')) || 0;
    } else {
      price = parseInt(selectedFood.getAttribute('data-price')) || 0;
    }

    // For "Shared" or "Full", treat as quantity 1
    let quantity = 1;
    if (!isNaN(parseInt(selectedQuantity.value))) {
      quantity = parseInt(selectedQuantity.value);
    }
    if (selectedQuantity.value === "0") price = 0; // No Food

    const total = price * quantity;
    totalSpan.textContent = `₹${total}`;
    return total;
  }

  function updateAllTotals() {
    const breakfast = calculateMealTotal('breakfast');
    const lunch = calculateMealTotal('lunch');
    const dinner = calculateMealTotal('dinner');
    const grandTotal = breakfast + lunch + dinner;
    const totalSpan = document.getElementById('total');
    if (totalSpan) totalSpan.textContent = `₹${grandTotal}`;
  }

  // Attach event listeners for totals
  ['breakfast', 'lunch', 'dinner'].forEach(meal => {
    const foodSelect = document.querySelector(`select[name="${meal}-food"]`);
    const quantitySelect = document.querySelector(`select[name="${meal}-quantity"]`);
    if (foodSelect) foodSelect.addEventListener('change', updateAllTotals);
    if (quantitySelect) quantitySelect.addEventListener('change', updateAllTotals);
  });

  // Initial calculation on page load
  updateAllTotals();

  // Form submission
  document.getElementById('mess-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Calculate totals for each meal
    const meals = ['breakfast', 'lunch', 'dinner'];
    const totals = {};

    meals.forEach(mealType => {
      const foodSelect = document.querySelector(`select[name="${mealType}-food"]`);
      const quantitySelect = document.querySelector(`select[name="${mealType}-quantity"]`);
      const selectedFood = foodSelect.options[foodSelect.selectedIndex];
      const selectedQuantity = quantitySelect.options[quantitySelect.selectedIndex];

      let price = 0;
      if (selectedQuantity && selectedQuantity.getAttribute('data-price')) {
        price = parseInt(selectedQuantity.getAttribute('data-price')) || 0;
      } else {
        price = parseInt(selectedFood.getAttribute('data-price')) || 0;
      }

      let quantity = 1;
      if (!isNaN(parseInt(selectedQuantity.value))) {
        quantity = parseInt(selectedQuantity.value);
      }
      if (selectedQuantity.value === "0") price = 0;

      totals[mealType] = price * quantity;
    });

    // Prepare form data
    const formData = new FormData(document.getElementById('mess-form'));
    formData.append('breakfast-total', totals.breakfast);
    formData.append('lunch-total', totals.lunch);
    formData.append('dinner-total', totals.dinner);
    formData.append('grand-total', totals.breakfast + totals.lunch + totals.dinner);

    // Send data to Google Apps Script
    const scriptURL = 'https://script.google.com/macros/s/AKfycbw0sYZwmYnQVF4BiZBsQHQj3Kfri54hqMLeyzkwqf6bdtYxPo0p2unvvdX9H9C6_m0uvQ/exec'; // Replace with your script URL
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
});