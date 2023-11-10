// Auto-dismiss alert functionality
document.addEventListener('DOMContentLoaded', function() {
  // Select the alert element
  let alert = document.querySelector("#autoDismissAlert");
  if (alert) {
    setTimeout(function() {
      alert.classList.add('autoDismissAlert');

      alert.addEventListener('transitionend', function() {
        alert.remove();
      });
    }, 5000);
  }
});

// ----------------------------------------------------------------------------
// Tax toggle functionality

// Select the tax switch element
let taxSwitch = document.getElementById("flexSwitchCheckDefault");

// Listen for a click event on the tax switch
taxSwitch.addEventListener("click", () => {
  // Select elements related to price and GST display
  let price = document.getElementsByClassName("card-price");
  let gst = document.getElementsByClassName("card-gst");
  let pricesView = document.getElementsByClassName("card-price-view");
  
  // Determine if tax is included based on the switch state
  let isTaxIncluded = taxSwitch.checked;

  // Iterate through elements and update price display
  for (let i = 0; i < pricesView.length; i++) {
    if (isTaxIncluded) {
      // Display price without GST
      pricesView[i].innerHTML = "₹" + parseInt(price[i].innerHTML).toLocaleString("en-IN") + "/night";
    } else {
      // Display price with GST
      pricesView[i].innerHTML = "₹" + (parseInt(price[i].innerHTML) + parseInt(gst[i].innerHTML)).toLocaleString("en-IN") + "/night <sup> (incl. 18% GST)";
    }
  }
});
// ----------------------------------------------------------------------------
