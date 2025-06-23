document.getElementById('qrForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const song = document.getElementById('songInput').value;
  const resultDiv = document.getElementById('result');
  const ytLink = document.getElementById('ytLink');
  const qrImage = document.getElementById('qrImage');

  resultDiv.classList.add('hidden');

  try {
    const res = await fetch('/generate-qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songName: song })
    });

    const data = await res.json();
    // console.log(data);
    if (data.qrCode) {
    ytLink.href = data.redirectLink;
    ytLink.textContent = data.redirectLink;

      qrImage.src = data.qrCode;
      resultDiv.classList.remove('hidden');
    } else {
      throw new Error(data.error || 'No result');
    }
  } catch (err) {
    alert('Error: Could not generate QR. Try a different song.');
    console.error(err);
  }
});
