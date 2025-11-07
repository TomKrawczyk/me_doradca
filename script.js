// Navigation state
let currentPageStack = ['main-menu'];
let ostatniaProdukcja = 0;

const navigationSequences = {
  checklista: ['submenu-checklista', 'checklista-start'],
  wywiad: ['submenu-wywiad', 'wywiad-pytania'],
  edukacja: ['submenu-edukacja', 'edukacja-dzialanie']
};

// Navigation functions
function showSubmenu(id) {
  const targetPage = 'submenu-' + id;
  navigateToPage(targetPage);
}

function showPage(id) {
  navigateToPage(id);
}

function navigateToPage(pageId) {
  document.querySelectorAll('.content-page').forEach(el => el.classList.remove('active'));
  
  const targetElement = document.getElementById(pageId);
  if (targetElement) {
    targetElement.classList.add('active');
    currentPageStack.push(pageId);
    updateNavigationButtons();
  }
}

function updateNavigationButtons() {
  const backButton = document.querySelector('.back-button');
  const nextButton = document.querySelector('.next-button');
  const homeButton = document.querySelector('.home-button-nav');
  
  if (currentPageStack.length > 1) {
    backButton.classList.add('active');
  } else {
    backButton.classList.remove('active');
  }
  
  if (currentPageStack[currentPageStack.length - 1] !== 'main-menu') {
    homeButton.classList.add('active');
  } else {
    homeButton.classList.remove('active');
  }
  
  updateNextButton();
}

function updateNextButton() {
  const nextButton = document.querySelector('.next-button');
  const currentPage = currentPageStack[currentPageStack.length - 1];
  
  let hasNext = false;
  for (const [category, sequence] of Object.entries(navigationSequences)) {
    const currentIndex = sequence.indexOf(currentPage);
    if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
      hasNext = true;
      break;
    }
  }
  
  if (hasNext) {
    nextButton.classList.add('active');
  } else {
    nextButton.classList.remove('active');
  }
}

function goBack() {
  if (currentPageStack.length > 1) {
    currentPageStack.pop();
    const previousPage = currentPageStack[currentPageStack.length - 1];
    
    document.querySelectorAll('.content-page').forEach(page => page.classList.remove('active'));
    document.getElementById(previousPage).classList.add('active');
    
    updateNavigationButtons();
  }
}

function goNext() {
  const currentPage = currentPageStack[currentPageStack.length - 1];
  
  for (const [category, sequence] of Object.entries(navigationSequences)) {
    const currentIndex = sequence.indexOf(currentPage);
    if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
      const nextPage = sequence[currentIndex + 1];
      navigateToPage(nextPage);
      break;
    }
  }
}

function goToHome() {
  currentPageStack = ['main-menu'];
  
  document.querySelectorAll('.content-page').forEach(page => page.classList.remove('active'));
  document.getElementById('main-menu').classList.add('active');
  
  updateNavigationButtons();
}

// PDF Generation functions using pdfmake
function generatePDF(type) {
  const button = event.target;
  const originalText = button.textContent;
  
  button.textContent = 'Generowanie PDF...';
  button.disabled = true;
  
  try {
    let formData, filename, docDefinition;
    
    if (type === 'checklista') {
      formData = collectChecklistaData();
      filename = `Checklista_Doradcy_${new Date().toISOString().slice(0, 10)}.pdf`;
      docDefinition = generateChecklistaPDF(formData);
    } else if (type === 'wywiad') {
      formData = collectWywiadData();
      filename = `Wywiad_Klienta_${new Date().toISOString().slice(0, 10)}.pdf`;
      docDefinition = generateWywiadPDF(formData);
    }
    
    pdfMake.createPdf(docDefinition).download(filename);
    
    button.textContent = originalText;
    button.disabled = false;
    
    showNotification('PDF został wygenerowany i pobrany!');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    button.textContent = originalText;
    button.disabled = false;
    
    alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
  }
}

