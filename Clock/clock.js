const d = document;
const clock = d.getElementById('clock');
let prevSecond = null;
setInterval(showTime, 100);

function showTime(event) {
  const now = new Date();
  const [hour, minute, second] = [
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  ];
  if (prevSecond == second) { return; }
  prevSecond = second;
  const [txtHour, txtMinute, txtSecond] = [
    String(hour).padStart(2, '0'),
    String(minute).padStart(2, '0'),
    String(second).padStart(2, '0'),
  ];
  clock.textContent = `${txtHour}:${txtMinute}:${txtSecond}`;
}