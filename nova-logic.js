// ==========================================
// 1. GLOBAL STATES & PERSISTENCE
// ==========================================
let currentUser = JSON.parse(localStorage.getItem('novaUser')) || null;
let userWallet = 450.00; 
let sellerStrikes = 0;
let accessToken = localStorage.getItem('googleToken') || null;

// ==========================================
// 2. INITIALIZATION (Window Load)
// ==========================================
window.onload = () => {
    // 1. Sync User Profile
    if (currentUser) {
        setupProfile(currentUser.username);
        updateWalletUI();
        if (document.getElementById('displayUserName')) loadAccountInfo();
    }
    
    // 2. Security Check
    checkStrikes();
    
    // 3. Page Specific Logic
    if (document.getElementById('fullDesc')) loadProductDetails();
};

// ==========================================
// 3. AUTHENTICATION LOGIC (Fixed for Login.html)
// ==========================================

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('log-user').value;
    const pass = document.getElementById('log-pass').value;

    // Yahan hum filhal "dummy" verification kar rahe hain
    if (user.length < 3) return notify("Invalid Username");

    // Create user object
    const userData = { 
        username: user, 
        role: 'buyer', 
        isSeller: localStorage.getItem('isSeller') === 'true' // Check if previously a seller
    };

    // Save to LocalStorage
    localStorage.setItem('novaUser', JSON.stringify(userData));
    
    notify(`Welcome back, ${user}!`, true);
    
    // Redirect after a short delay
    setTimeout(() => { 
        window.location.href = "index.html"; 
    }, 1200);
}

function handleSignup(e) {
    e.preventDefault();
    const user = document.getElementById('reg-user').value;
    const role = document.getElementById('reg-role').value;
    const wa = document.getElementById('reg-wa').value;
    const pass = document.getElementById('reg-pass').value;

    // Check if seller linked Drive
    const gToken = localStorage.getItem('googleToken');
    if (role === 'seller' && !gToken) {
        return notify("Sellers must link Google Drive!");
    }

    // Save new user data
    const userData = { 
        username: user, 
        role: role, 
        whatsapp: wa,
        isSeller: (role === 'seller')
    };

    localStorage.setItem('novaUser', JSON.stringify(userData));
    if(role === 'seller') localStorage.setItem('isSeller', 'true');

    notify("Account Created Successfully!", true);

    setTimeout(() => { 
        window.location.href = "index.html"; 
    }, 1500);
}
// ==========================================
// 4. UI SYNC & ACCOUNT SETTINGS
// ==========================================
function updateWalletUI() {
    document.querySelectorAll('.wallet-balance').forEach(el => {
        el.innerText = userWallet.toFixed(2) + " NC";
    });
    const sBtn = document.getElementById('sellerBtn');
    if (currentUser?.isSeller && sBtn) sBtn.classList.remove('hidden');
}

function setupProfile(name) {
    const init = document.getElementById('nameInitial');
    if (init && name) init.innerText = name.charAt(0).toUpperCase();
}

function loadAccountInfo() {
    if (!currentUser) return;
    document.getElementById('displayUserName').innerText = currentUser.username;
    if (currentUser.isSeller) {
        const sBtn = document.getElementById('sellerStatusBtn');
        if (sBtn) {
            sBtn.innerText = "SELLER ACCOUNT ACTIVE";
            sBtn.classList.add('bg-green-500/10', 'text-green-500');
        }
    }
}

function updateProfileName() {
    const nameInput = document.getElementById('newNameInput').value;
    if (nameInput.trim().length < 3) return alert("Name too short!");
    currentUser.username = nameInput;
    localStorage.setItem('novaUser', JSON.stringify(currentUser));
    location.reload();
}

