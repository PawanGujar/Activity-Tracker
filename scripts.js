let dayCount = 0;
const dayTitles = {};

// LocalStorage helpers
function saveData() {
  const days = [];
  for (const [id, title] of Object.entries(dayTitles)) {
    const dayBox = document.getElementById(id);
    if (!dayBox) continue;
    const dateInput = dayBox.querySelector('input[type="date"]');
    const dateVal = dateInput ? dateInput.value : '';
    const activities = [];
    dayBox.querySelectorAll('.activity').forEach(act => {
      // Detect start time activity (time input)
      if (act.querySelector('.start-time-time')) {
        const name = act.querySelector('input[type="text"]')?.value || '';
        const startTime = act.querySelector('.start-time-time')?.value || '';
        activities.push({ type: 'startTime', name, startTime });
      } else {
        const name = act.querySelector('input[type="text"]')?.value || '';
        const timeSpent = act.querySelector('.time-spent')?.value || '';
        const repeatCount = act.querySelector('.repeat-count')?.value || '';
        const startTime = act.querySelector('.start-time')?.value || '';
        const endTime = act.querySelector('.end-time')?.value || '';
        activities.push({ name, timeSpent, repeatCount, startTime, endTime });
      }
    });
    days.push({ id, title, date: dateVal, activities });
  }
  localStorage.setItem('activityMonitorDays', JSON.stringify(days));
  localStorage.setItem('activityMonitorDayCount', dayCount);
}

function loadData() {
  const days = JSON.parse(localStorage.getItem('activityMonitorDays') || '[]');
  dayCount = parseInt(localStorage.getItem('activityMonitorDayCount') || '0');
  for (const day of days) {
    dayTitles[day.id] = day.title;
    const dayBox = document.createElement('div');
    dayBox.className = 'day-box';
    dayBox.id = day.id;
    dayBox.innerHTML = `
      <div class="day-header">
        <input type="date" onchange="updateDayTitle(this, '${day.id}')" value="${day.date}" />
        <div class="add-sub">
          <div class="tooltip">
            <button onclick="addSubActivity('${day.id}')">➕</button>
            <span class="tooltiptext">Activity with start/end time</span>
          </div>
          <div class="tooltip">
            <button onclick="addSimpleActivity('${day.id}')">📝</button>
            <span class="tooltiptext">Activity (no start/end time)</span>
          </div>
          <div class="tooltip">
          <button onclick="addStartTimeActivity('${day.id}')">⏰</button>
          <span class="tooltiptext">Activity with start time (number)</span>
          </div>
          <div class="tooltip">
            <button onclick="deleteDay('${day.id}')">🗑️</button>
            <span class="tooltiptext">Delete day</span>
          </div>
        </div>
      </div>
      <div class="day-title" id="title-${day.id}" style="margin-top:10px; font-weight:bold;">${day.title}</div>
    `;
    document.getElementById('days-container').appendChild(dayBox);
    for (const act of day.activities) {
      if (act.type === 'startTime') {
        const startTimeDiv = document.createElement('div');
        startTimeDiv.className = 'activity activity-starttime';
        startTimeDiv.innerHTML = `
          <input type="text" placeholder="Activity name" value="${act.name || ''}" />
          <input type="time" class="start-time-time" placeholder="Start Time" value="${act.startTime || ''}" />
          <button class="delete-btn" onclick="this.parentElement.remove()">Delete</button>
        `;
        dayBox.appendChild(startTimeDiv);
      } else if (act.startTime || act.endTime) {
        const sub = document.createElement('div');
        sub.className = 'activity activity-sub';
        sub.innerHTML = `
          <input type="text" placeholder="Activity name" value="${act.name}" />
          <input type="time" class="start-time" value="${act.startTime}" />
          <input type="time" class="end-time" value="${act.endTime}" />
          <input type="text" class="time-spent" placeholder="Time Spent" value="${act.timeSpent}" readonly />
          <button class="delete-btn" onclick="this.parentElement.remove()">Delete</button>
        `;
        dayBox.appendChild(sub);
        attachTimeCalculation(sub);
      } else {
        const actDiv = document.createElement('div');
        actDiv.className = 'activity activity-simple';
        actDiv.innerHTML = `
          <input type="text" placeholder="Activity name" value="${act.name}" />
          <input type="time" class="time-spent" placeholder="Time Spent(e.g. 00:30 mins)" value="${act.timeSpent}" />
          <input type="number" class="repeat-count" placeholder="Repeated count" min="1" value="${act.repeatCount}" />
          <button class="delete-btn" onclick="this.parentElement.remove()">Delete</button>
        `;
        dayBox.appendChild(actDiv);
      }
    }
  }
  updateDayFilter();
}

