// channels-player.js

// Initialize Plyr for the new player ID
const player = new Plyr('#channel-player', {
    // No specific options needed if you use default.
});

// Get elements for the channel list
const categoryTabsContainer = document.getElementById('category-tabs');
const channelGridContainer = document.getElementById('channel-grid-container');
const noChannelsMessage = document.getElementById('no-channels-message');
const channelVideoSource = document.getElementById('channel-video-source');
const channelPlayingTitle = document.getElementById('channel-playing-title');
const channelPlayingInfo = document.getElementById('channel-playing-info'); 

// Get the player wrapper element
const playerWrapper = document.querySelector('.player-wrapper');

let allChannelData = []; // To store all loaded channel data

// Function to load channel data from digital.json
async function loadChannelData() {
    try {
        const response = await fetch('./data/digital.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allChannelData = await response.json();
        renderCategories(allChannelData);

        if (allChannelData.length > 0) {
            const allButton = categoryTabsContainer.querySelector('button[data-category-type="all"]');
            if (allButton) {
                allButton.click();
            }
        }
        
        // กำหนดขนาดและจัดกึ่งกลาง player-wrapper ด้วย JavaScript
        setPlayerWrapperSize();
        // เพิ่ม event listener สำหรับ resize เพื่อปรับขนาดเมื่อหน้าจอเปลี่ยน
        window.addEventListener('resize', setPlayerWrapperSize);

    } catch (error) {
        console.error('Error loading channel data:', error);
        channelGridContainer.innerHTML = `<p style="text-align: center; color: red;">เกิดข้อผิดพลาดในการโหลดข้อมูลช่อง</p>`;
        noChannelsMessage.style.display = 'none';
    }
}

// Function to set player wrapper size and position
function setPlayerWrapperSize() {
    if (playerWrapper) {
        const screenWidth = window.innerWidth;
        let targetWidth = 700; // ค่าสูงสุดสำหรับ Desktop

        if (screenWidth <= 768 && screenWidth > 480) {
            targetWidth = screenWidth * 0.8; // 80% ของความกว้างหน้าจอ (ให้ตรงกับ width: 80vw ใน CSS)
        } else if (screenWidth <= 480) {
            targetWidth = screenWidth * 0.95; // 95% ของความกว้างหน้าจอ (ให้ตรงกับ width: 95vw ใน CSS)
        }

        playerWrapper.style.maxWidth = `${targetWidth}px`;
        playerWrapper.style.margin = '0 auto 10px'; 
    }
}


// Function to create category buttons
function renderCategories(data) {
    categoryTabsContainer.innerHTML = '';

    const homeBtn = document.createElement('button');
    homeBtn.innerHTML = `<svg width="20" height="20" fill="#5ab9ff" viewBox="0 0 24 24"><path d="M12 3l10 9h-3v9h-6v-6h-2v6H5v-9H2z"/></svg> ดูหนัง`;
    homeBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    categoryTabsContainer.appendChild(homeBtn);

    const allBtn = document.createElement('button');
    allBtn.textContent = 'ทั้งหมด';
    allBtn.dataset.categoryType = 'all';
    allBtn.classList.add('active');
    allBtn.addEventListener('click', () => {
        displayAllChannels();
        setActiveCategoryButton(allBtn);
    });
    categoryTabsContainer.appendChild(allBtn);

    data.forEach(categoryGroup => {
        const button = document.createElement('button');
        button.textContent = categoryGroup.category;
        button.addEventListener('click', () => {
            displayChannelsByCategory(categoryGroup.category);
            setActiveCategoryButton(button);
        });
        categoryTabsContainer.appendChild(button);
    });
}

// Function to set the active category button
function setActiveCategoryButton(activeButton) {
    const buttons = categoryTabsContainer.querySelectorAll('button');
    buttons.forEach(button => button.classList.remove('active'));
    activeButton.classList.add('active');
}

// Function to display all channels (across all categories)
function displayAllChannels() {
    channelGridContainer.innerHTML = '';
    let allChannels = [];
    allChannelData.forEach(categoryGroup => {
        allChannels = allChannels.concat(categoryGroup.channels);
    });
    renderChannelGrid(allChannels);
}

// Function to display channels by selected category
function displayChannelsByCategory(selectedCategory) {
    channelGridContainer.innerHTML = '';
    const categoryGroup = allChannelData.find(group => group.category === selectedCategory);
    if (categoryGroup && categoryGroup.channels.length > 0) {
        renderChannelGrid(categoryGroup.channels);
        noChannelsMessage.style.display = 'none';
    } else {
        noChannelsMessage.style.display = 'block';
    }
}

// Function to create channel items in the grid
function renderChannelGrid(channels) {
    if (channels.length === 0) {
        noChannelsMessage.style.display = 'block';
        return;
    }
    noChannelsMessage.style.display = 'none';

    channels.forEach(channel => {
        const channelItem = document.createElement('div');
        channelItem.classList.add('channel-item');
        channelItem.dataset.channelUrl = channel.url;

        channelItem.innerHTML = `
            <img src="${channel.image}" alt="${channel.name} logo" class="channel-logo">
            <div class="channel-name">${channel.name}</div>
        `;

        channelItem.addEventListener('click', () => {
            playChannel(channel.url, channel.name);
        });

        channelGridContainer.appendChild(channelItem);
    });
}

// Function to play a channel
function playChannel(url, channelName) {
    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' }); // **เพิ่มบรรทัดนี้**

    if (player.media.hls) {
        player.media.hls.destroy();
        player.media.hls = null;
    }

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(channelVideoSource.parentNode);
        player.media.hls = hls;
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            player.play();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            console.error('HLS.js error:', data);
            let errorMessage = 'เกิดข้อผิดพลาดในการเล่นช่อง';
            if (data.details) {
                errorMessage += `: ${data.details}`;
            }
            alert(errorMessage);
        });
    } else if (channelVideoSource.parentNode.canPlayType('application/vnd.apple.mpegurl')) {
        channelVideoSource.parentNode.src = url;
        player.play();
    } else {
        alert('เบราว์เซอร์ของคุณไม่รองรับการเล่นช่องรายการนี้');
    }
    channelPlayingTitle.textContent = channelName || 'กำลังเล่นช่อง...';
    channelPlayingInfo.textContent = "กำลังเล่นสด...";
}

// Load channel data when the DOM is ready
document.addEventListener('DOMContentLoaded', loadChannelData);