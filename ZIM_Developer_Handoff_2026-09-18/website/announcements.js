const announcement=document.querySelector('.announcement');
const announcementToggle=announcement?.querySelector('.announcement-toggle');
if(announcementToggle){announcementToggle.onclick=()=>{const paused=announcement.classList.toggle('is-paused');announcementToggle.setAttribute('aria-pressed',String(paused));announcementToggle.setAttribute('aria-label',paused?'Play Announcements':'Pause Announcements');announcementToggle.textContent=paused?'▶':'Ⅱ';};}