// ==========================================
// 5. MARKETPLACE & PRODUCT DETAILS
// ==========================================
function openProduct(title, id, lvl, actualPrice, discountedPrice, bundles, evo, desc, videoId, imageIdsArray) {
    const discountPercent = Math.round(((actualPrice - discountedPrice) / actualPrice) * 100);
    const data = {
        title, id, level: lvl, oldPrice: actualPrice, price: discountedPrice, 
        discount: discountPercent, bundles, evo, desc,
        driveVideoId: videoId || "",
        driveImageIds: imageIdsArray || [],
        uid: "UID-" + Math.floor(100000 + Math.random() * 900000)
    };
    localStorage.setItem('selectedProduct', JSON.stringify(data));
    window.location.href = 'iteminfo.html';
}

function loadProductDetails() {
    const data = JSON.parse(localStorage.getItem('selectedProduct'));
    if (!data) return;

    const setEl = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerHTML = val; };
    setEl('prodTitle', data.title);
    setEl('prodUID', data.uid);
    setEl('prodLvl', "LVL " + data.level);
    setEl('prodPrice', `${data.price} <span class="text-xs">NC</span>`);
    setEl('prodOldPrice', `${data.oldPrice} NC`);
    setEl('prodDiscount', `-${data.discount}%`);
    setEl('fullDesc', data.desc);
    
    const bBox = document.getElementById('prodBundles');
    if (bBox && data.bundles) {
        bBox.innerHTML = data.bundles.split(',').map(b => `<span class="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] uppercase font-bold text-yellow-500">${b.trim()}</span>`).join('');
    }
    
    const tStrip = document.getElementById('thumbStrip');
    if (tStrip) {
        tStrip.innerHTML = '';
        if (data.driveVideoId) addThumb("🎥", "video", data.driveVideoId, tStrip);
        data.driveImageIds.forEach(id => addThumb(`https://lh3.googleusercontent.com/d/${id}`, "image", id, tStrip));
        
        // Initial Media
        if (data.driveVideoId) switchMedia("video", data.driveVideoId);
        else if (data.driveImageIds.length) switchMedia("image", data.driveImageIds[0]);
    }
}

// ==========================================
// 6. GALLERY & UTILITIES
// ==========================================
function addThumb(src, type, id, container) {
    const div = document.createElement('div');
    div.className = "thumb";
    div.innerHTML = type === "video" ? `<div class="flex items-center justify-center h-full text-yellow-500 text-[8px] font-black">VIDEO</div>` : `<img src="${src}" class="w-full h-full object-cover">`;
    div.onclick = () => switchMedia(type, id, div);
    container.appendChild(div);
}

function switchMedia(type, id, el) {
    const mainImg = document.getElementById('mainImg');
    const videoBox = document.getElementById('videoBox');
    const videoFrame = document.getElementById('videoFrame');
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');

    if (type === "video") {
        mainImg?.classList.add('hidden');
        videoBox?.classList.remove('hidden');
        if(videoFrame) videoFrame.src = `https://drive.google.com/file/d/${id}/preview`;
    } else {
        videoBox?.classList.add('hidden');
        if(mainImg) {
            mainImg.classList.remove('hidden');
            mainImg.src = `https://lh3.googleusercontent.com/d/${id}`;
        }
    }
}

function notify(msg, success = false) {
    const side = document.getElementById('sideNotify');
    if (!side) return;
    side.innerText = msg;
    side.style.background = success ? "#22c55e" : "#ef4444";
    side.classList.add('show');
    setTimeout(() => side.classList.remove('show'), 3000);
}

function checkStrikes() {
    if (sellerStrikes >= 3) {
        document.body.innerHTML = `<div class="h-screen flex items-center justify-center bg-black text-red-500 font-black text-center"><h1>ACCOUNT BANNED<br>3 STRIKES REACHED</h1></div>`;
    }
}

