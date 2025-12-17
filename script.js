let currentPageStack = ['main-menu'];
let ostatniaProdukcja = 0;

const navigationSequences = {
    checklista: ['submenu-checklista', 'checklista-start'],
    wywiad: ['submenu-wywiad', 'wywiad-pytania'],
    edukacja: ['submenu-edukacja', 'edukacja-dzialanie']
};

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

// Store last calculation results for PDF generation
let lastAutokonsumpcjaResults = null;
let lastPVResults = null;

function obliczAutokonsumpcje() {
    const produkcja = parseFloat(document.getElementById('produkcja').value);
    const eksport = parseFloat(document.getElementById('eksport').value);
    const zuzycie = parseFloat(document.getElementById('zuzycie_au').value);
    
    if (isNaN(produkcja) || isNaN(eksport)) {
        alert('Proszę wypełnić wymagane pola: Produkcja i Eksport');
        return;
    }
    
    const autokonsumpcja = produkcja - eksport;
    const procentAutokonsumpcji = ((autokonsumpcja / produkcja) * 100).toFixed(1);
    const procentEksportu = ((eksport / produkcja) * 100).toFixed(1);
    
    // Store results for PDF
    lastAutokonsumpcjaResults = {
        produkcja: produkcja,
        eksport: eksport,
        zuzycie: zuzycie,
        autokonsumpcja: autokonsumpcja,
        procentAutokonsumpcji: procentAutokonsumpcji,
        procentEksportu: procentEksportu
    };
    
    // Determine card type based on percentage
    let cardClass = '';
    let statusTitle = '';
    let statusMessage = '';
    let recommendation = '';
    
    if (procentAutokonsumpcji < 30) {
        cardClass = 'result-card-red';
        statusTitle = '🔴 Niska autokonsumpcja';
        statusMessage = 'Wymagana edukacja oraz zmiana korzystania z urządzeń energochłonnych.';
        recommendation = 'Proponowane rozwiązanie: magazyn energii';
    } else if (procentAutokonsumpcji >= 30 && procentAutokonsumpcji < 60) {
        cardClass = 'result-card-yellow';
        statusTitle = '🟡 Średnia autokonsumpcja';
        statusMessage = 'Nie jest źle, ale może być lepiej!';
        recommendation = 'Edukacja i rozważ montaż magazynu energii';
    } else {
        cardClass = 'result-card-green';
        statusTitle = '🟢 Świetnie!';
        statusMessage = 'Autokonsumpcja na wysokim poziomie.';
        recommendation = 'Gratulacje!';
    }
    
    lastAutokonsumpcjaResults.statusTitle = statusTitle;
    lastAutokonsumpcjaResults.statusMessage = statusMessage;
    lastAutokonsumpcjaResults.recommendation = recommendation;
    
    let wynikHTML = `
        <div class="result-main-card ${cardClass}">
            <div class="result-status-title">${statusTitle}</div>
            <div class="result-percentage-huge">${procentAutokonsumpcji}%</div>
            <div class="result-percentage-label">AUTOKONSUMPCJI</div>
            <div class="result-status-message">${statusMessage}</div>
            <div class="result-recommendation">${recommendation}</div>
        </div>
        
        <div class="result-details-section">
            <h4>📊 Szczegóły energetyczne</h4>
            <div class="detail-row">
                <span class="detail-label">Produkcja prądu:</span>
                <span class="detail-value">${produkcja.toFixed(1)} kWh</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Autokonsumpcja:</span>
                <span class="detail-value">${autokonsumpcja.toFixed(1)} kWh</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Eksport do sieci:</span>
                <span class="detail-value">${eksport.toFixed(1)} kWh (${procentEksportu}%)</span>
            </div>
        </div>
    `;
    
    if (!isNaN(zuzycie)) {
        const importZSieci = zuzycie - autokonsumpcja;
        const procentZuzyciaSieci = ((importZSieci / zuzycie) * 100).toFixed(1);
        const procentZuzyciaWlasne = ((autokonsumpcja / zuzycie) * 100).toFixed(1);
        
        lastAutokonsumpcjaResults.importZSieci = importZSieci;
        lastAutokonsumpcjaResults.procentZuzyciaSieci = procentZuzyciaSieci;
        lastAutokonsumpcjaResults.procentZuzyciaWlasne = procentZuzyciaWlasne;
        
        wynikHTML += `
            <div class="result-details-section">
                <h4>📈 Analiza zużycia</h4>
                <div class="detail-row">
                    <span class="detail-label">Całkowite zużycie domu:</span>
                    <span class="detail-value">${zuzycie.toFixed(1)} kWh</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Import z sieci:</span>
                    <span class="detail-value">${importZSieci.toFixed(1)} kWh (${procentZuzyciaSieci}%)</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Pokrycie własną energią:</span>
                    <span class="detail-value highlight-value">${procentZuzyciaWlasne}%</span>
                </div>
            </div>
        `;
    }
    
    wynikHTML += `
        <button class="btn" onclick="generatePDF('autokonsumpcja')">Pobierz PDF</button>
    `;
    
    const wynikDiv = document.getElementById('wynik-auto');
    wynikDiv.innerHTML = wynikHTML;
    wynikDiv.style.display = 'block';
}

