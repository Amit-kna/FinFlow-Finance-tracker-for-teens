export function generateCertificate(userName: string, completionDate: string) {
  const certificateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Georgia, serif;
          background: #0D1117;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 40px;
        }
        .certificate {
          border: 3px solid #00C896;
          border-radius: 16px;
          padding: 60px;
          text-align: center;
          max-width: 700px;
          width: 100%;
        }
        .logo { color: #00C896; font-size: 32px; font-weight: bold; margin-bottom: 8px; }
        .subtitle { color: #8B949E; margin-bottom: 40px; }
        .certifies { color: #8B949E; font-size: 18px; }
        .name { color: #00C896; font-size: 42px; font-weight: bold; margin: 16px 0; }
        .completed { color: white; font-size: 20px; margin-bottom: 8px; }
        .course { color: #00C896; font-size: 24px; font-weight: bold; margin-bottom: 40px; }
        .date { color: #8B949E; font-size: 14px; }
        .seal { font-size: 60px; margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="seal">🏆</div>
        <div class="logo">FinFlow</div>
        <div class="subtitle">The Teen Money App</div>
        <div class="certifies">This certifies that</div>
        <div class="name">${userName}</div>
        <div class="completed">has successfully completed</div>
        <div class="course">FinFlow Financial Literacy Program</div>
        <div class="completed">including all 43 lessons across 6 tracks covering Money Basics, Budgeting, Saving, Investing, Earning, and Trading Academy</div>
        <br/>
        <div class="date">Completed on ${completionDate}</div>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(certificateHTML)
    printWindow.document.close()
    printWindow.print()
  }
}
