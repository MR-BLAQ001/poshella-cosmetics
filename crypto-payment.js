// =============================
// POSELLA LIVE CRYPTO PAYMENT
// =============================

const POSELLA_BTC_WALLET = "bc1q469m9nj0mqq8arjxf3w93gv2g34gjxjaehspjl";
const POSELLA_USDT_WALLET = "0x57606078262c6934296647DF565572A7CbedEcE3";

let poshellaCryptoRate = null;
let poshellaCryptoAmount = null;
let poshellaCryptoMethod = null;

async function getPoshellaCryptoRate(method) {
    const coinId = method === "Bitcoin (BTC)" ? "bitcoin" : "tether";

    const url =
        "https://api.coingecko.com/api/v3/simple/price" +
        "?ids=" + coinId +
        "&vs_currencies=ngn";

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Crypto rate request failed");
    }

    const data = await response.json();

    if (!data[coinId] || !data[coinId].ngn) {
        throw new Error("Crypto rate unavailable");
    }

    return Number(data[coinId].ngn);
}

function poshellaGetCheckoutTotalNaira() {
    const totalText =
        document.getElementById("checkoutGrandTotal")?.textContent || "₦0";

    const number = Number(
        totalText.replace(/[₦,\s]/g, "")
    );

    return Number.isFinite(number) ? number : 0;
}

async function updatePoshellaCryptoTotal(method) {
    if (
        method !== "Bitcoin (BTC)" &&
        method !== "USDT"
    ) {
        return;
    }

    const totalElement =
        document.getElementById("checkoutGrandTotal");

    if (!totalElement) return;

    const nairaTotal = poshellaGetCheckoutTotalNaira();

    if (nairaTotal <= 0) return;

    totalElement.textContent = "Updating rate...";

    try {
        const rate = await getPoshellaCryptoRate(method);

        poshellaCryptoRate = rate;
        poshellaCryptoMethod = method;

        const cryptoAmount = nairaTotal / rate;

        poshellaCryptoAmount = cryptoAmount;

        if (method === "Bitcoin (BTC)") {
            totalElement.textContent =
                cryptoAmount.toFixed(8) + " BTC";
        } else {
            totalElement.textContent =
                cryptoAmount.toFixed(2) + " USDT";
        }

    } catch (error) {
        console.error(error);

        totalElement.textContent =
            "Rate unavailable";

        showToast("Unable to get live crypto rate. Try again.");
    }
}


// Override payment-method selection
const originalSelectPaymentMethod = window.selectPaymentMethod;

window.selectPaymentMethod = async function(method) {

    const selected =
        document.getElementById("selectedPaymentMethod");

    const options =
        document.getElementById("paymentMethodOptions");

    const arrow =
        document.getElementById("paymentMethodArrow");

    const saveCheckbox =
        document.getElementById("savePaymentMethod");

    if (selected) {
        selected.textContent = method;
    }

    if (options) {
        options.style.display = "none";
    }

    if (arrow) {
        arrow.textContent = "⌄";
    }

    if (saveCheckbox && saveCheckbox.checked) {
        localStorage.setItem(
            "poshella_payment_method",
            method
        );
    }

    // Restore Naira for normal payment methods
    if (
        method === "Bank Transfer" ||
        method === "Cash on Delivery"
    ) {
        const totalElement =
            document.getElementById("checkoutGrandTotal");

        const subtotalText =
            document.getElementById("checkoutSubtotal")?.textContent
            || "₦0";

        const subtotal = Number(
            subtotalText.replace(/[₦,\s]/g, "")
        );

        const grandTotal = subtotal + 1500;

        if (totalElement) {
            totalElement.textContent =
                "₦" + grandTotal.toLocaleString();
        }

        return;
    }

    await updatePoshellaCryptoTotal(method);
};


