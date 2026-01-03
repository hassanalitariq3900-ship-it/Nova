// Central Data
let userWallet = 450.00;
let isSeller = true;

window.onload = () => {
    updateWalletUI();
    setupProfile("Hassan_Ali");
};

// LIVE AUTO SEARCH
function liveSearch() {
    const input = document.getElementById('idSearch').value.toLowerCase();
    const items = document.getElementsByClassName('id-item');
    const container = document.getElementById('idsContainer');
    const noResult = document.getElementById('noResult');
    let found = false;

    for (let i = 0; i < items.length; i++) {
        let searchData = items[i].getAttribute('data-search').toLowerCase();
        if (searchData.includes(input)) {
            items[i].style.display = "block";
            found = true;
        } else {
            items[i].style.display = "none";
        }
    }

    noResult.classList.toggle('hidden', found);
    container.classList.toggle('hidden', !found);
}

function updateWalletUI() {
    document.querySelectorAll('.wallet-balance').forEach(el => {
        el.innerText = userWallet.toFixed(2) + " NC";
    });
    if (isSeller) document.getElementById('sellerBtn')?.classList.remove('hidden');
}

function setupProfile(user) {
    const init = document.getElementById('nameInitial');
    if(init) init.innerText = user.charAt(0).toUpperCase();
}

function buyNow(name, oldP, newP) {
    const price = newP || oldP;
    if (userWallet >= price) {
        if(confirm(`Confirm ${price} NC Escrow for ${name}?`)) {
            userWallet -= price;
            updateWalletUI();
            alert("Sent to Escrow! Check your email for details.");
        }
    } else {
        alert("Inadequate NC! Please top up.");
    }
}
// Function to handle deletion from Drive and Marketplace
async function deleteProduct(fileId) {
    if(confirm("Are you sure? This will delete the video from your Google Drive too!")) {
        const token = localStorage.getItem('nova_drive_token');
        
        try {
            // 1. Google Drive se file delete karna
            await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                method: 'DELETE',
                headers: new Headers({ 'Authorization': 'Bearer ' + token })
            });

            alert("Deleted successfully from Drive and Nova!");
            // 2. Yahan apni list ko refresh karein
            location.reload();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Error deleting file!");
        }
    }
}

// Function to populate Modal for Editing
function editProduct(id) {
    document.getElementById('modalTitle').innerHTML = "Update <span class='text-yellow-500'>Listing</span>";
    document.getElementById('postModal').classList.remove('hidden');
    
    // In reality, fetch this ID data from your database/localStorage
    // and fill the input fields
    document.getElementById('id_title').value = "Example Sakura ID";
    document.getElementById('id_price').value = 1500;
}

function openModal() {
    document.getElementById('modalTitle').innerHTML = "Publish <span class='text-yellow-500'>New Product</span>";
    // Clear inputs
    document.querySelectorAll('.input-f').forEach(i => i.value = "");
    document.getElementById('postModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('postModal').classList.add('hidden');
}

// Save or Update function
function saveListing() {
    // Logic to either POST (new) or PATCH (update) 
    alert("Saving changes to marketplace...");
    closeModal();
}
// Seller Data Simulation
let sellerStrikes = 0; // Backend se aayega

// --- REPORT & STRIKE SYSTEM ---
function receiveReport(reason) {
    console.log("New report received for: " + reason);
    // Jab Admin report approve karega, tab strike count barhega
    sellerStrikes++;
    checkStrikes();
}

function checkStrikes() {
    const notice = document.getElementById('strikeNotice');
    const countText = document.getElementById('strikeCount');
    
    if (sellerStrikes > 0) {
        notice.classList.remove('hidden');
        countText.innerText = sellerStrikes;
        
        if (sellerStrikes >= 3) {
            alert("❌ ACCOUNT BANNED! You have reached 3 strikes due to fake listings.");
            document.body.innerHTML = "<h1 class='text-center mt-20 text-red-500 font-black'>YOUR SELLER ACCOUNT HAS BEEN PERMANENTLY SUSPENDED</h1>";
        } else {
            alert("⚠️ WARNING: You received a strike! Reason: Fake info or report. (Strikes: " + sellerStrikes + "/3)");
        }
    }
}

// --- PRODUCT MANAGEMENT ---
function openModal() {
    document.getElementById('postModal').classList.remove('hidden');
    document.getElementById('modalTitle').innerHTML = "Publish <span class='text-yellow-500'>New ID</span>";
}

function closeModal() {
    document.getElementById('postModal').classList.add('hidden');
}

function saveListing() {
    // Get values from inputs
    const title = document.getElementById('id_title').value;
    const uid = document.getElementById('id_uid').value;
    const desc = document.getElementById('id_desc').value;

    if(!title || !uid || !desc) {
        alert("Please fill all important fields including UID!");
        return;
    }

    alert("ID '" + title + "' (UID: " + uid + ") has been updated on the marketplace!");
    closeModal();
}

// Check strikes on load
window.onload = checkStrikes;
// Master Logic
function goToInfo(id) {
    // In real app, you fetch full data from your array/database
    const productData = {
        id: id,
        title: "Sakura Rare ID",
        uid: "56743321",
        level: 75,
        price: 1200,
        oldPrice: 1500,
        evo: "7 Evo Max",
        bundles: "Sakura, HipHop, Criminal",
        desc: "This is a very old rare account with all S1 items and max guns.",
        driveId: "YOUR_DRIVE_VIDEO_ID"
    };
    
    localStorage.setItem('selectedProduct', JSON.stringify(productData));
    window.location.href = 'iteminfo.html';
}

// Search Logic
function liveSearch() {
    let input = document.getElementById('idSearch').value.toLowerCase();
    let cards = document.getElementsByClassName('id-item');
    let found = false;

    for (let card of cards) {
        let text = card.getAttribute('data-search').toLowerCase();
        if (text.includes(input)) {
            card.style.display = "block";
            found = true;
        } else {
            card.style.display = "none";
        }
    }
    document.getElementById('noResult').classList.toggle('hidden', found);
}

// Category Button Toggle
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        // Yahan filtering logic tournaments ya 1NC ke liye aayega
    });
});