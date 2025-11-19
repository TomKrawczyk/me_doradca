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

let wynikHTML = `
<h4>📊 Wyniki Autokonsumpcji</h4>
<p><strong>Produkcja:</strong> ${produkcja.toFixed(2)} kWh</p>
<p><strong>Eksport do sieci:</strong> ${eksport.toFixed(2)} kWh (${procentEksportu}%)</p>
<p><strong>Autokonsumpcja:</strong> ${autokonsumpcja.toFixed(2)} kWh (${procentAutokonsumpcji}%)</p>
`;

if (!isNaN(zuzycie)) {
const importZSieci = zuzycie - autokonsumpcja;
const procentZuzyciaSieci = ((importZSieci / zuzycie) * 100).toFixed(1);
const procentZuzyciaWlasne = ((autokonsumpcja / zuzycie) * 100).toFixed(1);

wynikHTML += `
<p><strong>Całkowite zużycie:</strong> ${zuzycie.toFixed(2)} kWh</p>
<p><strong>Import z sieci:</strong> ${importZSieci.toFixed(2)} kWh (${procentZuzyciaSieci}%)</p>
<p><strong>Pokrycie własną energią:</strong> ${procentZuzyciaWlasne}%</p>
`;
}

wynikHTML += `
<p style="margin-top: 20px; padding: 15px; background: rgba(74, 222, 128, 0.2); border-radius: 10px;">
<strong>💡 Rekomendacja:</strong> ${procentAutokonsumpcji < 40 ? 
'Niska autokonsumpcja - rozważ magazyn energii lub optymalizację zużycia.' : 
procentAutokonsumpcji < 60 ? 
'Umiarkowana autokonsumpcja - możliwa optymalizacja.' : 
'Wysoka autokonsumpcja - bardzo dobry wynik!'}
</p>
`;

const wynikDiv = document.getElementById('wynik-auto');
wynikDiv.innerHTML = wynikHTML;
wynikDiv.style.display = 'block';
}

function obliczPV() {
const zuzycie = parseFloat(document.getElementById('zuzycie').value);
const mocPanela = parseFloat(document.getElementById('panel').value);
const orientacja = parseFloat(document.getElementById('orientacja').value);
const nachylenie = parseFloat(document.getElementById('nachylenie').value);
const cenaPradu = parseFloat(document.getElementById('cena-pradu').value);

if (isNaN(zuzycie) || isNaN(cenaPradu)) {
alert('Proszę wypełnić wszystkie wymagane pola');
return;
}

const bazowaProdukacja = 1100;
const skorygowanaProdukacja = bazowaProdukacja * orientacja * nachylenie;

const liczbaPaneli = Math.ceil(zuzycie / skorygowanaProdukacja);
const mocInstalacji = (liczbaPaneli * mocPanela / 1000).toFixed(2);
const rocznaProdukcja = (liczbaPaneli * skorygowanaProdukacja).toFixed(0);

const oszczednosciRoczne = (rocznaProdukcja * cenaPradu * 0.7).toFixed(0);
const kosztInstalacji = (mocInstalacji * 4500).toFixed(0);
const zwrotInwestycji = (kosztInstalacji / oszczednosciRoczne).toFixed(1);

const wynikHTML = `
<h4>⚡ Rekomendowana Instalacja</h4>
<p><strong>Liczba paneli:</strong> ${liczbaPaneli} szt. (${mocPanela}Wp każdy)</p>
<p><strong>Moc instalacji:</strong> ${mocInstalacji} kWp</p>
<p><strong>Roczna produkcja:</strong> ~${rocznaProdukcja} kWh</p>
<p><strong>Szacunkowy koszt:</strong> ~${kosztInstalacji} zł</p>
<p><strong>Oszczędności roczne:</strong> ~${oszczednosciRoczne} zł</p>
<p><strong>Zwrot inwestycji:</strong> ~${zwrotInwestycji} lat</p>
<p style="margin-top: 20px; padding: 15px; background: rgba(74, 222, 128, 0.2); border-radius: 10px;">
<strong>💰 Podsumowanie:</strong> Instalacja ${mocInstalacji} kWp pokryje około ${((rocznaProdukcja / zuzycie) * 100).toFixed(0)}% Twojego zużycia energii.
</p>
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