function obliczPV() {
    const zuzycie = parseFloat(document.getElementById('zuzycie').value);
    const orientacja = parseFloat(document.getElementById('orientacja').value);
    const cenaPradu = parseFloat(document.getElementById('cena-pradu').value);
    const cenaHandlowca = parseFloat(document.getElementById('cena-handlowca').value);
    
    if (isNaN(zuzycie) || isNaN(cenaPradu)) {
        alert('Proszę wypełnić wszystkie wymagane pola');
        return;
    }
    
    // Produkcja energii na 1 kWp mocy (skorygowana o orientację)
    const produkcjaNaKwp = 1000 * orientacja; // kWh/kWp/rok dla Polski
    
    // Obliczenie wymaganej mocy instalacji (z 20% zapasem na straty)
    const wymaganaMocKw = (zuzycie * 1.2) / produkcjaNaKwp;
    
    // Dobór odpowiednich paneli w zależności od wymaganej mocy
    let mocPanela, liczbaPaneli, mocInstalacji;
    
    if (wymaganaMocKw <= 3.68) {
        // Dla instalacji do 3.68 kWp używamy paneli 450Wp
        mocPanela = 450;
        liczbaPaneli = Math.ceil((wymaganaMocKw * 1000) / mocPanela);
        // Ograniczenie do maksymalnie 8 paneli (3.6 kWp)
        if (liczbaPaneli > 8) {
            liczbaPaneli = 8;
        }
    } else {
        // Dla instalacji powyżej 3.68 kWp używamy paneli 480Wp
        mocPanela = 480;
        liczbaPaneli = Math.ceil((wymaganaMocKw * 1000) / mocPanela);
    }
    
    mocInstalacji = (liczbaPaneli * mocPanela / 1000).toFixed(2);
    const rocznaProdukcja = (mocInstalacji * produkcjaNaKwp).toFixed(0);
    
    // Użyj ceny handlowca jeśli podana, w przeciwnym razie domyślna cena instalacji
    const kosztInstalacji = !isNaN(cenaHandlowca) ? cenaHandlowca : (parseFloat(mocInstalacji) * 4500); // 4500 zł/kWp jako domyślna cena
    
    // Obliczenie zwrotu z realistycznym wzrostem ceny prądu 5% rocznie
    const oszczednosciRoczne = rocznaProdukcja * cenaPradu * 0.7; // 70% autokonsumpcji
    
    // Obliczenie zwrotu z uwzględnieniem 5% wzrostu ceny prądu rocznie
    let sumaOszczednosci = 0;
    let rokZwrotu = 0;
    
    for (let rok = 1; rok <= 25; rok++) {
        const cenaPraduWRoku = cenaPradu * Math.pow(1.05, rok - 1); // 5% wzrost rocznie
        const oszczednosciWRoku = rocznaProdukcja * cenaPraduWRoku * 0.7;
        sumaOszczednosci += oszczednosciWRoku;
        
        if (sumaOszczednosci >= kosztInstalacji && rokZwrotu === 0) {
            rokZwrotu = rok;
        }
    }
    
    const rekomendacjaMagazynu = `Rekomendacja: Magazyn energii o pojemności dopasowanej do instalacji PV (${mocInstalacji} kWp), np. ${Math.ceil(parseFloat(mocInstalacji) * 2)} kWh, aby maksymalizować autokonsumpcję i niezależność energetyczną.`;
    
    // Get selected orientation text
    const orientacjaSelect = document.getElementById('orientacja');
    const orientacjaText = orientacjaSelect.options[orientacjaSelect.selectedIndex].text;
    
    // Store results for PDF
    lastPVResults = {
        zuzycie: zuzycie,
        orientacja: orientacja,
        orientacjaText: orientacjaText,
        cenaPradu: cenaPradu,
        cenaHandlowca: cenaHandlowca,
        liczbaPaneli: liczbaPaneli,
        mocPanela: mocPanela,
        mocInstalacji: mocInstalacji,
        rocznaProdukcja: rocznaProdukcja,
        kosztInstalacji: kosztInstalacji,
        oszczednosciRoczne: oszczednosciRoczne,
        rokZwrotu: rokZwrotu,
        pokrycieZuzycia: ((rocznaProdukcja / zuzycie) * 100).toFixed(0),
        rekomendacjaMagazynu: rekomendacjaMagazynu
    };
    
    const wynikHTML = `
        <div class="result-header">
            <div class="result-title">⚡ Rekomendowana Instalacja</div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${liczbaPaneli}</div>
                <div class="stat-label">Paneli <span class="stat-unit">${mocPanela}Wp</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${mocInstalacji}</div>
                <div class="stat-label">Moc <span class="stat-unit">kWp</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${rocznaProdukcja}</div>
                <div class="stat-label">Produkcja <span class="stat-unit">kWh/rok</span></div>
            </div>
            <div class="stat-card highlight-card">
                <div class="stat-number percentage-highlight">${rokZwrotu}</div>
                <div class="stat-label">Zwrot inwestycji <span class="stat-unit">lat</span></div>
            </div>
        </div>
        
        <div class="extra-result">
            <h4>💰 Analiza finansowa</h4>
            <p><strong>Koszt instalacji:</strong> ${kosztInstalacji.toLocaleString('pl-PL')} zł ${!isNaN(cenaHandlowca) ? '(cena handlowca)' : '(szacunkowa)'}</p>
            <p><strong>Oszczędności w 1. roku:</strong> ~${Math.round(oszczednosciRoczne).toLocaleString('pl-PL')} zł</p>
            <p><strong>Pokrycie zużycia:</strong> ${((rocznaProdukcja / zuzycie) * 100).toFixed(0)}%</p>
            <p><strong>Wzrost ceny prądu:</strong> 5% rocznie (realistyczne założenie)</p>
        </div>
        
        <div class="recommendation-box">
            <strong>🔋 ${rekomendacjaMagazynu}</strong>
        </div>
        
        <button class="btn" onclick="generatePDF('pv')">Pobierz PDF</button>
    `;
    
    const wynikDiv = document.getElementById('wynik-pv');
    wynikDiv.innerHTML = wynikHTML;
    wynikDiv.style.display = 'block';
}

