
  const input = document.getElementById('songInput');
  const suggestionBox = document.createElement('div');
  suggestionBox.className = 'suggestion-box';
  suggestionBox.style.position = 'absolute';
  suggestionBox.style.background = 'white';
  suggestionBox.style.border = '1px solid #ccc';
  suggestionBox.style.zIndex = 1000;
  suggestionBox.style.maxHeight = '150px';
  suggestionBox.style.overflowY = 'auto';
  suggestionBox.style.display = 'none';

  input.parentNode.appendChild(suggestionBox);

  input.addEventListener('input', async () => {
    const query = input.value.trim();
    suggestionBox.innerHTML = '';
    if (!query) {
      suggestionBox.style.display = 'none';
      return;
    }

    try {
      const res = await fetch(`/suggestions?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.length > 0) {
        data.forEach((suggestion) => {
          const div = document.createElement('div');
          div.textContent = suggestion;
          div.style.padding = '8px';
          div.style.cursor = 'pointer';
          div.addEventListener('click', () => {
            input.value = suggestion;
            suggestionBox.innerHTML = '';
            suggestionBox.style.display = 'none';
          });
          suggestionBox.appendChild(div);
        });
        const rect = input.getBoundingClientRect();
        suggestionBox.style.top = input.offsetTop + input.offsetHeight + 'px';
        suggestionBox.style.left = input.offsetLeft + 'px';
        suggestionBox.style.width = input.offsetWidth + 'px';
        suggestionBox.style.display = 'block';
      } else {
        suggestionBox.style.display = 'none';
      }
    } catch (error) {
      console.error('Suggestion fetch failed:', error);
      suggestionBox.style.display = 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (!suggestionBox.contains(e.target) && e.target !== input) {
      suggestionBox.innerHTML = '';
      suggestionBox.style.display = 'none';
    }
  });

  // QR Form Submission Logic
  // QR Form Submission Logic
document.getElementById('qrForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const song = document.getElementById('songInput').value;
  const resultDiv = document.getElementById('result');
  const ytLink = document.getElementById('ytLink');
  const qrImage = document.getElementById('qrImage');
  const downloadBtn = document.getElementById('downloadBtn');

  resultDiv.classList.add('hidden');
  downloadBtn.style.display = 'none';

  try {
    const res = await fetch('/generate-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songName: song })
    });

    const data = await res.json();

    if (data.qrCode) {
      ytLink.href = data.redirectLink;
      ytLink.textContent = data.redirectLink;

      qrImage.src = data.qrCode;

      // Setup download button
      downloadBtn.href = data.qrCode;
      downloadBtn.download = `qr-${Date.now()}.png`;
      downloadBtn.style.display = 'inline-block';

      resultDiv.classList.remove('hidden');
    } else {
      throw new Error(data.error || 'No result');
    }
  } catch (err) {
    alert('Error: Could not generate QR. Try a different song.');
    console.error(err);
  }
});

  

