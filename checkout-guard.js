// 1 Hour Session Timeout in milliseconds
const SESSION_DURATION = 60 * 60 * 1000;

// Check if user has an active session
function isUserLoggedIn() {
  const session = JSON.parse(localStorage.getItem('poshella_session'));
  if (!session || !session.loginTimestamp) return false;

  const now = new Date().getTime();
  const timeElapsed = now - session.loginTimestamp;

  if (timeElapsed < SESSION_DURATION) {
    return true; // Session valid
  } else {
    localStorage.removeItem('poshella_session'); // Session expired
    return false;
  }
}

// Function to handle checkout click
function handleCheckout(onSuccess) {
  if (isUserLoggedIn()) {
    onSuccess();
  } else {
    // Prompt customer for required login details
    const email = prompt("Please enter your Email Address to continue to checkout:");
    if (!email) {
      alert("Email is required to place an order.");
      return;
    }

    const phone = prompt("Please enter your Phone Number:");
    if (!phone) {
      alert("Phone number is required to place an order.");
      return;
    }

    // Save session for 1 hour
    const newSession = {
      email: email,
      phone: phone,
      loginTimestamp: new Date().getTime()
    };
    localStorage.setItem('poshella_session', JSON.stringify(newSession));

    alert("Account details saved! Proceeding to payment...");
    onSuccess();
  }
}