window.addEventListener('beforeunload', saveData);
window.addEventListener('DOMContentLoaded', loadData);

function getDayLabel(dateObj = new Date()) {
  return `${dateObj.toLocaleDateString(undefined, { weekday: 'long' })}, ${dateObj.toLocaleDateString()}`;
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  }
}

window.addEventListener('DOMContentLoaded', function() {
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  }
});

function showTab(tab) {
  document.getElementById('home').style.display = tab === 'home' ? 'block' : 'none';
  document.getElementById('dashboard').style.display = tab === 'dashboard' ? 'block' : 'none';
  // Show/hide add day button in navbar
  const addDayBtn = document.querySelector('.add-day-top');
  if (addDayBtn) {
    addDayBtn.style.display = tab === 'home' ? '' : 'none';
  }
  updateDayFilter();
}

function addDay() {
  const date = new Date();
  const label = getDayLabel(date);
  dayCount++;
  const dayBox = document.createElement('div');
  dayBox.className = 'day-box';
  dayBox.id = `day-${dayCount}`;
  dayTitles[`day-${dayCount}`] = label;
  dayBox.innerHTML = `
        <div class="day-header">
          <input type="date" onchange="updateDayTitle(this, 'day-${dayCount}')" value="${date.toISOString().split('T')[0]}" />
          <div class="add-sub">
            <div class="tooltip">
              <button onclick="addSubActivity('day-${dayCount}')">➕</button>
              <span class="tooltiptext">Activity with start/end time</span>
            </div>
            <div class="tooltip">
              <button onclick="addSimpleActivity('day-${dayCount}')">📝</button>
              <span class="tooltiptext">Activity (no start/end time)</span>
            </div>
            <div class="tooltip">
            <button onclick="addStartTimeActivity('day-${dayCount}')">⏰</button>
            <span class="tooltiptext">Activity with start time (number)</span>
            </div>
            <div class="tooltip">
              <button onclick="deleteDay('day-${dayCount}')">🗑️</button>
              <span class="tooltiptext">Delete day</span>
            </div>
          </div>
        </div>
        <div class="day-title" id="title-day-${dayCount}" style="margin-top:10px; font-weight:bold;">${label}</div>
      `;
  const container = document.getElementById('days-container');
  if (container.firstChild) {
    container.insertBefore(dayBox, container.firstChild);
  } else {
    container.appendChild(dayBox);
  }
  updateDayFilter();
  saveData();
}

function updateDayTitle(input, id) {
  const date = new Date(input.value);
  const title = getDayLabel(date);
  document.getElementById(`title-${id}`).textContent = title;
  dayTitles[id] = title;
  updateDayFilter();
  saveData();
}

function deleteDay(id) {
  const title = dayTitles[id] || '';
  if (confirm(`Are you sure you want to delete this day?\n${title}`)) {
    document.getElementById(id).remove();
    delete dayTitles[id];
    updateDayFilter();
    saveData();
  }
}

function updateDayFilter() {
  const filter = document.getElementById('dayFilter');
  filter.innerHTML = '';
  for (const [id, title] of Object.entries(dayTitles)) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = title;
    filter.appendChild(option);
  }
}

function addSubActivity(dayId) {
  const dayBox = document.getElementById(dayId);
  const sub = document.createElement('div');
  sub.className = 'activity activity-sub';
  sub.innerHTML = `
        <input type="text" placeholder="Activity name" />
        <input type="time" class="start-time" />
        <input type="time" class="end-time" />
        <input type="text" class="time-spent" placeholder="Time Spent" readonly />
        <button class="delete-btn" onclick="this.parentElement.remove()">Delete</button>
      `;
  dayBox.appendChild(sub);
  attachTimeCalculation(sub);
  saveData();
}

