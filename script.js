const username = prompt("Vul je gebruikersnaam in (ik/neef):");

async function loadNotes() {
  const res = await fetch('notes.json?' + Date.now());
  let notes = await res.json();
  // Eerst notes van de ander, daarna van jezelf
  notes.sort((a, b) => {
    if (a.owner === username && b.owner !== username) return 1;
    if (a.owner !== username && b.owner === username) return -1;
    return 0;
  });

  const ul = document.getElementById('notes');
  ul.innerHTML = '';
  for (const note of notes) {
    let li = document.createElement('li');
    if (note.isImage) {
      let img = document.createElement('img');
      img.src = note.url;
      img.className = 'postit-image';
      img.onclick = () => { window.open(note.url, '_blank'); };
      li.appendChild(img);
    } else {
      // OG preview tonen wanneer mogelijk
      if (note.meta?.ogImage) {
        let img = document.createElement('img');
        img.src = note.meta.ogImage;
        img.className = 'postit-image';
        img.onclick = () => { window.open(note.url, '_blank'); };
        li.appendChild(img);
      }
      let div = document.createElement('div');
      div.className = 'meta-preview';
      div.innerHTML = `
        <a href="${note.url}" target="_blank">${note.meta?.ogTitle || note.url}</a><br>
        <span>${note.meta?.ogDescription || ''}</span>
      `;
      li.appendChild(div);
    }
    ul.appendChild(li);
  }
}

document.getElementById('noteform').onsubmit = async function(e) {
  e.preventDefault();
  const url = document.getElementById('note-url').value.trim();
  if (!url) return;
  await fetch('/api/addnote', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ url, owner: username })
  });
  document.getElementById('note-url').value = '';
  setTimeout(loadNotes, 400); // Even wachten tot backend klaar
};

loadNotes();
