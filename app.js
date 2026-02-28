
// App Logic
document.addEventListener('DOMContentLoaded', () => {
    // Check if Panchang is loaded
    if (typeof Panchang === 'undefined') {
        alert("Library not loaded! Check console.");
        return;
    }

    // Default Location (Malappuram)
    let lat = 11.07;
    let lon = 76.28;
    const p = new Panchang({ lat, lon });

    // UI Elements
    const dateInput = document.getElementById('dateInput');
    const todayBtn = document.getElementById('todayBtn');

    // Tab Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Init Date Input
    const setToday = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
        updateUI(now);
    };

    // Event Listeners
    dateInput.addEventListener('change', (e) => {
        const dateStr = e.target.value;
        if (dateStr) {
            // Need to set hours to noon to avoid timezone shift dropping it to previous day
            const selectedDate = new Date(dateStr);
            selectedDate.setHours(12, 0, 0, 0);
            updateUI(selectedDate);
        }
    });

    todayBtn.addEventListener('click', setToday);

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Deactivate all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate Clicked
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Helper: Update UI
    function updateUI(date) {
        if (!date || isNaN(date.getTime())) return;

        // Update Header Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDateStr').innerText = date.toLocaleDateString('en-GB', options);

        // Core Calc
        const res = p.calculate(date);

        // MAIN CARD
        document.getElementById('malMonth').innerText = res.Malayalam.month;
        document.getElementById('malDay').innerText = res.Malayalam.date;
        document.getElementById('malYear').innerText = `കൊല്ലവർഷം ${res.Malayalam.year}`;

        // NAKSHATRA
        document.getElementById('nakshatra').innerText = res.Nakshatra.name;

        // Construct Times string
        let timeStr = "";
        if (res.DayNakshatras && res.DayNakshatras.length > 0) {
            // Find current
            const cur = res.DayNakshatras.find(n => n.name === res.Nakshatra.name.split(' ')[0]); // Handle ' & ' split if needed? 
            // Just show the first ended time or all?
            // Let's show "Ends at HH:MM" for current

            // If the name is "No Nat" or combined, logic gets complex.
            // Simplified: Show End Time of the primary star.
            if (res.Nakshatra.end) {
                const time = res.Nakshatra.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                timeStr = `${time} വരെ`;
            }
        }
        document.getElementById('nakTimes').innerText = timeStr;


        // GRID INFO
        document.getElementById('tithi').innerText = res.Tithi.name;
        // Tithi end time as subvalue
        const tithiEndEl = document.getElementById('tithiEnd');
        if (tithiEndEl && res.Tithi && res.Tithi.end) {
            const tEnd = res.Tithi.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            tithiEndEl.innerText = `${tEnd} വരെ`;
        } else if (tithiEndEl) {
            tithiEndEl.innerText = '';
        }
        document.getElementById('weekday').innerText = res.Day.name;
        document.getElementById('sunrise').innerText = res.SunTimes.sunrise;
        document.getElementById('sunset').innerText = res.SunTimes.sunset;

        // TIMINGS
        if (res.Timings) {
            document.getElementById('rahukalam').innerText = res.Timings.Rahukalam;
            document.getElementById('yamagandam').innerText = res.Timings.Yamagandam;
            document.getElementById('gulika').innerText = res.Timings.Gulika;
        }

        // DAY NAKSHATRAS (full details)
        const dayNakList = document.getElementById('dayNakList');
        if (dayNakList) {
            dayNakList.innerHTML = '';
            if (res.DayNakshatras && res.DayNakshatras.length > 0) {
                res.DayNakshatras.forEach(nak => {
                    const item = document.createElement('div');
                    item.className = 'day-nak-item';

                    // Highlight the current/primary nakshatra
                    if (res.Nakshatra && res.Nakshatra.name && nak.name === res.Nakshatra.name.split(' ')[0]) {
                        item.classList.add('active-nak');
                    }

                    const dtOpts = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true };
                    const startTime = nak.start ? nak.start.toLocaleString('en-US', dtOpts) : '--';
                    const endTime = nak.end ? nak.end.toLocaleString('en-US', dtOpts) : '--';

                    let padaStr = '';
                    if (nak.name === res.Nakshatra.name.split(' ')[0] && res.Nakshatra.pada) {
                        padaStr = `പാദം ${res.Nakshatra.pada}`;
                    }

                    item.innerHTML = `
                        <span class="day-nak-name">${nak.name}</span>
                        <span class="day-nak-time">${startTime} — ${endTime}</span>
                        ${padaStr ? `<span class="day-nak-pada">${padaStr}</span>` : ''}
                    `;
                    dayNakList.appendChild(item);
                });
            } else {
                dayNakList.innerHTML = '<div style="color:#888; text-align:center;">വിവരങ്ങൾ ലഭ്യമല്ല</div>';
            }
        }

        // VISESHAMS
        const vBox = document.getElementById('specialEvents');
        const vText = document.getElementById('eventText');
        // Note: index.html has #specialEvents container and #eventText span inside.
        // Previous logic was overwriting innerHTML of #specialEvents, killing the icon.

        if (vBox) {
            if (res.Vishesham && res.Vishesham.length > 0) {
                vBox.classList.remove('hidden');
                // Clear previous tags if appended manually, or just set text
                // Let's use clean tag append approach or simple text?
                // Simple text with separator is easier for "Alert" style.
                if (vText) {
                    vText.innerHTML = ""; // Clear
                    res.Vishesham.forEach((v, i) => {
                        const span = document.createElement('span');
                        span.className = 'val';
                        span.innerText = v + (i < res.Vishesham.length - 1 ? " • " : "");
                        vText.appendChild(span);
                    });
                }
            } else {
                vBox.classList.add('hidden');
            }
        }

        // UPCOMING EVENTS (Dynamic List)
        const upBox = document.getElementById('upcomingList');
        if (upBox) {
            upBox.innerHTML = '<div style="text-align:center; font-size: 0.8rem; color: #aaa;">തിരയുന്നു...</div>';

            setTimeout(() => {
                const events = p.findUpcomingEvents(date, 3); // Get top 3
                upBox.innerHTML = ''; // Clear

                if (events && events.length > 0) {
                    events.forEach(e => {
                        const dObj = e.date;
                        const dStr = dObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                        const item = document.createElement('div');
                        item.className = 'timeline-item';

                        const nameDiv = document.createElement('div');
                        nameDiv.className = 'timeline-name';
                        nameDiv.innerText = e.name;

                        const dateDiv = document.createElement('div');
                        dateDiv.className = 'timeline-date';
                        dateDiv.innerText = dStr;

                        item.appendChild(nameDiv);
                        item.appendChild(dateDiv);
                        upBox.appendChild(item);
                    });
                } else {
                    upBox.innerHTML = '<div style="text-align:center;">ഒന്നും കണ്ടെത്തിയില്ല</div>';
                }
            }, 10);
        }

        // DETAILS LIST
        document.getElementById('yoga').innerText = res.Yoga.name;

        // Karana Fix: Handle object vs string if changed in lib
        // Assuming {name: "Bava"}
        document.getElementById('karana').innerText = res.Karna ? res.Karna.name : "---";
        document.getElementById('ayanamsa').innerText = res.Ayanamsa.name;
        
        // Additional Astronomical Information
        
        // Moon Phase
        if (res.MoonPhase) {
            // Moon phase emoji
            const moonEmojis = { 'New Moon': '🌑', 'Waxing Crescent': '🌒', 'First Quarter': '🌓', 'Waxing Gibbous': '🌔', 'Full Moon': '🌕', 'Waning Gibbous': '🌖', 'Last Quarter': '🌗', 'Waning Crescent': '🌘' };
            const mEmoji = moonEmojis[res.MoonPhase.name] || '🌙';
            document.getElementById('moonPhase').innerText = `${mEmoji} ${res.MoonPhase.name}`;
            document.getElementById('moonIllumination').innerText = res.MoonPhase.illumination;
        }
        
        // Moon Times
        if (res.MoonTimes) {
            document.getElementById('moonrise').innerText = res.MoonTimes.moonrise || "N/A";
            document.getElementById('moonset').innerText = res.MoonTimes.moonset || "N/A";
        }
        
        // Planetary Positions
        if (res.PlanetaryPositions) {
            document.getElementById('sunLongitude').innerText = res.PlanetaryPositions.Sun.longitude.toFixed(2) + '°';
            document.getElementById('moonLongitude').innerText = res.PlanetaryPositions.Moon.longitude.toFixed(2) + '°';
            document.getElementById('mercuryLongitude').innerText = res.PlanetaryPositions.Mercury.longitude.toFixed(2) + '°';
            document.getElementById('venusLongitude').innerText = res.PlanetaryPositions.Venus.longitude.toFixed(2) + '°';
            document.getElementById('marsLongitude').innerText = res.PlanetaryPositions.Mars.longitude.toFixed(2) + '°';
            document.getElementById('jupiterLongitude').innerText = res.PlanetaryPositions.Jupiter.longitude.toFixed(2) + '°';
            document.getElementById('saturnLongitude').innerText = res.PlanetaryPositions.Saturn.longitude.toFixed(2) + '°';
        }
        
        // Panchak
        if (res.Panchak) {
            document.getElementById('panchak').innerText = res.Panchak.isPanchak ? "Yes" : "No";
            document.getElementById('panchakType').innerText = res.Panchak.type || "None";
        }
        
        // Hora
        if (res.Hora) {
            document.getElementById('hora').innerText = res.Hora.currentHora || "N/A";
            document.getElementById('dayLord').innerText = res.Hora.dayLord || "N/A";
        }
        
        // Nakshatra Pada
        if (res.Nakshatra && res.Nakshatra.pada) {
            document.getElementById('nakshatraPada').innerText = res.Nakshatra.pada;
            document.getElementById('nakshatraProgress').innerText = res.Nakshatra.progress + '%';
        }
        
        // Hindu Calendar
        if (res.HinduCalendar) {
            document.getElementById('hinduMonth').innerText = res.HinduCalendar.month;
            document.getElementById('paksha').innerText = res.HinduCalendar.paksha;
        }
        
        // Samvat Years
        if (res.Samvat) {
            document.getElementById('shakaYear').innerText = res.Samvat.shaka;
            document.getElementById('vikramYear').innerText = res.Samvat.vikram;
        }
        
        // Tithi Duration
        if (res.Tithi && res.Tithi.duration) {
            document.getElementById('tithiDuration').innerText = res.Tithi.duration.durationHours + ' hrs';
        }
        
        // Rashi Details
        if (res.Rashi) {
            document.getElementById('rashiName').innerText = res.Rashi.name;
            document.getElementById('rashiProgress').innerText = res.Rashi.progress + '%';
            document.getElementById('rashiElement').innerText = res.Rashi.element;
            document.getElementById('rashiQuality').innerText = res.Rashi.quality;
        }
    }

    // Reverse Lookup Logic
    const revBtn = document.getElementById('findDateBtn');
    revBtn.addEventListener('click', () => {
        const y = parseInt(document.getElementById('revYear').value);
        const m = document.getElementById('revMonth').value;
        const d = parseInt(document.getElementById('revDate').value);

        if (!y || !d) return;

        // Use Library
        const gDate = p.kollamToGregorian(y, m, d);

        const resBox = document.getElementById('revResult');
        const resTxt = document.getElementById('revDateResult');

        resBox.style.display = 'block'; resBox.classList.add('visible');
        if (gDate) {
            resTxt.innerText = gDate.toDateString();
            resTxt.style.color = "#8B0000"; // Deep red instead of white
        } else {
            resTxt.innerText = "തീയതി കണ്ടെത്താനായില്ല";
            resTxt.style.color = "#ff6b6b";
        }
    });

    // --- NAKSHATRA FINDER LOGIC ---
    const nakSelect = document.getElementById('nakSelect');
    const findNakBtn = document.getElementById('findNakBtn');
    const nakResBox = document.getElementById('nakResult');
    const nakResultList = document.getElementById('nakResultList');
    const nakCountSel = document.getElementById('nakCount');

    // Populate Dropdown (Robust)
    if (nakSelect) {
        let naks = [];
        try {
            naks = p.getNakshatras();
        } catch (e) {
            console.error("Method missing", e);
        }

        // Fallback list if method fails
        if (!naks || naks.length === 0) {
            naks = ["അശ്വതി", "ഭരണി", "കാർത്തിക", "രോഹിണി", "മകയിരം", "തിരുവാതിര", "പുണർതം", "പൂയം", "ആയില്യം", "മകം", "പൂരം", "ഉത്രം", "അത്തം", "ചിത്തിര", "ചോതി", "വിശാഖം", "അനിഴം", "തൃക്കേട്ട", "മൂലം", "പൂരാടം", "ഉത്രാടം", "തിരുവോണം", "അവിട്ടം", "ചതയം", "പൂരുരുട്ടാതി", "ഉത്രട്ടാതി", "രേവതി"];
        }

        if (naks.length > 0) {
            nakSelect.innerHTML = ""; // Clear existing
            naks.forEach(n => {
                const opt = document.createElement('option');
                opt.value = n;
                opt.innerText = n;
                nakSelect.appendChild(opt);
            });
        }
    } else {
        console.error("Nakshatra Select Element Not Found!");
    }

    if (findNakBtn) {
        findNakBtn.addEventListener('click', () => {
            const name = nakSelect.value;
            const count = parseInt(nakCountSel ? nakCountSel.value : '1') || 1;

            if (nakResBox) {
                nakResBox.style.display = 'block'; nakResBox.classList.add('visible');
            } else return;

            nakResultList.innerHTML = '<div style="color:#888; text-align:center;">തിരയുന്നു... (' + name + ')</div>';

            setTimeout(() => {
                try {
                    const results = [];
                    let searchFrom = new Date();
                    for (let i = 0; i < count; i++) {
                        const res = p.findNextNakshatra(name, searchFrom);
                        if (!res) break;
                        results.push(res);
                        // Move search start to day after found date to find next occurrence
                        searchFrom = new Date(res.date);
                        searchFrom.setDate(searchFrom.getDate() + 1);
                    }

                    nakResultList.innerHTML = '';
                    if (results.length > 0) {
                        results.forEach((res, idx) => {
                            const dStr = res.date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                            const mStr = `കൊല്ലവർഷം ${res.details.Malayalam.year} ${res.details.Malayalam.month} ${res.details.Malayalam.date}`;
                            const item = document.createElement('div');
                            item.className = 'nak-result-item';
                            item.innerHTML = `
                                <span class="nak-result-num">${idx + 1}</span>
                                <div class="nak-result-details">
                                    <div class="nak-result-greg">${dStr}</div>
                                    <div class="nak-result-mal">${mStr}</div>
                                </div>
                            `;
                            nakResultList.appendChild(item);
                        });
                    } else {
                        nakResultList.innerHTML = '<div style="color:#888; text-align:center;">കണ്ടെത്താനായില്ല</div>';
                    }
                } catch (e) {
                    console.error("Error in findNextNakshatra:", e);
                    nakResultList.innerHTML = '<div style="color:#c0392b;">Error: ' + e.message + '</div>';
                }
            }, 50);
        });
    }

    // Determine User Location (Optional)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const crd = pos.coords;
            // Re-instantiate with new coords
            // p = new Panchang({ lat: crd.latitude, lon: crd.longitude }); 
            // Better: update internal config if possible or just use defaults for now.
            // Let's stick to Manjeri defaults to avoid complexities with timezone offsets if user is abroad.
            // Or just update header
            // document.getElementById('currentDateStr').innerText += " (Local)";
        });
    }

    // ===== CALENDAR TAB LOGIC =====
    let calYear = new Date().getFullYear();
    let calMonth = new Date().getMonth(); // 0-indexed

    const calGrid = document.getElementById('calendarGrid');
    const calTitle = document.getElementById('calMonthTitle');
    const calPrev = document.getElementById('calPrev');
    const calNext = document.getElementById('calNext');

    // Cache for calculated panchang data per month
    const calCache = {};

    function getCacheKey(y, m) { return `${y}-${m}`; }

    function buildCalendar(year, month) {
        if (!calGrid) return;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        calTitle.innerText = `${monthNames[month]} ${year}`;

        // Clear grid
        calGrid.innerHTML = '';

        // Day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(d => {
            const hdr = document.createElement('div');
            hdr.className = 'cal-header';
            hdr.innerText = d;
            calGrid.appendChild(hdr);
        });

        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

        const cacheKey = getCacheKey(year, month);

        // Calculate all days for this month (use cache if available)
        if (!calCache[cacheKey]) {
            const data = {};
            for (let d = 1; d <= daysInMonth; d++) {
                const dt = new Date(year, month, d, 12, 0, 0);
                try {
                    data[d] = p.calculate(dt);
                } catch (e) {
                    data[d] = null;
                }
            }
            calCache[cacheKey] = data;
        }
        const monthData = calCache[cacheKey];

        // Previous month filler days
        for (let i = 0; i < firstDay; i++) {
            const cell = document.createElement('div');
            cell.className = 'cal-day other-month';
            const pd = prevMonthDays - firstDay + 1 + i;
            cell.innerHTML = `<div class="greg-date">${pd}</div>`;
            calGrid.appendChild(cell);
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const cell = document.createElement('div');
            cell.className = 'cal-day';

            const dayStr = `${year}-${month}-${d}`;
            if (dayStr === todayStr) cell.classList.add('today');

            // Sunday styling
            const dow = new Date(year, month, d).getDay();
            if (dow === 0) cell.classList.add('sunday');

            const res = monthData[d];
            let html = `<div class="greg-date" style="${dow === 0 ? 'color:#c62828' : ''}">${d}</div>`;

            if (res) {
                // Malayalam date
                html += `<div class="mal-date">${res.Malayalam.date} ${res.Malayalam.month}</div>`;

                // Nakshatra
                if (res.Nakshatra && res.Nakshatra.name) {
                    html += `<div class="nak-info">${res.Nakshatra.name}</div>`;
                }

                // Events
                if (res.Vishesham && res.Vishesham.length > 0) {
                    res.Vishesham.forEach(ev => {
                        html += `<div class="event-dot" title="${ev}">${ev}</div>`;
                    });
                }
            }

            cell.innerHTML = html;

            // Click to load that date in main tab
            cell.addEventListener('click', () => {
                const clickedDate = new Date(year, month, d, 12, 0, 0);
                const yy = clickedDate.getFullYear();
                const mm = String(clickedDate.getMonth() + 1).padStart(2, '0');
                const dd = String(clickedDate.getDate()).padStart(2, '0');
                dateInput.value = `${yy}-${mm}-${dd}`;
                updateUI(clickedDate);

                // Switch to main tab
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                document.querySelector('[data-tab="main"]').classList.add('active');
                document.getElementById('main').classList.add('active');
            });

            calGrid.appendChild(cell);
        }

        // Next month filler days
        const totalCells = firstDay + daysInMonth;
        const remaining = (7 - (totalCells % 7)) % 7;
        for (let i = 1; i <= remaining; i++) {
            const cell = document.createElement('div');
            cell.className = 'cal-day other-month';
            cell.innerHTML = `<div class="greg-date">${i}</div>`;
            calGrid.appendChild(cell);
        }
    }

    if (calPrev) {
        calPrev.addEventListener('click', () => {
            calMonth--;
            if (calMonth < 0) { calMonth = 11; calYear--; }
            buildCalendar(calYear, calMonth);
        });
    }

    if (calNext) {
        calNext.addEventListener('click', () => {
            calMonth++;
            if (calMonth > 11) { calMonth = 0; calYear++; }
            buildCalendar(calYear, calMonth);
        });
    }

    // Build calendar on tab click (lazy load)
    const calTabBtn = document.querySelector('[data-tab="calendar"]');
    let calBuilt = false;
    if (calTabBtn) {
        calTabBtn.addEventListener('click', () => {
            if (!calBuilt) {
                buildCalendar(calYear, calMonth);
                calBuilt = true;
            }
        });
    }

    // Init
    setToday();
});