// Create crypto payment screen
function showPoshellaCryptoPayment(method) {

    const oldScreen =
        document.getElementById("poshellaCryptoPaymentScreen");

    if (oldScreen) {
        oldScreen.remove();
    }

    const isBTC = method === "Bitcoin (BTC)";

    const wallet = isBTC
        ? POSELLA_BTC_WALLET
        : POSELLA_USDT_WALLET;

    const qrImage = isBTC
        ? "poshella_btc_qr.png"
        : "poshella_usdt_qr.png";

    const cryptoName = isBTC
        ? "Bitcoin (BTC)"
        : "USDT (Ethereum / ERC-20)";

    const amountText = isBTC
        ? poshellaCryptoAmount.toFixed(8) + " BTC"
        : poshellaCryptoAmount.toFixed(2) + " USDT";

    const screen = document.createElement("div");

    screen.id = "poshellaCryptoPaymentScreen";

    screen.innerHTML = `
        <div style="
            position:fixed;
            inset:0;
            z-index:99999;
            background:#0b0b0b;
            color:white;
            overflow-y:auto;
            padding:24px 18px 40px;
            font-family:Arial,sans-serif;
        ">

            <div style="
                max-width:520px;
                margin:0 auto;
            ">

                <button
                    type="button"
                    onclick="document.getElementById('poshellaCryptoPaymentScreen')?.remove()"
                    style="
                        background:none;
                        border:none;
                        color:#ff2f92;
                        font-size:17px;
                        padding:8px 0;
                        margin-bottom:15px;
                    "
                >
                    ← Back
                </button>

                <h2 style="
                    color:#ff2f92;
                    margin:0 0 8px;
                ">
                    Crypto Payment
                </h2>

                <p style="
                    color:#aaa;
                    margin-top:0;
                ">
                    Send exactly the amount below.
                </p>

                <div style="
                    background:#151515;
                    border:1px solid #333;
                    border-radius:16px;
                    padding:20px;
                    text-align:center;
                    margin-top:20px;
                ">

                    <div style="
                        color:#aaa;
                        font-size:14px;
                    ">
                        Amount to Pay
                    </div>

                    <div style="
                        color:#ff2f92;
                        font-size:28px;
                        font-weight:bold;
                        margin:8px 0 5px;
                        word-break:break-word;
                    ">
                        ${amountText}
                    </div>

                    <div style="
                        color:#777;
                        font-size:12px;
                    ">
                        Live market conversion
                    </div>

                </div>

                <div style="
                    background:#151515;
                    border-radius:16px;
                    padding:20px;
                    margin-top:18px;
                    text-align:center;
                ">

                    <div style="
                        font-weight:bold;
                        margin-bottom:15px;
                    ">
                        ${cryptoName}
                    </div>

                    <img
                        src="${qrImage}"
                        alt="${cryptoName} QR Code"
                        style="
                            width:min(280px,80vw);
                            max-width:100%;
                            border-radius:12px;
                            background:white;
                            padding:10px;
                        "
                    >

                </div>

                <div style="
                    background:#151515;
                    border-radius:16px;
                    padding:20px;
                    margin-top:18px;
                ">

                    <div style="
                        color:#aaa;
                        font-size:13px;
                        margin-bottom:8px;
                    ">
                        Wallet Address
                    </div>

                    <div
                        id="poshellaCryptoWallet"
                        style="
                            background:#0b0b0b;
                            border:1px solid #333;
                            border-radius:10px;
                            padding:14px;
                            word-break:break-all;
                            font-size:13px;
                            line-height:1.5;
                        "
                    >
                        ${wallet}
                    </div>

                    <button
                        type="button"
                        onclick="copyPoshellaWallet('${wallet}')"
                        style="
                            width:100%;
                            margin-top:12px;
                            padding:14px;
                            border:0;
                            border-radius:10px;
                            background:#ff2f92;
                            color:white;
                            font-size:16px;
                            font-weight:bold;
                        "
                    >
                        Copy Address
                    </button>

                </div>

                ${
                    !isBTC
                    ? `
                    <div style="
                        margin-top:15px;
                        padding:14px;
                        border-radius:10px;
                        background:#26151f;
                        color:#ff8fbd;
                        font-size:13px;
                        line-height:1.5;
                    ">
                        ⚠️ Send USDT using the
                        <strong>Ethereum / ERC-20 network only.</strong>
                    </div>
                    `
                    : ""
                }

                <div style="
                    margin-top:18px;
                    color:#888;
                    font-size:12px;
                    line-height:1.5;
                    text-align:center;
                ">
                    The crypto amount is calculated from the live market
                    rate when payment is initiated.
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(screen);
}


async function copyPoshellaWallet(wallet) {

    try {

        await navigator.clipboard.writeText(wallet);

        showToast("Wallet address copied!");

    } catch (error) {

        showToast("Copy failed. Please copy the address manually.");

    }
}


// Override Pay Now
window.triggerPaystackPayment = async function() {

    const name =
        document.getElementById("custName")?.value.trim();

    const phone =
        document.getElementById("custPhone")?.value.trim();

    const address =
        document.getElementById("custAddress")?.value.trim();

    if (!name || !phone || !address) {
        showToast("Please fill in your delivery details");
        return;
    }

    const method =
        document.getElementById("selectedPaymentMethod")
        ?.textContent.trim();

    if (
        method === "Bitcoin (BTC)" ||
        method === "USDT"
    ) {

        showToast("Getting live crypto rate...");

        try {

            const rate =
                await getPoshellaCryptoRate(method);

            const subtotalText =
                document.getElementById("checkoutSubtotal")
                ?.textContent || "₦0";

            const subtotal =
                Number(
                    subtotalText.replace(/[₦,\s]/g, "")
                );

            const total =
                subtotal + 1500;

            poshellaCryptoRate = rate;
            poshellaCryptoMethod = method;

            poshellaCryptoAmount =
                total / rate;

            showPoshellaCryptoPayment(method);

        } catch (error) {

            console.error(error);

            showToast(
                "Live crypto rate unavailable. Please try again."
            );
        }

        return;
    }

    showToast(
        "Paystack is not connected yet for this payment method."
    );
};


// Refresh saved crypto method after page load
window.addEventListener("load", function() {

    setTimeout(function() {

        const method =
            document.getElementById("selectedPaymentMethod")
            ?.textContent.trim();

        if (
            method === "Bitcoin (BTC)" ||
            method === "USDT"
        ) {
            updatePoshellaCryptoTotal(method);
        }

    }, 1000);

});
