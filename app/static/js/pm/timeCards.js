document.addEventListener('DOMContentLoaded', async () => {
  const workerSelect = document.getElementById('workerSelect');
  const dateSelect = document.getElementById('dateSelect');
  const viewTimeCardButton = document.getElementById('viewTimeCardButton');
  const timeCardResults = document.getElementById('timeCardResults');

  // Fetch workers and populate the dropdown
  async function fetchWorkers() {
    try {
      const response = await fetch('/getAllWorkerUsers');
      if (!response.ok) throw new Error('Failed to fetch workers');
      const workers = await response.json();
      workers.forEach(worker => {
        console.log(worker);
        const option = document.createElement('option');
        option.value = worker.UUID;
        option.textContent = worker.username;
        workerSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  }

  // Fetch and display the time card for the selected worker and date
  async function fetchTimeCard() {
    const workerUUID = workerSelect.value;
    const selectedDate = dateSelect.value;

    if (!workerUUID || !selectedDate) {
      timeCardResults.textContent = 'Please select both a worker and a date.';
      return;
    }

    try {
      const response = await fetch(`/getTimeCard?workerUUID=${workerUUID}&date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch time card');
      const data = await response.json();

      if (data.success) {
        timeCardResults.innerHTML = `
            <h2>TimeCard for ${data.username} on ${selectedDate}</h2>
            <ul>
                ${data.entries.map(entry => `
                    <li>
                        <strong>Entered:</strong> ${entry.entered} <br>
                        <strong>Exited:</strong> ${entry.exited}
                    </li>
                `).join('')}
            </ul>
        `;
    } else {
        timeCardResults.textContent = 'No time card data available for the selected worker and date.';
    }
    } catch (error) {
      console.error('Error fetching time card:', error);
      timeCardResults.textContent = 'Error fetching time card data.';
    }
  }

  // Initialize the page
  await fetchWorkers();
  viewTimeCardButton.addEventListener('click', fetchTimeCard);
});