function generateChecklistaPDF(data) {
  const today = new Date().toLocaleDateString('pl-PL');
  
  const content = [
    // Header
    {
      text: 'CHECKLISTA DORADCY TECHNICZNEGO',
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 5]
    },
    {
      text: 'Analiza i modernizacja instalacji',
      style: 'subheader',
      alignment: 'center',
      margin: [0, 0, 0, 20]
    },
    // Date
    {
      text: `Data wizyty: ${data.dataPodpisu || today}`,
      style: 'dateBox',
      margin: [0, 0, 0, 15]
    },
    // Section title
    {
      text: 'Wizyta u klienta - pierwsze kroki',
      style: 'sectionTitle',
      margin: [0, 0, 0, 10]
    }
  ];
  
  // Items
  const items = [
    { label: '1. Dane klienta i lokalizacji:', value: data.daneKlienta || 'Nie podano' },
    { label: '2. Rodzaj instalacji:', value: data.rodzajInstalacji || 'Nie wybrano' },
    { label: '3. Data uruchomienia i wykonawca:', value: `Data: ${data.dataUruchomienia || 'Nie podano'} | Wykonawca: ${data.wykonawca || 'Nie podano'}` },
    { label: '4. Roczna produkcja energii [kWh]:', value: data.produkcjaEnergii || 'Nie podano' },
    { label: '5. Roczne zużycie energii / eksport do sieci:', value: `1.8.0: ${data.energiaPobrana || 'Nie podano'} kWh | 2.8.0: ${data.energiaOddana || 'Nie podano'} kWh` },
    { label: '6. Ocena autokonsumpcji i bilansu z siecią:', value: data.ocenaAutokonsumpcji || 'Nie podano' },
    { label: '7. Wizualna kontrola paneli/modułów:', value: data.kontrolaPaneli || 'Nie podano' },
    { label: '8. Kontrola mocowań i konstrukcji nośnej:', value: data.kontrolaMocowan || 'Nie podano' },
    { label: '9. Sprawdzenie przewodów DC/AC, połączeń MC4:', value: data.kontrolaPrzewodow || 'Nie podano' },
    { label: '10. Stan zabezpieczeń: SPD, RCD, wyłączniki:', value: data.stanZabezpieczen || 'Nie podano' },
    { label: '11. Odczyt falownika: błędy, produkcja, komunikacja:', value: data.odczytFalownika || 'Nie podano' },
    { label: '12. Pomiar kluczowych parametrów:', value: `Napięcie: ${data.napiecie || 'Nie podano'} | Prąd: ${data.prad || 'Nie podano'} | Temperatura: ${data.temperatura || 'Nie podano'}` },
    { label: '13. Ocena pracy pompy ciepła:', value: `Zasilanie: ${data.tempZasilania || 'Nie podano'} | Powrót: ${data.tempPowrotu || 'Nie podano'} | COP: ${data.cop || 'Nie podano'}` },
    { label: '14. Wizualna kontrola uziemienia:', value: data.kontrolaUziemienia || 'Nie podano' },
    { label: '15. Ocena możliwości rozbudowy:', value: data.mozliwosciRozbudowy || 'Nie podano' },
    { label: '16. Wstępna kalkulacja potencjału modernizacji:', value: data.kalkulacjaPotencjalu || 'Nie podano' },
    { label: '17. Rekomendacje:', value: data.rekomendacje || 'Nie podano' },
    { label: '18. Dodatkowa rekomendacja:', value: data.dodatkowaRekomendacja || 'Nie podano' }
  ];
  
  items.forEach(item => {
    content.push({
      text: item.label,
      style: 'itemLabel',
      margin: [0, 5, 0, 2]
    });
    content.push({
      text: item.value,
      style: 'itemValue',
      margin: [10, 0, 0, 5]
    });
    content.push({
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#d1d5db' }],
      margin: [0, 3, 0, 0]
    });
  });
  
  // Signatures
  content.push({
    text: 'Podpisy:',
    style: 'sectionTitle',
    margin: [0, 15, 0, 10]
  });
  
  content.push({
    columns: [
      { text: `Data: ${data.dataPodpisu || today}`, style: 'normal' },
      { text: `Podpis klienta: ${data.podpisKlienta || ''}`, style: 'normal' }
    ],
    margin: [0, 0, 0, 10]
  });
  
  content.push({
    columns: [
      { text: '_____________________', alignment: 'left' },
      { text: '_____________________', alignment: 'center' }
    ],
    margin: [0, 0, 0, 3]
  });
  
  content.push({
    columns: [
      { text: 'Podpis doradcy', style: 'small', alignment: 'center' },
      { text: 'Podpis klienta', style: 'small', alignment: 'center' }
    ],
    margin: [0, 0, 0, 15]
  });
  
  // Note
  content.push({
    text: [
      { text: 'Uwaga: ', bold: true },
      { text: 'dokument ma charakter kontrolny. Po spotkaniu wprowadź obserwacje i pomiary do systemu.' }
    ],
    style: 'note',
    margin: [0, 10, 0, 0]
  });
  
  return {
    content: content,
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: '#16a34a'
      },
      subheader: {
        fontSize: 11,
        color: '#16a34a'
      },
      dateBox: {
        fontSize: 10,
        bold: true,
        fillColor: '#f0fdf4',
        margin: [0, 5, 0, 5]
      },
      sectionTitle: {
        fontSize: 13,
        bold: true,
        color: '#16a34a'
      },
      itemLabel: {
        fontSize: 9,
        bold: true,
        color: '#166534'
      },
      itemValue: {
        fontSize: 9,
        color: '#374151'
      },
      normal: {
        fontSize: 10
      },
      small: {
        fontSize: 8,
        color: '#6b7280'
      },
      note: {
        fontSize: 9,
        fillColor: '#fef3c7',
        color: '#92400e',
        margin: [5, 5, 5, 5]
      }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

