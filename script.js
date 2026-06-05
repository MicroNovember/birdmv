// ==================== ข้อมูลเริ่มต้นและตัวแปร ====================
        const DEFAULT_PLAYLISTS = [
            { name: "BeritaSelatan", url: "https://raw.githubusercontent.com/BeritaSelatan/MalayINDO/main/Tvalha" },
            { name: "Thai Public M3U", url: "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/th.m3u" },   // stable fallback
            { name: "sugus32", url: "https://raw.githubusercontent.com/sugus320/sugus320tv/refs/heads/main/DJTON-iPTVPlus.m3u" },
            { name: "cattv976", url: "https://raw.githubusercontent.com/cattv976/iptv/refs/heads/main/cattv.m3u" },
            { name: "CricHd", url: "https://raw.githubusercontent.com/abusaeeidx/CricHd-playlists-Auto-Update-permanent/refs/heads/main/ALL.m3u" },
            { name: "warungtvbox", url: "https://raw.githubusercontent.com/warungtvbox/lokal/refs/heads/main/playlist2022" }
        ];
        let playlists = [];
        let allChannels = [];
        let pcFileCache = null;
        let currentMode = 'online';
        let activePlaylistIdx = 0;
        let currentView = 'list';
        const logoGradients = ['from-amber-600 to-orange-700', 'from-cyan-600 to-blue-700', 'from-purple-600 to-indigo-700', 'from-emerald-600 to-teal-700'];

        function initPlaylists() {
            const saved = localStorage.getItem('jw_iptv_playlists');
            if (saved) playlists = JSON.parse(saved);
            else playlists = [...DEFAULT_PLAYLISTS];
            localStorage.setItem('jw_iptv_playlists', JSON.stringify(playlists));
            renderQuickBar();
            renderModalList();
            if(playlists.length > 0 && !pcFileCache) {
                fetchM3U(playlists[0].url, playlists[0].name, 0);
            }
        }

        function renderQuickBar() {
            const bar = document.getElementById('quickPlaylistBar');
            bar.innerHTML = '';
            playlists.forEach((pl, idx) => {
                const btn = document.createElement('button');
                btn.id = `pl-btn-${idx}`;
                btn.className = `px-2 py-1.5 bg-slate-800/70 hover:bg-slate-700 text-slate-300 font-medium rounded-lg border border-slate-700 text-[11px] transition whitespace-nowrap cursor-pointer`;
                btn.innerText = pl.name;
                btn.onclick = () => {
                    currentMode = 'online';
                    activePlaylistIdx = idx;
                    fetchM3U(pl.url, pl.name, idx);
                };
                bar.appendChild(btn);
            });
            if(pcFileCache) {
                const divider = document.createElement('span');
                divider.className = "text-slate-600 text-[9px] mx-1 self-center";
                divider.innerText = "|";
                bar.appendChild(divider);
                const pcBtn = document.createElement('button');
                pcBtn.id = "pc-file-btn";
                pcBtn.className = "px-2 py-1.5 bg-slate-800/70 hover:bg-slate-700 text-blue-400 font-medium rounded-lg border border-slate-700 text-[11px] transition whitespace-nowrap cursor-pointer";
                pcBtn.innerText = `💻 ${pcFileCache.name}`;
                pcBtn.onclick = () => {
                    currentMode = 'offline';
                    activateOfflineFile();
                };
                bar.appendChild(pcBtn);
            }
            document.querySelectorAll('#quickPlaylistBar button').forEach(btn => {
                btn.classList.remove('bg-amber-600', 'text-slate-950', 'border-amber-500');
                btn.classList.add('bg-slate-800/70', 'text-slate-300');
            });
            if(currentMode === 'online') {
                const activeBtn = document.getElementById(`pl-btn-${activePlaylistIdx}`);
                if(activeBtn) {
                    activeBtn.classList.remove('bg-slate-800/70', 'text-slate-300');
                    activeBtn.classList.add('bg-amber-600', 'text-slate-950', 'border-amber-500');
                }
                document.getElementById('activeSourceBadge').innerText = 'คลังออนไลน์';
            } else if(currentMode === 'offline' && pcFileCache) {
                const pcBtn = document.getElementById('pc-file-btn');
                if(pcBtn) {
                    pcBtn.classList.remove('bg-slate-800/70', 'text-blue-400');
                    pcBtn.classList.add('bg-blue-600', 'text-white', 'border-blue-400');
                }
                document.getElementById('activeSourceBadge').innerText = 'ไฟล์ในเครื่อง';
            }
        }

        async function fetchM3U(url, name, idx) {
            currentMode = 'online';
            activePlaylistIdx = idx;
            document.getElementById('currentLoadedPlaylistName').innerText = name;
            document.getElementById('playlistContainer').innerHTML = '<div class="text-center text-amber-400 text-[10px] mt-8 animate-pulse">กำลังโหลด...</div>';
            renderQuickBar();
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('HTTP '+response.status);
                const text = await response.text();
                parseM3U(text, name);
            } catch(e) {
                document.getElementById('playlistContainer').innerHTML = `<div class="text-center p-3 text-red-400 text-[10px]">❌ โหลดผิดพลาด: ${e.message}</div>`;
            }
        }

        function parseM3U(data, playlistName) {
            const lines = data.split('\n');
            const channels = [];
            let currentName = "", currentLogo = "", currentKeyId = "", currentKey = "";
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (line.startsWith('#EXTINF:')) {
                    const logoMatch = line.match(/tvg-logo=["']([^"']+)["']/i);
                    currentLogo = logoMatch ? logoMatch[1] : "";
                    const commaIndex = line.indexOf(',');
                    currentName = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : "";
                } else if (line.includes('#KODIPROP:inputstream.adaptive.license_key=')) {
                    const keyData = line.replace('#KODIPROP:inputstream.adaptive.license_key=', '').trim();
                    if (keyData.includes(':')) {
                        const parts = keyData.split(':');
                        currentKeyId = parts[0];
                        currentKey = parts[1];
                    }
                } else if (line.startsWith('http')) {
                    channels.push({
                        name: currentName || `ช่อง ${channels.length+1}`,
                        logo: currentLogo,
                        url: line,
                        keyId: currentKeyId,
                        key: currentKey,
                        drm: !!(currentKeyId && currentKey)
                    });
                    currentName = ""; currentLogo = ""; currentKeyId = ""; currentKey = "";
                }
            }
            allChannels = channels;
            document.getElementById('channelCount').innerText = allChannels.length;
            renderChannels(allChannels);
            if(allChannels.length > 0) playStream(allChannels[0], null);
            if(playlistName) document.getElementById('currentLoadedPlaylistName').innerText = playlistName;
        }

        function renderChannels(channels) {
            const container = document.getElementById('playlistContainer');
            container.innerHTML = "";
            if(channels.length === 0) {
                container.innerHTML = '<div class="text-center text-slate-500 text-[10px] mt-8">ไม่พบรายการช่อง</div>';
                return;
            }
            
            if (currentView === 'grid') {
                const gridDiv = document.createElement('div');
                gridDiv.className = 'channels-grid';
                channels.forEach((ch, index) => {
                    const gridItem = document.createElement('div');
                    gridItem.className = 'channel-grid-item';
                    gridItem.onclick = () => playStream(ch, gridItem);
                    let logoHtml = `<div class="channel-grid-logo"><span class="text-xs font-mono">${String(index+1).slice(-2)}</span></div>`;
                    if(ch.logo && ch.logo.trim() !== '') {
                        logoHtml = `<div class="channel-grid-logo"><img src="${ch.logo}" class="w-full h-full object-contain p-0.5" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\'text-xs font-mono\'>${String(index+1).slice(-2)}</span>'"></div>`;
                    }
                    gridItem.innerHTML = `
                        ${logoHtml}
                        <div class="channel-grid-name">${escapeHtml(ch.name)}</div>
                        ${ch.drm ? '<span class="text-[7px] bg-amber-500/20 text-amber-400 px-1 rounded-full mt-0.5">DRM</span>' : ''}
                    `;
                    gridDiv.appendChild(gridItem);
                });
                container.appendChild(gridDiv);
            } else {
                const listDiv = document.createElement('div');
                listDiv.className = 'channels-list';
                channels.forEach((ch, index) => {
                    const item = document.createElement('div');
                    item.className = 'channel-list-item';
                    item.onclick = () => playStream(ch, item);
                    let logoHtml = `<div class="channel-list-logo"><span class="text-[10px] font-mono">${String(index+1).slice(-2)}</span></div>`;
                    if(ch.logo && ch.logo.trim() !== '') {
                        logoHtml = `<div class="channel-list-logo"><img src="${ch.logo}" class="w-full h-full object-contain p-0.5" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\'text-[10px] font-mono\'>${String(index+1).slice(-2)}</span>'"></div>`;
                    }
                    item.innerHTML = `
                        ${logoHtml}
                        <div class="channel-list-name">${escapeHtml(ch.name)}</div>
                        ${ch.drm ? '<span class="text-[8px] bg-amber-500/20 text-amber-400 px-1 rounded-full flex-shrink-0">DRM</span>' : ''}
                    `;
                    listDiv.appendChild(item);
                });
                container.appendChild(listDiv);
            }
        }

        function escapeHtml(str) { return str.replace(/[&<>]/g, function(m){if(m==='&')return '&amp;';if(m==='<')return '&lt;';if(m==='>')return '&gt;';return m;}); }

        function playStream

        function loadOfflineFile(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                pcFileCache = { name: file.name, content: e.target.result };
                currentMode = 'offline';
                renderQuickBar();
                activateOfflineFile();
            };
            reader.readAsText(file);
        }
        function activateOfflineFile() {
            if(!pcFileCache) return;
            document.getElementById('currentLoadedPlaylistName').innerText = `📁 ${pcFileCache.name}`;
            parseM3U(pcFileCache.content, pcFileCache.name);
            renderQuickBar();
        }
        function filterChannels() {
            const query = document.getElementById('searchBox').value.toLowerCase();
            const filtered = allChannels.filter(c => c.name.toLowerCase().includes(query));
            renderChannels(filtered);
        }

        function setView(view) {
            currentView = view;
            const listBtn = document.getElementById('viewListBtn');
            const gridBtn = document.getElementById('viewGridBtn');
            if (view === 'list') {
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
            } else {
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
            }
            const query = document.getElementById('searchBox').value.toLowerCase();
            const filtered = allChannels.filter(c => c.name.toLowerCase().includes(query));
            renderChannels(filtered);
        }

        function renderModalList() {
            const container = document.getElementById('modalPlaylistList');
            container.innerHTML = '';
            if(playlists.length===0) { container.innerHTML='<div class="text-center text-slate-500 text-xs py-4">ไม่มีรายการ</div>'; return; }
            playlists.forEach((pl, idx) => {
                const div = document.createElement('div');
                div.className = "bg-slate-950 border border-slate-800 p-2 rounded-lg flex justify-between items-center";
                div.innerHTML = `
                    <div class="min-w-0 flex-grow">
                        <p class="font-bold text-amber-500 truncate text-xs">${escapeHtml(pl.name)}</p>
                        <p class="text-[9px] text-slate-500 truncate font-mono">${escapeHtml(pl.url)}</p>
                    </div>
                    <div class="flex gap-1">
                        <button data-edit="${idx}" class="edit-pl text-[9px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-md text-blue-400">แก้ไข</button>
                        <button data-del="${idx}" class="del-pl text-[9px] bg-slate-800 hover:bg-red-950 px-2 py-1 rounded-md text-red-400">ลบ</button>
                    </div>
                `;
                container.appendChild(div);
            });
            document.querySelectorAll('.edit-pl').forEach(btn => btn.addEventListener('click', (e) => editPlaylist(parseInt(btn.dataset.edit))));
            document.querySelectorAll('.del-pl').forEach(btn => btn.addEventListener('click', (e) => deletePlaylist(parseInt(btn.dataset.del))));
        }
        function savePlaylist() {
            const name = document.getElementById('plName').value.trim();
            const url = document.getElementById('plUrl').value.trim();
            const editIndex = parseInt(document.getElementById('editIndex').value);
            if(!name || !url) return alert('กรุณากรอกให้ครบ');
            if(editIndex === -1) playlists.push({ name, url });
            else playlists[editIndex] = { name, url };
            localStorage.setItem('jw_iptv_playlists', JSON.stringify(playlists));
            initPlaylists();
            resetForm();
            toggleManager(false);
        }
        function editPlaylist(idx) {
            document.getElementById('editIndex').value = idx;
            document.getElementById('plName').value = playlists[idx].name;
            document.getElementById('plUrl').value = playlists[idx].url;
            document.getElementById('savePlaylistBtn').innerHTML = '💾 อัปเดต';
            document.getElementById('cancelEditBtn').classList.remove('hidden');
        }
        function deletePlaylist(idx) {
            if(confirm(`ลบ ${playlists[idx].name}?`)) {
                playlists.splice(idx,1);
                localStorage.setItem('jw_iptv_playlists', JSON.stringify(playlists));
                initPlaylists();
                resetForm();
            }
        }
        function resetForm() {
            document.getElementById('editIndex').value = '-1';
            document.getElementById('plName').value = '';
            document.getElementById('plUrl').value = '';
            document.getElementById('savePlaylistBtn').innerHTML = '➕ บันทึก';
            document.getElementById('cancelEditBtn').classList.add('hidden');
        }
        function toggleManager(forceClose) {
            const modal = document.getElementById('playlistManagerModal');
            if(forceClose === false) modal.classList.add('hidden');
            else modal.classList.toggle('hidden');
            if(!modal.classList.contains('hidden')) renderModalList();
        }

        document.getElementById('offlineFile').addEventListener('change', loadOfflineFile);
        document.getElementById('openManagerBtn').addEventListener('click', () => toggleManager());
        document.getElementById('closeModalBtn').addEventListener('click', () => toggleManager(false));
        document.getElementById('savePlaylistBtn').addEventListener('click', savePlaylist);
        document.getElementById('cancelEditBtn').addEventListener('click', resetForm);
        document.getElementById('searchBox').addEventListener('input', filterChannels);
        document.getElementById('playlistManagerModal').addEventListener('click', (e) => { if(e.target === document.getElementById('playlistManagerModal')) toggleManager(false); });
        document.getElementById('viewListBtn').addEventListener('click', () => setView('list'));
        document.getElementById('viewGridBtn').addEventListener('click', () => setView('grid'));

        initPlaylists();