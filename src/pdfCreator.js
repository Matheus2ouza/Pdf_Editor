document.addEventListener('DOMContentLoaded', () => {
    // Seleciona o botão de download e o input de arquivo
    const downloadButton = document.querySelector('#download-pdf');
    const fileInput = document.querySelector('.file-input');

    if (downloadButton) {
        // Adiciona um ouvinte de evento de clique ao botão de download
        downloadButton.addEventListener('click', () => {
            // Obtém a biblioteca jsPDF do objeto global
            const { jsPDF } = window.jspdf;

            // Verifica se jsPDF foi carregado corretamente
            if (!jsPDF) {
                console.error('jsPDF não está carregado.');
                return;
            }

            // Cria uma nova instância do jsPDF
            const doc = new jsPDF();

            // Define a fonte e o tamanho da fonte para o documento PDF
            doc.setFont('helvetica');
            doc.setFontSize(10);

            // Seleciona a lista de inscrições
            const inscriptionsList = document.querySelector('#inscriptions-list');
            if (!inscriptionsList) {
                console.error('Elemento #inscriptions-list não encontrado.');
                return;
            }

            // Seleciona todos os itens da lista
            const listItems = inscriptionsList.querySelectorAll('li');

            const margin = 10; // Margem superior e lateral
            const lineHeight = 8; // Altura da linha
            const bottomMargin = 15; // Margem inferior
            const pageHeight = doc.internal.pageSize.height; // Altura da página PDF
            let y = margin; // Posição inicial vertical

            // Itera sobre cada item da lista
            listItems.forEach((li, index) => {
                // Verifica se a próxima linha ultrapassará a margem inferior
                if (y + lineHeight > pageHeight - bottomMargin) {
                    doc.addPage(); // Adiciona uma nova página se necessário
                    y = margin; // Redefine a posição vertical para a margem superior
                }

                doc.text(li.textContent, margin, y);
                y += lineHeight; // Atualiza a posição vertical para o próximo item
            });

            // Salva o PDF com o nome especificado
            doc.save('Sem_Nome.pdf');

            if (fileInput) {
                fileInput.value = '';
            }
        });
    }
});