function generateWywiadPDF(data) {
  const today = new Date().toLocaleDateString('pl-PL');
  
  const content = [
    // Header
    {
      text: 'WYWIAD Z KLIENTEM',
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 5]
    },
    {
      text: 'Analiza potrzeb energetycznych',
      style: 'subheader',
      alignment: 'center',
      margin: [0, 0, 0, 20]
    },
    // Date
    {
      text: `Data wywiadu: ${data.data || today}`,
      style: 'dateBox',
      margin: [0, 0, 0, 15]
    },
    // Section title
    {
      text: 'Kluczowe pytania',
      style: 'sectionTitle',
      margin: [0, 0, 0, 10]
    }
  ];
  
  const questions = [
    { q: '1. Jaki jest roczny koszt za energię elektryczną?', a: data.kosztEnergii || 'Nie podano' },
    { q: '2. Ile osób zamieszkuje dom/mieszkanie?', a: data.liczbOsob || 'Nie podano' },
    { q: '3. O jakiej porze dnia zużycie prądu jest największe?', a: data.zuzyciePradu || 'Nie podano' },
    { q: '4. Czym ogrzewana jest ciepła woda?', a: data.ogrzewanieCieplejWody || 'Nie podano' },
    { q: '5. Hobby?', a: data.hobby || 'Nie podano' },
    { q: '6. Jaki mamy sprzęt elektryczny w domu?', a: data.sprzetElektryczny || 'Nie podano' },
    { q: '7. Jakie plany zakupowe dotyczące urządzeń energochłonnych?', a: data.planyZakupowe || 'Nie podano' }
  ];
  
  questions.forEach(item => {
    content.push({
      text: item.q,
      style: 'question',
      margin: [0, 5, 0, 3]
    });
    content.push({
      text: item.a,
      style: 'answer',
      fillColor: '#f9fafb',
      margin: [0, 0, 0, 8]
    });
    content.push({
      canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#e5e7eb' }],
      margin: [0, 3, 0, 0]
    });
  });
  
  // Signatures
  content.push({
    text: 'Potwierdzenie:',
    style: 'sectionTitle',
    margin: [0, 15, 0, 10]
  });
  
  content.push({
    text: `Data: ${data.data || today}`,
    style: 'normal',
    margin: [0, 0, 0, 5]
  });
  
  content.push({
    text: `Podpis klienta: ${data.podpisKlienta || ''}`,
    style: 'normal',
    margin: [0, 0, 0, 10]
  });
  
  content.push({
    text: '________________________________',
    alignment: 'left',
    margin: [0, 0, 0, 3]
  });
  
  content.push({
    text: 'Podpis klienta',
    style: 'small',
    alignment: 'left',
    margin: [0, 0, 0, 15]
  });
  
  // Note
  content.push({
    text: [
      { text: 'Uwaga: ', bold: true },
      { text: 'dokument ma charakter informacyjny. Odpowiedzi pomogą w doborze optymalnej instalacji.' }
    ],
    style: 'note',
    margin: [0, 10, 0, 0]
  });
  
  return {
    content: content,
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: '#16a34a'
      },
      subheader: {
        fontSize: 11,
        color: '#16a34a'
      },
      dateBox: {
        fontSize: 10,
        bold: true,
        fillColor: '#f0fdf4',
        margin: [0, 5, 0, 5]
      },
      sectionTitle: {
        fontSize: 13,
        bold: true,
        color: '#16a34a'
      },
      question: {
        fontSize: 10,
        bold: true,
        color: '#166534'
      },
      answer: {
        fontSize: 9,
        color: '#374151',
        margin: [5, 5, 5, 5]
      },
      normal: {
        fontSize: 10
      },
      small: {
        fontSize: 8,
        color: '#6b7280'
      },
      note: {
        fontSize: 9,
        fillColor: '#fef3c7',
        color: '#92400e',
        margin: [5, 5, 5, 5]
      }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };
}