function generatePDF(type) {
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = 'Generowanie PDF...';
    button.disabled = true;
    
    try {
        let filename, docDefinition;
        
        if (type === 'checklista') {
            const formData = collectChecklistaData();
            filename = `Checklista_Doradcy_${new Date().toISOString().slice(0, 10)}.pdf`;
            docDefinition = generateChecklistaPDF(formData);
        } else if (type === 'wywiad') {
            const formData = collectWywiadData();
            filename = `Wywiad_Klienta_${new Date().toISOString().slice(0, 10)}.pdf`;
            docDefinition = generateWywiadPDF(formData);
        } else if (type === 'autokonsumpcja') {
            if (!lastAutokonsumpcjaResults) {
                alert('Brak wyników do wygenerowania PDF. Proszę najpierw obliczyć autokonsumpcję.');
                button.textContent = originalText;
                button.disabled = false;
                return;
            }
            filename = `Kalkulator_Autokonsumpcji_${new Date().toISOString().slice(0, 10)}.pdf`;
            docDefinition = generateAutokonsumpcjaPDF(lastAutokonsumpcjaResults);
        } else if (type === 'pv') {
            if (!lastPVResults) {
                alert('Brak wyników do wygenerowania PDF. Proszę najpierw obliczyć instalację PV.');
                button.textContent = originalText;
                button.disabled = false;
                return;
            }
            filename = `Kalkulator_PV_${new Date().toISOString().slice(0, 10)}.pdf`;
            docDefinition = generatePVPDF(lastPVResults);
        }
        
        pdfMake.createPdf(docDefinition).download(filename);
        
        button.textContent = originalText;
        button.disabled = false;
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        button.textContent = originalText;
        button.disabled = false;
        alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
    }
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

function generateChecklistaPDF(data) {
    const today = new Date().toLocaleDateString('pl-PL');
    const content = [
        { text: 'CHECKLISTA DORADCY TECHNICZNEGO', style: 'header', alignment: 'center', margin: [0, 0, 0, 5] },
        { text: 'Analiza i modernizacja instalacji', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
        { text: `Data wizyty: ${data.dataPodpisu || today}`, style: 'dateBox', margin: [0, 0, 0, 15] },
        { text: 'Wizyta u klienta - pierwsze kroki', style: 'sectionTitle', margin: [0, 0, 0, 10] }
    ];
    
    const items = [
        { label: '1. Dane klienta i lokalizacji:', value: data.daneKlienta || 'Nie podano' },
        { label: '2. Rodzaj instalacji:', value: data.rodzajInstalacji },
        { label: '3. Data uruchomienia i wykonawca:', value: `Data: ${data.dataUruchomienia || 'Nie podano'} | Wykonawca: ${data.wykonawca || 'Nie podano'}` },
        { label: '4. Roczna produkcja energii [kWh]:', value: data.produkcjaEnergii || 'Nie podano' },
        { label: '5. Roczne zużycie / eksport w budynku [kWh]:', value: `1.8.0: ${data.energiaPobrana || 'Nie podano'} kWh | 2.8.0: ${data.energiaOddana || 'Nie podano'} kWh` },
        { label: '6. Ocena autokonsumpcji i bilansu z siecią:', value: data.ocenaAutokonsumpcji || 'Nie podano' },
        { label: '7. Wizualna kontrola paneli/modułów:', value: data.kontrolaPaneli || 'Nie podano' },
        { label: '8. Wizualna kontrola mocowań i konstrukcji nośnej:', value: data.kontrolaMocowan || 'Nie podano' },
        { label: '9. Wizualne sprawdzenie przewodów DC/AC, połączeń MC4:', value: data.kontrolaPrzewodow || 'Nie podano' },
        { label: '10. Wizualny stan zabezpieczeń: SPD, RCD, wyłącznik:', value: data.stanZabezpieczen || 'Nie podano' },
        { label: '11. Odczyt falownika: błędy, produkcja, komunikacja:', value: data.odczytFalownika || 'Nie podano' },
        { label: '12. Wizualna kontrola uziemienia i ciągłości przewodów ochronnych :', value: data.kontrolaUziemienia || 'Nie podano' },
        { label: '13. Ocena możliwości rozbudowy: miejsce, przyłącze, ograniczenia :', value: data.mozliwosciRozbudowy || 'Nie podano' },
        { label: '14. Wstępna kalkulacja potencjału modernizacji:', value: data.kalkulacjaPotencjalu || 'Nie podano' },
        { label: '15. Rekomendacje:', value: data.rekomendacje || 'Nie podano' },
        { label: '16. Dodatkowa rekomendacja:', value: data.dodatkowaRekomendacja || 'Nie podano' }
    ];
    
    items.forEach(item => {
        content.push({ text: item.label, style: 'itemLabel', margin: [0, 8, 0, 3] });
        content.push({ text: item.value, style: 'itemValue', margin: [10, 0, 0, 8] });
    });
    
    content.push({ text: 'Podpisy:', style: 'sectionTitle', margin: [0, 20, 0, 15] });
    content.push({ text: `Data: ${data.dataPodpisu || today}     Podpis klienta: ${data.podpisKlienta || ''}`, margin: [0, 0, 0, 15] });
    
    return {
        content: content,
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        styles: {
            header: { fontSize: 20, bold: true, color: '#16a34a' },
            subheader: { fontSize: 12, color: '#16a34a' },
            dateBox: { fontSize: 11, bold: true },
            sectionTitle: { fontSize: 14, bold: true, color: '#16a34a' },
            itemLabel: { fontSize: 10, bold: true, color: '#166534' },
            itemValue: { fontSize: 10, color: '#374151' }
        },
        defaultStyle: { font: 'Roboto' }
    };
}

function generateWywiadPDF(data) {
    const today = new Date().toLocaleDateString('pl-PL');
    const content = [
        { text: 'WYWIAD Z KLIENTEM', style: 'header', alignment: 'center', margin: [0, 0, 0, 5] },
        { text: 'Analiza potrzeb energetycznych', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
        { text: `Data wywiadu: ${data.data || today}`, style: 'dateBox', margin: [0, 0, 0, 15] },
        { text: 'Kluczowe pytania', style: 'sectionTitle', margin: [0, 0, 0, 10] }
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
        content.push({ text: item.q, style: 'question', margin: [0, 8, 0, 5] });
        content.push({ text: item.a, style: 'answer', margin: [0, 0, 0, 10] });
    });
    
    content.push({ text: `Data: ${data.data || today}     Podpis klienta: ${data.podpisKlienta || ''}`, margin: [0, 20, 0, 0] });
    
    return {
        content: content,
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        styles: {
            header: { fontSize: 20, bold: true, color: '#16a34a' },
            subheader: { fontSize: 12, color: '#16a34a' },
            dateBox: { fontSize: 11, bold: true },
            sectionTitle: { fontSize: 14, bold: true, color: '#16a34a' },
            question: { fontSize: 11, bold: true, color: '#166534' },
            answer: { fontSize: 10, color: '#374151' }
        },
        defaultStyle: { font: 'Roboto' }
    };
}

function generateAutokonsumpcjaPDF(data) {
    const today = new Date().toLocaleDateString('pl-PL');
    const content = [
        { text: 'KALKULATOR AUTOKONSUMPCJI', style: 'header', alignment: 'center', margin: [0, 0, 0, 5] },
        { text: 'Wyniki obliczeń', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
        { text: `Data: ${today}`, style: 'dateBox', margin: [0, 0, 0, 15] },
        
        // Status section
        { text: data.statusTitle, style: 'statusTitle', alignment: 'center', margin: [0, 10, 0, 10] },
        { text: `${data.procentAutokonsumpcji}% AUTOKONSUMPCJI`, style: 'percentageHuge', alignment: 'center', margin: [0, 0, 0, 10] },
        { text: data.statusMessage, style: 'statusMessage', alignment: 'center', margin: [0, 0, 0, 10] },
        { text: data.recommendation, style: 'recommendation', alignment: 'center', margin: [0, 0, 0, 20] },
        
        // Details section
        { text: 'Szczegóły energetyczne', style: 'sectionTitle', margin: [0, 15, 0, 10] }
    ];
    
    const details = [
        { label: 'Produkcja prądu:', value: `${data.produkcja.toFixed(1)} kWh` },
        { label: 'Autokonsumpcja:', value: `${data.autokonsumpcja.toFixed(1)} kWh` },
        { label: 'Eksport do sieci:', value: `${data.eksport.toFixed(1)} kWh (${data.procentEksportu}%)` }
    ];
    
    details.forEach(item => {
        content.push({
            columns: [
                { text: item.label, style: 'detailLabel', width: '50%' },
                { text: item.value, style: 'detailValue', width: '50%', alignment: 'right' }
            ],
            margin: [0, 5, 0, 5]
        });
    });
    
    if (!isNaN(data.zuzycie)) {
        content.push({ text: 'Analiza zużycia', style: 'sectionTitle', margin: [0, 15, 0, 10] });
        
        const zusycieDetails = [
            { label: 'Całkowite zużycie domu:', value: `${data.zuzycie.toFixed(1)} kWh` },
            { label: 'Import z sieci:', value: `${data.importZSieci.toFixed(1)} kWh (${data.procentZuzyciaSieci}%)` },
            { label: 'Pokrycie własną energią:', value: `${data.procentZuzyciaWlasne}%` }
        ];
        
        zusycieDetails.forEach(item => {
            content.push({
                columns: [
                    { text: item.label, style: 'detailLabel', width: '50%' },
                    { text: item.value, style: 'detailValue', width: '50%', alignment: 'right' }
                ],
                margin: [0, 5, 0, 5]
            });
        });
    }
    
    return {
        content: content,
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        styles: {
            header: { fontSize: 20, bold: true, color: '#16a34a' },
            subheader: { fontSize: 12, color: '#16a34a' },
            dateBox: { fontSize: 11, bold: true },
            statusTitle: { fontSize: 18, bold: true, color: '#16a34a' },
            percentageHuge: { fontSize: 36, bold: true, color: '#22c55e' },
            statusMessage: { fontSize: 12, color: '#374151' },
            recommendation: { fontSize: 11, bold: true, color: '#166534' },
            sectionTitle: { fontSize: 14, bold: true, color: '#16a34a' },
            detailLabel: { fontSize: 10, color: '#374151' },
            detailValue: { fontSize: 10, bold: true, color: '#16a34a' }
        },
        defaultStyle: { font: 'Roboto' }
    };
}

function generatePVPDF(data) {
    const today = new Date().toLocaleDateString('pl-PL');
    const content = [
        { text: 'KALKULATOR INSTALACJI PV', style: 'header', alignment: 'center', margin: [0, 0, 0, 5] },
        { text: 'Rekomendowana instalacja fotowoltaiczna', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
        { text: `Data: ${today}`, style: 'dateBox', margin: [0, 0, 0, 15] },
        
        // Input parameters
        { text: 'Parametry wejściowe', style: 'sectionTitle', margin: [0, 10, 0, 10] }
    ];
    
    const inputParams = [
        { label: 'Roczne zużycie energii:', value: `${data.zuzycie.toFixed(0)} kWh` },
        { label: 'Orientacja dachu:', value: data.orientacjaText },
        { label: 'Cena prądu:', value: `${data.cenaPradu.toFixed(2)} zł/kWh` }
    ];
    
    if (!isNaN(data.cenaHandlowca)) {
        inputParams.push({ label: 'Cena instalacji (handlowiec):', value: `${data.cenaHandlowca.toLocaleString('pl-PL')} zł` });
    }
    
    inputParams.forEach(item => {
        content.push({
            columns: [
                { text: item.label, style: 'detailLabel', width: '50%' },
                { text: item.value, style: 'detailValue', width: '50%', alignment: 'right' }
            ],
            margin: [0, 5, 0, 5]
        });
    });
    
    // Recommended installation
    content.push({ text: 'Rekomendowana instalacja', style: 'sectionTitle', margin: [0, 15, 0, 10] });
    
    const installation = [
        { label: 'Liczba paneli:', value: `${data.liczbaPaneli} x ${data.mocPanela}Wp` },
        { label: 'Moc instalacji:', value: `${data.mocInstalacji} kWp` },
        { label: 'Roczna produkcja:', value: `${data.rocznaProdukcja} kWh/rok` }
    ];
    
    installation.forEach(item => {
        content.push({
            columns: [
                { text: item.label, style: 'detailLabel', width: '50%' },
                { text: item.value, style: 'detailValue', width: '50%', alignment: 'right' }
            ],
            margin: [0, 5, 0, 5]
        });
    });
    
    // Financial analysis
    content.push({ text: 'Analiza finansowa', style: 'sectionTitle', margin: [0, 15, 0, 10] });
    
    const financial = [
        { label: 'Koszt instalacji:', value: `${data.kosztInstalacji.toLocaleString('pl-PL')} zł` },
        { label: 'Oszczędności w 1. roku:', value: `~${Math.round(data.oszczednosciRoczne).toLocaleString('pl-PL')} zł` },
        { label: 'Pokrycie zużycia:', value: `${data.pokrycieZuzycia}%` },
        { label: 'Zwrot inwestycji:', value: `${data.rokZwrotu} lat` },
        { label: 'Wzrost ceny prądu:', value: '5% rocznie' }
    ];
    
    financial.forEach(item => {
        content.push({
            columns: [
                { text: item.label, style: 'detailLabel', width: '50%' },
                { text: item.value, style: 'detailValue', width: '50%', alignment: 'right' }
            ],
            margin: [0, 5, 0, 5]
        });
    });
    
    // Recommendation
    content.push({ text: 'Rekomendacja', style: 'sectionTitle', margin: [0, 15, 0, 10] });
    content.push({ text: data.rekomendacjaMagazynu, style: 'recommendation', margin: [0, 0, 0, 10] });
    
    return {
        content: content,
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        styles: {
            header: { fontSize: 20, bold: true, color: '#16a34a' },
            subheader: { fontSize: 12, color: '#16a34a' },
            dateBox: { fontSize: 11, bold: true },
            sectionTitle: { fontSize: 14, bold: true, color: '#16a34a' },
            detailLabel: { fontSize: 10, color: '#374151' },
            detailValue: { fontSize: 10, bold: true, color: '#16a34a' },
            recommendation: { fontSize: 10, color: '#374151', italics: true }
        },
        defaultStyle: { font: 'Roboto' }
    };
}

let canvas, ctx;
let isDrawing = false;
let startX, startY;
let currentTool = 'pen';
let strokeColor = '#000000';
let fillColor = '#4ade80';
let lineWidth = 2;
let useFill = false;
let drawingHistory = [];

function resizeCanvas() {
    if (!canvas) return;
    
    const container = canvas.parentElement;
    const containerWidth = container.offsetWidth;
    let imageData = null;
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    if (ctx && oldWidth > 0 && oldHeight > 0) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = oldWidth;
        tempCanvas.height = oldHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);
        imageData = tempCanvas;
    }
    
    if (window.innerWidth <= 768) {
        const newWidth = Math.min(containerWidth - 40, 600);
        const newHeight = Math.floor(newWidth * 0.6);
        canvas.width = newWidth;
        canvas.height = newHeight;
    } else {
        canvas.width = 1000;
        canvas.height = 600;
    }
    
    if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (imageData) {
            ctx.drawImage(imageData, 0, 0, oldWidth, oldHeight, 0, 0, canvas.width, canvas.height);
        }
    }
}

function initCanvas() {
    canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    document.getElementById('drawing-tool')?.addEventListener('change', (e) => {
        currentTool = e.target.value;
        canvas.style.cursor = currentTool === 'eraser' ? 'not-allowed' : 'crosshair';
    });
    
    document.getElementById('stroke-color')?.addEventListener('change', (e) => {
        strokeColor = e.target.value;
    });
    
    document.getElementById('fill-color')?.addEventListener('change', (e) => {
        fillColor = e.target.value;
    });
    
    document.getElementById('fill-checkbox')?.addEventListener('change', (e) => {
        useFill = e.target.checked;
    });
    
    document.getElementById('line-width')?.addEventListener('input', (e) => {
        lineWidth = e.target.value;
        document.getElementById('line-width-value').textContent = lineWidth;
    });
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    isDrawing = true;
    startX = x;
    startY = y;
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
    
    if (currentTool !== 'pen' && currentTool !== 'eraser') {
        drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    if (currentTool === 'pen') {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    } else if (currentTool === 'eraser') {
        ctx.clearRect(currentX - lineWidth / 2, currentY - lineWidth / 2, lineWidth * 2, lineWidth * 2);
    } else {
        if (drawingHistory.length > 0) {
            ctx.putImageData(drawingHistory[drawingHistory.length - 1], 0, 0);
        }
        
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = lineWidth;
        
        if (currentTool === 'line') {
            drawLine(startX, startY, currentX, currentY);
        } else if (currentTool === 'rectangle') {
            drawRectangle(startX, startY, currentX, currentY);
        } else if (currentTool === 'circle') {
            drawCircle(startX, startY, currentX, currentY);
        } else if (currentTool === 'arrow') {
            drawArrow(startX, startY, currentX, currentY);
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (isDrawing && currentTool !== 'pen' && currentTool !== 'eraser') {
        drawingHistory.pop();
    }
    isDrawing = false;
    ctx.beginPath();
}

function startDrawing(e) {
    isDrawing = true;
    const pos = getMousePos(e);
    startX = pos.x;
    startY = pos.y;
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
    
    if (currentTool !== 'pen' && currentTool !== 'eraser') {
        drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    const currentX = pos.x;
    const currentY = pos.y;
    
    if (currentTool === 'pen') {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
    } else if (currentTool === 'eraser') {
        ctx.clearRect(currentX - lineWidth / 2, currentY - lineWidth / 2, lineWidth * 2, lineWidth * 2);
    } else {
        if (drawingHistory.length > 0) {
            ctx.putImageData(drawingHistory[drawingHistory.length - 1], 0, 0);
        }
        
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.lineWidth = lineWidth;
        
        if (currentTool === 'line') {
            drawLine(startX, startY, currentX, currentY);
        } else if (currentTool === 'rectangle') {
            drawRectangle(startX, startY, currentX, currentY);
        } else if (currentTool === 'circle') {
            drawCircle(startX, startY, currentX, currentY);
        } else if (currentTool === 'arrow') {
            drawArrow(startX, startY, currentX, currentY);
        }
    }
}

function stopDrawing() {
    if (isDrawing && currentTool !== 'pen' && currentTool !== 'eraser') {
        drawingHistory.pop();
    }
    isDrawing = false;
    ctx.beginPath();
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawRectangle(x1, y1, x2, y2) {
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.beginPath();
    ctx.rect(x1, y1, width, height);
    if (useFill) ctx.fill();
    ctx.stroke();
}

function drawCircle(x1, y1, x2, y2) {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    if (useFill) ctx.fill();
    ctx.stroke();
}

function drawArrow(x1, y1, x2, y2) {
    const headLength = 15 + lineWidth;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function clearCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistory = [];
}

function saveAsImage(format) {
    if (!canvas) return;
    
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `schemat_pv_${timestamp}.${format}`;
    
    if (format === 'jpg' || format === 'jpeg') {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(canvas, 0, 0);
        link.href = tempCanvas.toDataURL('image/jpeg', 0.95);
    } else {
        link.href = canvas.toDataURL('image/png');
    }
    
    link.click();
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavigationButtons();
    initCanvas();
});