function addSimpleActivity(dayId) {
  const dayBox = document.getElementById(dayId);
  const act = document.createElement('div');
  act.className = 'activity activity-simple';
  act.innerHTML = `
        <input type="text" placeholder="Activity name" />
        <input type="time" class="time-spent" placeholder="Time Spent (hh:mm)" />
        <input type="number" class="repeat-count" placeholder="Repeated count" min="1" />
        <button class="delete-btn" onclick="this.parentElement.remove()">Delete</button>
      `;
  dayBox.appendChild(act);
  saveData();
}

// Add Start Time Activity (new type)
function addStartTimeActivity(dayId) {
  const dayBox = document.getElementById(dayId);
  const act = document.createElement('div');
  act.className = 'activity activity-starttime';
  act.innerHTML = `
    <input type="text" placeholder="Activity name" />
    <input type="time" class="start-time-time" placeholder="Start Time" />
    <button class="delete-btn" onclick="this.parentElement.remove()">Delete</button>
  `;
  dayBox.appendChild(act);
  saveData();
}

function attachTimeCalculation(activityEl) {
  const start = activityEl.querySelector('.start-time');
  const end = activityEl.querySelector('.end-time');
  const timeSpent = activityEl.querySelector('.time-spent');

  function updateTime() {
    if (start.value && end.value) {
      const [h1, m1] = start.value.split(":").map(Number);
      const [h2, m2] = end.value.split(":").map(Number);
      let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (isNaN(mins) || mins < 0) {
        timeSpent.value = "00:00 hrs";
        timeSpent.disabled = true;
        if (!activityEl.querySelector('.time-warning')) {
          const warn = document.createElement('div');
          warn.className = 'time-warning';
          warn.style.color = 'red';
          warn.textContent = 'End time must be after start time!';
          activityEl.appendChild(warn);
        }
      } else {
        timeSpent.disabled = false;
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        timeSpent.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} hrs`;
        const warn = activityEl.querySelector('.time-warning');
        if (warn) warn.remove();
      }
    } else {
      timeSpent.value = "";
      timeSpent.disabled = false;
      const warn = activityEl.querySelector('.time-warning');
      if (warn) warn.remove();
    }
  }

  start.addEventListener('change', updateTime);
  end.addEventListener('change', updateTime);
  // ==============================================  
}
function renderDashboardChart() {
if (!window.chartInstance) window.chartInstance = null;
const chartRange = document.getElementById('chartRange')?.value || 'day';
const selectedDay = document.getElementById('dayFilter')?.value;
const selectedMetric = document.getElementById('metricFilter')?.value;
if (!selectedDay) return;

let activities = [];
if (chartRange === 'day') {
  // Get activities for the selected day from DOM
  const dayBox = document.getElementById(selectedDay);
  if (!dayBox) return;
  const activityEls = dayBox.querySelectorAll('.activity');
  activityEls.forEach(el => {
    const nameInput = el.querySelector('input[type="text"]');
    const timeInput = el.querySelector('.time-spent');
    const countInput = el.querySelector('.repeat-count');
    let name = nameInput ? nameInput.value.trim() : '';
    let timeSpent = 0;
    let count = 1;
    // Only use repeat count for simple activities (no start/end time)
    if (countInput && countInput.value && el.querySelector('.start-time') === null && el.querySelector('.end-time') === null && el.querySelector('.start-time-time') === null) {
      count = parseInt(countInput.value);
      if (isNaN(count)) count = 1;
    }
    if (timeInput && timeInput.value) {
      let val = timeInput.value.trim();
      if (/\d{2}:\d{2}/.test(val)) {
        let [h, m] = val.split(':');
        h = parseInt(h);
        m = parseInt(m);
        timeSpent = h * 60 + m;
      } else {
        let mins = parseInt(val.replace(/[^\d]/g, ''));
        if (!isNaN(mins)) timeSpent = mins;
      }
    }
    if (name) activities.push({ name, timeSpent, count });
  });
} else {
  // Week or Month: aggregate activities from all days in the range
  const days = JSON.parse(localStorage.getItem('activityMonitorDays') || '[]');
  let targetDate = null;
  for (const d of days) {
    if (d.id === selectedDay) {
      targetDate = d.date;
      break;
    }
  }
  if (!targetDate) return;
  let target = new Date(targetDate);
  let start, end;
  if (chartRange === 'week') {
    // Get week range (Sunday to Saturday)
    let dayOfWeek = target.getDay();
    start = new Date(target);
    start.setDate(target.getDate() - dayOfWeek);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else {
    // Month range
    start = new Date(target.getFullYear(), target.getMonth(), 1);
    end = new Date(target.getFullYear(), target.getMonth() + 1, 0);
  }
  // Aggregate activities
  let activityMap = {};
  let daysInRange = 0;
  for (const d of days) {
    let dDate = new Date(d.date);
    if (dDate >= start && dDate <= end) {
      daysInRange++;
      for (const act of d.activities) {
        let name = act.name || '';
        let timeSpent = 0;
        let count = 1;
        if (act.timeSpent) {
          let val = act.timeSpent.trim();
          if (/\d{2}:\d{2}/.test(val)) {
            let [h, m] = val.split(':');
            h = parseInt(h);
            m = parseInt(m);
            timeSpent = h * 60 + m;
          } else {
            let mins = parseInt(val.replace(/[^\d]/g, ''));
            if (!isNaN(mins)) timeSpent = mins;
          }
        }
        if (act.repeatCount) {
          count = parseInt(act.repeatCount);
          if (isNaN(count)) count = 1;
        }
        if (name) {
          if (!activityMap[name]) activityMap[name] = { name, timeSpent: 0, count: 0 };
          activityMap[name].timeSpent += timeSpent;
          activityMap[name].count += count;
        }
      }
    }
  }
  // If not enough days for week (7) or month (28+), show empty pie
  if ((chartRange === 'week' && daysInRange < 7) || (chartRange === 'month' && daysInRange < 28)) {
    activities = [{ name: 'No Data', timeSpent: 0, count: 0 }];
  } else {
    activities = Object.values(activityMap);
  }
}

const labels = activities.map(a => a.name);
let data;
if (selectedMetric === 'time') {
  data = activities.map(a => a.timeSpent);
} else {
  // Only show count for simple activities (with repeat count > 1), others are 0
  data = activities.map(a => {
    // If activity has a repeat count > 1, use it, else 0
    return a.count > 1 ? a.count : 0;
  });
}

// Color palette for pie slices
const pieColors = [
  '#60a5fa', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#f472b6', '#34d399', '#f87171', '#a3e635', '#fbbf24', '#818cf8', '#facc15', '#e879f9', '#38bdf8', '#fb7185', '#a7f3d0', '#fde68a', '#c7d2fe', '#fcd34d', '#f3f4f6'
];
const backgroundColor = labels.map((_, i) => pieColors[i % pieColors.length]);

if (window.chartInstance) window.chartInstance.destroy();
const ctx = document.getElementById('dashboardChart').getContext('2d');

window.chartInstance = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: labels,
    datasets: [{
      label: selectedMetric === 'time' ? 'Time Spent (mins)' : 'Count',
      data: data,
      backgroundColor: backgroundColor,
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'right', labels: { usePointStyle: true } },
      title: {
        display: true,
        text: `Activity by ${selectedMetric === 'time' ? 'Time Spent' : 'Count'} (${chartRange.charAt(0).toUpperCase() + chartRange.slice(1)})`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const idx = context.dataIndex;
            const activity = activities[idx];
            if (selectedMetric === 'time') {
              let mins = activity.timeSpent;
              let h = Math.floor(mins / 60);
              let m = mins % 60;
              return `${activity.name}: ${h} hrs : ${m} mins`;
            } else {
              // Only show count for simple activities (with repeat count)
              if (activity.count > 1) {
                return `${activity.name}: ${activity.count} times`;
              } else {
                return `${activity.name}`;
              }
            }
          }
        }
      }
    }
  }
});
}