function collectChecklistaData() {
  const data = {};
  
  data.daneKlienta = document.getElementById('dane-klienta')?.value || '';
  
  const selectedTypes = [];
  if (document.getElementById('pv-checkbox')?.checked) selectedTypes.push('PV');
  if (document.getElementById('pompa-checkbox')?.checked) selectedTypes.push('Pompa ciepła');
  if (document.getElementById('magazyn-checkbox')?.checked) selectedTypes.push('Magazyn energii');
  data.rodzajInstalacji = selectedTypes.join(', ') || 'Nie wybrano';
  
  data.dataUruchomienia = document.getElementById('data-uruchomienia')?.value || '';
  data.wykonawca = document.getElementById('wykonawca')?.value || '';
  data.produkcjaEnergii = document.getElementById('produkcja-energii')?.value || '';
  data.energiaPobrana = document.getElementById('energia-pobrana')?.value || '';
  data.energiaOddana = document.getElementById('energia-oddana')?.value || '';
  data.ocenaAutokonsumpcji = document.getElementById('ocena-autokonsumpcji')?.value || '';
  data.kontrolaPaneli = document.getElementById('kontrola-paneli')?.value || '';
  data.kontrolaMocowan = document.getElementById('kontrola-mocowan')?.value || '';
  data.kontrolaPrzewodow = document.getElementById('kontrola-przewodow')?.value || '';
  data.stanZabezpieczen = document.getElementById('stan-zabezpieczen')?.value || '';
  data.odczytFalownika = document.getElementById('odczyt-falownika')?.value || '';
  data.napiecie = document.getElementById('napiecie')?.value || '';
  data.prad = document.getElementById('prad')?.value || '';
  data.temperatura = document.getElementById('temperatura')?.value || '';
  data.tempZasilania = document.getElementById('temp-zasilania')?.value || '';
  data.tempPowrotu = document.getElementById('temp-powrotu')?.value || '';
  data.cop = document.getElementById('cop')?.value || '';
  data.kontrolaUziemienia = document.getElementById('kontrola-uziemienia')?.value || '';
  data.mozliwosciRozbudowy = document.getElementById('mozliwosci-rozbudowy')?.value || '';
  data.kalkulacjaPotencjalu = document.getElementById('kalkulacja-potencjalu')?.value || '';
  data.rekomendacje = document.getElementById('rekomendacje')?.value || '';
  data.dodatkowaRekomendacja = document.getElementById('dodatkowa-rekomendacja')?.value || '';
  data.dataPodpisu = document.getElementById('data-podpisu')?.value || '';
  data.podpisKlienta = document.getElementById('podpis-klienta')?.value || '';
  
  return data;
}

function collectWywiadData() {
  const data = {};
  
  data.kosztEnergii = document.getElementById('wywiad-koszt')?.value || '';
  data.liczbOsob = document.getElementById('wywiad-osoby')?.value || '';
  data.zuzyciePradu = document.getElementById('wywiad-zuzycie')?.value || '';
  data.ogrzewanieCieplejWody = document.getElementById('wywiad-woda')?.value || '';
  data.hobby = document.getElementById('wywiad-hobby')?.value || '';
  data.sprzetElektryczny = document.getElementById('wywiad-sprzet')?.value || '';
  data.planyZakupowe = document.getElementById('wywiad-plany')?.value || '';
  data.data = document.getElementById('wywiad-data')?.value || '';
  data.podpisKlienta = document.getElementById('wywiad-podpis')?.value || '';
  
  return data;
}