function reportItem() {
    const res = prompt("Describe the issue with this ID:");
    if (res) alert("Report submitted successfully.");
}
// Marketplace mein products load karne ka function
function displayMarketplace() {
    const container = document.getElementById('idsContainer');
    if (!container) return;

    // LocalStorage se naye products uthayein
    const sellerIDs = JSON.parse(localStorage.getItem('marketIDs')) || [];
    
    // Agar koi naya product hai, toh use screen par add karein
    sellerIDs.forEach(item => {
        const div = document.createElement('div');
        div.className = "id-item bg-white/5 border border-white/10 rounded-3xl p-4 mb-4 relative overflow-hidden group";
        div.setAttribute('data-category', 'all');
        div.setAttribute('data-search', `${item.title} ${item.level}`);

        div.innerHTML = `
            <div class="flex gap-4 items-center">
                <div class="w-20 h-20 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20">
                    <img src="https://lh3.googleusercontent.com/d/${item.driveImageIds[0]}" class="w-full h-full object-cover rounded-2xl">
                </div>
                <div class="flex-1">
                    <h3 class="font-black italic text-lg text-yellow-500 uppercase">${item.title}</h3>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">LVL ${item.level}</span>
                        <span class="text-green-400 font-black text-sm">${item.price} NC</span>
                    </div>
                </div>
                <button onclick='openProduct("${item.title}", "MANUAL", "${item.level}", ${item.price}, ${item.price}, "${item.bundles}", "NONE", "${item.desc}", "${item.driveVideoId}", ${JSON.stringify(item.driveImageIds)})' 
                    class="bg-yellow-500 text-black p-3 rounded-2xl font-black text-xs uppercase shadow-lg">VIEW</button>
            </div>
        `;
        container.prepend(div); // Naya item sabse upar dikhayein
    });
}
// Marketplace Loader
function displayMarketplace() {
    const container = document.getElementById('idsContainer');
    if (!container) return;

    const marketData = JSON.parse(localStorage.getItem('marketIDs')) || [];
    
    marketData.forEach(item => {
        const div = document.createElement('div');
        div.className = "id-item bg-white/5 border border-white/10 rounded-3xl p-4 mb-4";
        
        // Google Drive Direct Image Link
        const thumb = item.driveImageIds.length > 0 
            ? `https://lh3.googleusercontent.com/u/0/d/${item.driveImageIds[0]}`
            : 'https://via.placeholder.com/150';

        div.innerHTML = `
            <div class="flex gap-4 items-center">
                <img src="${thumb}" class="w-20 h-20 object-cover rounded-2xl border border-white/10">
                <div class="flex-1">
                    <h3 class="font-black italic text-yellow-500 uppercase">${item.title}</h3>
                    <p class="text-[10px] text-gray-400">LVL ${item.level} • SELLER: ${item.seller}</p>
                    <p class="text-green-400 font-black mt-1">${item.price} NC</p>
                </div>
                <button onclick="viewIDDetails(${item.id})" class="bg-yellow-500 text-black px-4 py-2 rounded-xl font-black text-xs">VIEW</button>
            </div>
        `;
        container.prepend(div);
    });
}

// Ye function index.html par call hona chahiye
document.addEventListener('DOMContentLoaded', displayMarketplace);
// Example Card UI inside displayMarketplace()
div.innerHTML = `
    <div class="relative bg-white/5 border border-white/10 rounded-3xl p-4">
        <div class="absolute top-2 right-2 bg-yellow-500 text-black text-[8px] font-black px-2 py-1 rounded-full uppercase">
            ${item.evo} EVO GUNS
        </div>
        
        <div class="flex gap-4">
            <img src="https://lh3.googleusercontent.com/u/0/d/${item.driveImageIds[0]}" class="w-20 h-20 rounded-2xl object-cover">
            <div class="flex-1">
                <h3 class="font-black text-yellow-500 italic uppercase text-sm">${item.title}</h3>
                <p class="text-[9px] text-gray-400">Level ${item.level} | ${item.bundles}</p>
                <div class="mt-2 flex items-center gap-2">
                    <span class="text-xs line-through text-gray-500">${item.actualPrice} NC</span>
                    <span class="text-green-400 font-black text-lg">${item.price} NC</span>
                </div>
            </div>
        </div>
        <button onclick="viewProduct(${item.id})" class="w-full bg-white/10 mt-3 py-2 rounded-xl text-[10px] font-black uppercase">View Details</button>
    </div>
`;