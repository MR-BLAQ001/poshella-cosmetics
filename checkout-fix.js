// ==========================================
// POSELLA CHECKOUT - REMEMBER DETAILS + TOTAL
// ==========================================

(function () {

    const DELIVERY_FEE = 1500;

    function getNumber(text) {
        const value = Number(
            String(text || "").replace(/[₦,\s]/g, "")
        );

        return Number.isFinite(value) ? value : 0;
    }

    // ------------------------------------------
    // REMEMBER DELIVERY DETAILS
    // ------------------------------------------

    function addRememberDetailsOption() {

        if (document.getElementById("rememberDeliveryDetails")) {
            return;
        }

        const addressInput = document.getElementById("custAddress");

        if (!addressInput || !addressInput.parentElement) {
            return;
        }

        const box = document.createElement("label");

        box.id = "rememberDeliveryDetailsBox";

        box.style.cssText = `
            display:flex;
            align-items:center;
            gap:10px;
            margin-top:14px;
            color:#aaa;
            font-size:14px;
            cursor:pointer;
        `;

        box.innerHTML = `
            <input
                type="checkbox"
                id="rememberDeliveryDetails"
                style="width:18px;height:18px;accent-color:#ff2f92;"
            >
            <span>Remember my delivery details</span>
        `;

        addressInput.parentElement.appendChild(box);

        const checkbox =
            document.getElementById("rememberDeliveryDetails");

        if (checkbox) {
            checkbox.addEventListener("change", function () {

                if (this.checked) {
                    saveDeliveryDetails();
                } else {
                    localStorage.removeItem(
                        "poshella_delivery_details"
                    );
                }
            });
        }
    }


    function saveDeliveryDetails() {

        const checkbox =
            document.getElementById("rememberDeliveryDetails");

        if (!checkbox || !checkbox.checked) {
            return;
        }

        const name =
            document.getElementById("custName")?.value.trim() || "";

        const phone =
            document.getElementById("custPhone")?.value.trim() || "";

        const address =
            document.getElementById("custAddress")?.value.trim() || "";

        const state =
            document.getElementById("custState")?.value || "";

        localStorage.setItem(
            "poshella_delivery_details",
            JSON.stringify({
                name: name,
                phone: phone,
                address: address,
                state: state
            })
        );
    }


    function loadDeliveryDetails() {

        const saved =
            localStorage.getItem("poshella_delivery_details");

        if (!saved) {
            return;
        }

        try {

            const details = JSON.parse(saved);

            const name =
                document.getElementById("custName");

            const phone =
                document.getElementById("custPhone");

            const address =
                document.getElementById("custAddress");

            const state =
                document.getElementById("custState");

            if (name && details.name) {
                name.value = details.name;
            }

            if (phone && details.phone) {
                phone.value = details.phone;
            }

            if (address && details.address) {
                address.value = details.address;
            }

            if (state && details.state) {
                state.value = details.state;
            }

            const checkbox =
                document.getElementById("rememberDeliveryDetails");

            if (checkbox) {
                checkbox.checked = true;
            }

        } catch (error) {

            console.error(
                "Could not load saved delivery details:",
                error
            );

        }
    }


    function attachDeliveryListeners() {

        const ids = [
            "custName",
            "custPhone",
            "custAddress",
            "custState"
        ];

        ids.forEach(function (id) {

            const element =
                document.getElementById(id);

            if (!element || element.dataset.rememberAttached) {
                return;
            }

            element.addEventListener("input", saveDeliveryDetails);
            element.addEventListener("change", saveDeliveryDetails);

            element.dataset.rememberAttached = "true";
        });
    }


    // ------------------------------------------
    // FIX CHECKOUT TOTAL
    // ------------------------------------------

    function refreshCheckoutTotal() {

        if (!Array.isArray(cart)) {
            return;
        }

        const subtotal =
            cart.reduce(function (sum, item) {

                const price =
                    Number(item.price) || 0;

                const qty =
                    Number(item.qty) || 0;

                return sum + (price * qty);

            }, 0);

        const grandTotal =
            subtotal + DELIVERY_FEE;

        const subtotalElement =
            document.getElementById("checkoutSubtotal");

        const grandTotalElement =
            document.getElementById("checkoutGrandTotal");

        if (subtotalElement) {

            subtotalElement.textContent =
                "₦" + subtotal.toLocaleString();
        }

        if (grandTotalElement) {

            grandTotalElement.textContent =
                "₦" + grandTotal.toLocaleString();
        }

        // If crypto is selected, let the crypto
        // script convert the restored total.
        const method =
            document.getElementById("selectedPaymentMethod")
            ?.textContent.trim();

        if (
            method === "Bitcoin (BTC)" ||
            method === "USDT"
        ) {

            if (typeof updatePoshellaCryptoTotal === "function") {
                updatePoshellaCryptoTotal(method);
            }
        }
    }


    // ------------------------------------------
    // SET EVERYTHING UP
    // ------------------------------------------

    function setupCheckoutFix() {

        addRememberDetailsOption();
        loadDeliveryDetails();
        attachDeliveryListeners();

        setTimeout(function () {

            addRememberDetailsOption();
            attachDeliveryListeners();
            refreshCheckoutTotal();

        }, 300);
    }


    // Wait until page is loaded
    window.addEventListener("load", function () {

        setupCheckoutFix();

        setTimeout(function () {
            refreshCheckoutTotal();
        }, 1000);

    });


    // Also refresh when DOM is ready
    window.addEventListener("DOMContentLoaded", function () {

        setupCheckoutFix();

        setTimeout(function () {
            refreshCheckoutTotal();
        }, 500);

    });


    // Recalculate whenever checkout is opened
    const originalSwitchView = window.switchView;

    if (typeof originalSwitchView === "function") {

        window.switchView = function (target) {

            originalSwitchView.apply(this, arguments);

            if (target === "checkout") {

                setTimeout(function () {

                    setupCheckoutFix();
                    refreshCheckoutTotal();

                }, 150);
            }
        };
    }

})();