function showNotification(message) {
  let notification = document.querySelector('.notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4ade80;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      font-weight: 600;
      display: none;
    `;
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.style.display = 'block';
  
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Calculator functions
function oblicz() {
  let zuzycie = parseFloat(document.getElementById('zuzycie').value);
  let orientacja = parseFloat(document.getElementById('orientacja').value);
  let trybMagazynu = document.getElementById('trybMagazynu').value;
  const powierzchniaPanelu = 2.34;
  const limitJednofazowy = 3.68;

  if (isNaN(zuzycie)) {
    showNotification("Podaj roczne zużycie energii!");
    return;
  }

  let mocWstępna = (zuzycie * 1.2) / 1000;
  let panel = mocWstępna <= limitJednofazowy ? 450 : 480;
  let typInstalacji = mocWstępna <= limitJednofazowy ? "jednofazowa" : "trójfazowa";
  let liczbaPaneli = Math.ceil((mocWstępna * 1000) / panel);
  let mocInstalacji = (liczbaPaneli * panel) / 1000;
  let produkcja = mocInstalacji * 1000 * orientacja;
  let powierzchnia = liczbaPaneli * powierzchniaPanelu;

  let magazynPojemnosc;
  if (mocInstalacji <= 5) magazynPojemnosc = 5;
  else if (mocInstalacji > 5 && mocInstalacji <= 9) magazynPojemnosc = 10;
  else magazynPojemnosc = 15;

  let wynik = `
    <b>Typ instalacji:</b> ${typInstalacji}<br>
    <b>Liczba paneli:</b> ${liczbaPaneli} x ${panel} Wp<br>
    <b>Moc instalacji:</b> ${mocInstalacji.toFixed(2)} kWp<br>
    <b>Szacowana roczna produkcja:</b> ${produkcja.toFixed(0)} kWh<br>
    <b>Powierzchnia dachu potrzebna:</b> ${powierzchnia.toFixed(1)} m²<br>
    <b>Magazyn energii:</b> ${magazynPojemnosc} kWh
  `;

  if (trybMagazynu === 'export') {
    wynik += "<br><b>Tryb rozliczenia:</b> Eksport energii do sieci";
  } else {
    wynik += "<br><b>Tryb rozliczenia:</b> Bez eksportu (tylko zużycie lokalne)";
  }

  document.getElementById('wynik').innerHTML = wynik;
  document.getElementById('wynik').style.display = 'block';
  document.getElementById('extra-calc').style.display = 'block';
  ostatniaProdukcja = produkcja;
}

function obliczZwrot() {
  let cenaPradu = parseFloat(document.getElementById('cenaPradu').value);
  let cenaInstalacji = parseFloat(document.getElementById('cenaInstalacji').value);
  let trybKalkulacji = document.getElementById('trybKalkulacji').value;

  if (isNaN(cenaPradu) || isNaN(cenaInstalacji) || ostatniaProdukcja === 0) {
    showNotification("Podaj wszystkie dane do kalkulacji zwrotu!");
    return;
  }

  let lata = 0, oszczednosci = 0, wynikZwrotu = "";

  if (trybKalkulacji === "standardowa") {
    lata = cenaInstalacji / (cenaPradu * ostatniaProdukcja);
    oszczednosci = cenaPradu * ostatniaProdukcja;
    wynikZwrotu = `
      <b>Szacowany okres zwrotu:</b> ${lata.toFixed(1)} lat<br>
      <b>Roczne oszczędności:</b> ${oszczednosci.toFixed(2)} zł
    `;
  } else {
    let suma = 0, cena = cenaPradu;
    while (suma < cenaInstalacji && lata < 50) {
      suma += cena * ostatniaProdukcja;
      cena *= 1.05;
      lata++;
    }
    oszczednosci = suma;
    wynikZwrotu = `
      <b>Szacowany okres zwrotu:</b> ${lata} lat<br>
      <b>Łączne oszczędności w tym czasie:</b> ${oszczednosci.toFixed(2)} zł
    `;
  }
  document.getElementById('extra-result').innerHTML = wynikZwrotu;
}

function obliczAutokonsumpcje() {
  const produkcja = parseFloat(document.getElementById('produkcja').value);
  const eksport = parseFloat(document.getElementById('eksport').value);
  const zuzycieCalkowite = parseFloat(document.getElementById('zuzycie_au').value);
  const wynik = document.getElementById('wynik-auto');

  if (isNaN(produkcja) || produkcja <= 0) {
    pokazBlad("Produkcja musi być większa od 0", wynik);
    return;
  }
  if (isNaN(eksport) || eksport < 0) {
    pokazBlad("Eksport nie może być ujemny", wynik);
    return;
  }
  if (eksport > produkcja) {
    pokazBlad("Eksport nie może przekraczać produkcji!", wynik);
    return;
  }

  const autokonsumpcja = ((produkcja - eksport) / produkcja) * 100;
  const zuzyte = produkcja - eksport;

  let poziom, sugestia, kolorKlasa;
  if (autokonsumpcja < 30) {
    poziom = "NISKA AUTOKONSUMPCJA";
    sugestia = "Konieczna zmiana nawyków w codziennym użytkowaniu urządzeń energochłonnych - edukacja użytkowo-techniczna. <strong>Proponowane rozwiązanie magazyn energii!</strong>";
    kolorKlasa = "background: rgba(239, 68, 68, 0.1); border-left-color: #ef4444;";
  } else if (autokonsumpcja < 60) {
    poziom = "ŚREDNIA AUTOKONSUMPCJA";
    sugestia = "Jest dobrze, ale może być lepiej. <strong>Proponowane rozwiązanie: magazyn energii!</strong>";
    kolorKlasa = "background: rgba(255, 193, 7, 0.1); border-left-color: #ffc107;";
  } else {
    poziom = "WYSOKA AUTOKONSUMPCJA";
    sugestia = "Świetnie! Maksymalizujesz zyski z instalacji fotowoltaicznej. Monitoruj dalej.";
    kolorKlasa = "background: rgba(74, 222, 128, 0.1); border-left-color: #4ade80;";
  }

  wynik.innerHTML = `
    <div style="font-size: 2.2em; font-weight: 700; color: #4ade80; margin-bottom: 10px;">
      ${autokonsumpcja.toFixed(1)}%
    </div>
    <div style="font-weight: 600; font-size: 1.3em; margin-bottom: 15px; color: #86efac;">
      ${poziom}
    </div>
    <div style="font-size: 1.1em; line-height: 1.5; margin-bottom: 20px;">
      ${sugestia}
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 1em;">
      <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
        <div style="color: #86efac; font-weight: 600;">Zużyto z PV</div>
        <div style="font-size: 1.3em; font-weight: 700; color: #4ade80;">${zuzyte.toFixed(2)} kWh</div>
      </div>
      <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
        <div style="color: #86efac; font-weight: 600;">Eksport</div>
        <div style="font-size: 1.3em; font-weight: 700; color: #4ade80;">${eksport.toFixed(2)} kWh</div>
      </div>
    </div>
  `;

  wynik.style.cssText = `
    display: block;
    margin-top: 20px;
    padding: 25px;
    border-radius: 15px;
    border-left: 5px solid;
    font-size: 1.1em;
    line-height: 1.6;
    text-align: center;
    ${kolorKlasa}
  `;

  if (!isNaN(zuzycieCalkowite) && zuzycieCalkowite > 0) {
    const importZSieci = Math.max(0, zuzycieCalkowite - zuzyte);
    const dodatkoweInfo = `
      <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
        <div style="font-size: 1.1em; font-weight: 600; margin-bottom: 10px; color: #86efac;">Dodatkowe informacje:</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.95em;">
          <div>Całkowite zużycie: <strong>${zuzycieCalkowite.toFixed(2)} kWh</strong></div>
          <div>Import z sieci: <strong>${importZSieci.toFixed(2)} kWh</strong></div>
        </div>
      </div>
    `;
    wynik.innerHTML += dodatkoweInfo;
  }
}

function pokazBlad(tekst, element) {
  element.innerHTML = `<strong style="color:#ef4444;">Błąd: ${tekst}</strong>`;
  element.style.cssText = `
    display: block;
    margin-top: 20px;
    padding: 20px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 15px;
    border-left: 5px solid #ef4444;
    font-size: 1.1em;
    line-height: 1.6;
    text-align: center;
  `;
}

// Event listeners
document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
    const currentPage = currentPageStack[currentPageStack.length - 1];
    if (currentPage === 'pv-kalkulator') {
      oblicz();
    } else if (currentPage === 'autokonsumpcja-kalkulator') {
      obliczAutokonsumpcje();
    }
  }
});

document.addEventListener('DOMContentLoaded', function() {
  updateNavigationButtons();
});
