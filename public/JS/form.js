// Bootstrap Validation
(() => {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over forms to prevent submission without validation
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();

// ----------------------------------------------------------------------------
// Loading Feature
const loadBtn = document.getElementById('loadBtn');
const loadingIndicator = document.querySelector('.loading-indicator');
const inputFields = document.querySelectorAll('.input');

loadBtn.addEventListener('click', async (e) => {
  // Check if any input field is empty
  const isInputEmpty = Array.from(inputFields).some(input => input.value.trim() === '');

  if (!isInputEmpty) {
    // Show the loading indicator and hide the button
    loadingIndicator.style.display = 'block';
  }
});

// ----------------------------------------------------------------------------
// Original Image URL Preview
const currImage = document.querySelector("#image-preview");
const defaultImage = currImage.src;
currImage = null;

function previewImage(event) {
  const input = event.target;
  const preview = document.getElementById("image-preview");

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    // Display the selected image
    reader.onload = function(e) {
      preview.src = e.target.result;
    };

    reader.readAsDataURL(input.files[0]);
  } else {
    // Restore the previous image if no file is selected
    preview.src = defaultImage;
  }
}
