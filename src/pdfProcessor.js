document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.querySelector('.file-input');
    const createListButton = document.querySelector('.create-list');
    const contentContainer = document.getElementById('content-container');

    createListButton.addEventListener('click', () => {
        // Função para exibir o conteúdo
        document.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden'));
        if (fileInput) {
            fileInput.value = '';
        }
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function () {
                const typedarray = new Uint8Array(this.result);

                // Carrega o PDF usando pdf.js
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '/';
                }

                createAndDisplayContent(fullText);
            };
            reader.readAsArrayBuffer(file);
        }
    });

    function createAndDisplayContent(fullText) {
        const parts = fullText.split('/').map(part => part.trim()).filter(part => part.length > 0);

        const inscriptions = [];
        const incompleteItems = [];

        parts.forEach(part => {
            const [number, ...remainingParts] = part.split(',').map(part => part.trim());

            let classification;
            let name;

            if (isNaN(remainingParts[remainingParts.length - 1])) {
                name = remainingParts.join(',');
                classification = null;
            } else {
                classification = remainingParts.pop().trim();
                name = remainingParts.join(',');
            }

            const formattedNumber = number.replace(/\s+/g, '');
            const formattedName = name.replace(/\s{2,}/g, ' ').trim();

            if (formattedNumber && formattedName) {
                inscriptions.push({ number: formattedNumber, name: formattedName, classification });
            } else {
                incompleteItems.push({ number: formattedNumber || 'N/A', name: formattedName || 'N/A' });
            }
        });

        // Ordena as inscrições com base na classificação, se disponível
        inscriptions.sort((a, b) => (a.classification || Number.MAX_VALUE) - (b.classification || Number.MAX_VALUE));

        // Cria uma nova div para exibir o conteúdo
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('file-content');
        contentDiv.classList.add('hidden'); // Inicialmente oculto

        // Cria a lista de inscrições
        const inscriptionsList = document.createElement('ul');
        inscriptionsList.id = 'inscriptions-list';
        inscriptionsList.innerHTML = inscriptions.map(entry => {
            const index = entry.classification || inscriptions.indexOf(entry) + 1;
            return `<li>${index}- Número: ${entry.number}, Nome: ${entry.name}${entry.classification ? ', Classificação: ' + entry.classification : ''}</li>`;
        }).join('');
        contentDiv.appendChild(inscriptionsList);

        // Cria a lista de itens incompletos
        const incompleteDiv = document.createElement('div');
        incompleteDiv.classList.add('incomplete-content');
        const incompleteList = document.createElement('ul');
        incompleteList.id = 'incomplete-list';
        incompleteList.innerHTML = incompleteItems.map((entry, index) => {
            return `<li>${index + 1}- Número: ${entry.number}, Nome: ${entry.name}</li>`;
        }).join('');
        incompleteDiv.appendChild(incompleteList);

        // Cria o parágrafo de contagem total
        const totalCountElement = document.createElement('p');
        totalCountElement.id = 'total-count';
        totalCountElement.textContent = `Total de pessoas: ${inscriptions.length}`;

        // Cria o parágrafo de contagem de itens incompletos
        const incompleteCountElement = document.createElement('p');
        incompleteCountElement.id = 'incomplete-count';
        incompleteCountElement.textContent = `Itens incompletos: ${incompleteItems.length}`;

        // Adiciona os novos elementos ao contêiner
        contentDiv.appendChild(totalCountElement);
        contentDiv.appendChild(incompleteCountElement);
        contentDiv.appendChild(incompleteDiv);
        contentContainer.appendChild(contentDiv);
        
    }
});
